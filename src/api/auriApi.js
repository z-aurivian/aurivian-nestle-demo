/**
 * Single backend for Auri: multi-ingredient RAG + Claude/OpenAI.
 * Tries Claude first, then OpenAI; falls back to keyword answers if no keys or both fail.
 * v2: Multi-ingredient detection, study-level RAG, citation support.
 */

import { INGREDIENT_DATA } from '../data/demoData';
import { detectIngredients, getRelevantContext } from './rag';
import { askClaudeWithContext } from './claudeApi';
import { askOpenAIWithContext } from './openaiApi';
import { buildDynamicPrompt } from './promptBuilder';

// ---------------------------------------------------------------------------
// Keyword fallback (no API keys available)
// ---------------------------------------------------------------------------
export function keywordFallback(userMessage) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('magnesium') && (lower.includes('sleep') || lower.includes('form'))) {
    const data = INGREDIENT_DATA.magnesium_sleep;
    const total = data.ingestion.totalPapersIdentified;
    return `**Magnesium & Sleep Evidence Summary:**\nAurivian analyzed ${total} papers across ${data.ingestion.dataSources.length} data sources. Magnesium glycinate shows the strongest evidence for sleep quality improvement (PSQI), supported by 8 RCTs.\n\nKey findings:\n- Sleep onset latency reduced by 12-17 min (glycinate, 200-400mg)\n- PSQI scores improved by 2.1-3.4 points\n- L-threonate shows emerging evidence for sleep architecture\n\n**Sources:** Abbasi et al. (2012, J Res Med Sci); Held et al. (2002, Pharmacopsychiatry); Tanabe et al. (2021, J-STAGE)\n\n**Recommended claim:** "Magnesium supports restful sleep and relaxation" (Strong confidence)`;
  }
  if (lower.includes('red clover') || lower.includes('menopause')) {
    const data = INGREDIENT_DATA.red_clover_menopause;
    const total = data.ingestion.totalPapersIdentified;
    return `**Red Clover & Menopause Evidence Summary:**\nAurivian analyzed ${total} papers. Promensil extract (standardized isoflavones) has the strongest evidence, with 6 RCTs showing 44-73% reduction in hot flash frequency.\n\nKey findings:\n- Kupperman index improved significantly in 4 studies\n- 80mg/day isoflavones appears optimal\n- Bone density markers showed modest improvement in 2 long-term studies\n\n**Sources:** Tice et al. (2003, JAMA); Lipovac et al. (2010, Gynecol Endocrinol); Atkinson et al. (2004, QJM)\n\n**Recommended claim:** "Red clover isoflavones help reduce menopausal discomfort" (Moderate confidence)`;
  }
  if (lower.includes('collagen') && (lower.includes('skin') || lower.includes('elasticity'))) {
    const data = INGREDIENT_DATA.collagen_skin;
    const total = data.ingestion.totalPapersIdentified;
    return `**Collagen & Skin Elasticity Evidence Summary:**\nAurivian analyzed ${total} papers. Type I hydrolyzed collagen peptides (2.5-10g/day) show strong evidence for skin elasticity improvement.\n\nKey findings:\n- Elasticity improved 7-16% across RCTs (cutometry)\n- Wrinkle depth reduction in 8 RCTs after 8-12 weeks\n- Fish collagen shows comparable efficacy to bovine\n\n**Sources:** Proksch et al. (2014, Skin Pharmacol Physiol); de Miranda et al. (2021, Int J Dermatol); Bolke et al. (2019, Nutrients)\n\n**Recommended claim:** "Collagen peptides support skin elasticity and hydration" (Strong confidence)`;
  }
  if (lower.includes('compare') || (lower.includes('form') && (lower.includes('which') || lower.includes('best')))) {
    return '**Form Comparison:**\nAurivian maps evidence strength to specific ingredient forms. Key findings:\n\n**Magnesium:** Glycinate > Citrate > L-threonate > Taurate > Oxide (for sleep)\n**Red Clover:** Promensil 80mg > MF11RCE > Whole herb (for hot flashes)\n**Collagen:** Type I hydrolyzed = Fish peptides > Type I+III blend > Bovine (for skin elasticity)\n\nAsk about a specific ingredient for detailed form-by-form evidence tables.';
  }
  if (lower.includes('claim') || lower.includes('regulatory') || lower.includes('substantiation')) {
    return '**Claim Substantiation Guidance:**\nAurivian generates regulatory-grade claim language with confidence levels:\n- **Strong:** Supported by 3+ RCTs with consistent results\n- **Moderate:** Supported by 1-2 RCTs + observational data\n- **Emerging:** Primarily observational/mechanistic evidence\n\nEach claim includes a defense package: evidence strength, consistency, biological plausibility, and dose-response.\n\n**Regulatory frameworks covered:** FDA 21 CFR 101.93 (structure/function), EU Reg 1924/2006 (health claims), EFSA Article 13.5, TGA, Health Canada NHP.';
  }
  if (lower.includes('gap') || lower.includes('research') || lower.includes('opportunity')) {
    return '**Research Gaps Identified:**\n1. **Magnesium:** No pediatric sleep RCTs; no head-to-head form comparisons; limited data on magnesium + melatonin combinations\n2. **Red Clover:** Limited long-term (>2yr) safety data; few early perimenopause studies; no equol-stratified RCTs\n3. **Collagen:** Limited data in diverse skin types (Fitzpatrick IV-VI); dosing duration variability; no Vital Proteins product-specific RCTs\n\nThese gaps represent investment opportunities for Nestle Health Science.';
  }
  if (lower.includes('brand') || lower.includes('portfolio') || lower.includes('pure encapsulations') || lower.includes('solgar')) {
    return '**Nestle Health Science Portfolio Coverage:**\n- **Pure Encapsulations:** Magnesium glycinate, collagen peptides (premium/practitioner)\n- **Solgar:** Full magnesium range, red clover extract, chelated minerals\n- **Nature\'s Bounty:** Collagen gummies, magnesium oxide/citrate (mass market)\n- **Vital Proteins:** Collagen peptides market leader (lifestyle/beauty)\n- **Garden of Life:** Whole-food magnesium, plant collagen builder, probiotics\n\nEvidence strength varies by brand and form — Aurivian maps evidence to specific product SKUs.';
  }
  if (lower.includes('help') || lower.includes('what can you')) {
    return 'I can answer questions about: magnesium & sleep evidence, red clover & menopause data, collagen & skin elasticity research, form-by-form comparisons, regulatory claim guidance, evidence gaps, portfolio analysis, and competitive intelligence for Nestle Health Science VMHS products. I cite specific studies when available.';
  }
  return 'I can help with Nestle Health Science claim substantiation intelligence: evidence analysis for magnesium, red clover, and collagen across multiple data sources. Ask me about evidence strength, ingredient forms, claims, gaps, or portfolio insights. I\'ll cite the underlying studies.';
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Single entry point for Auri. Uses multi-ingredient RAG, then Claude or OpenAI.
 * @param {string} userMessage - The current user message
 * @param {Array} conversationHistory - Previous messages (last 10)
 */
export async function askAuri(userMessage, conversationHistory = []) {
  // 1. Detect which ingredients the query is about
  const ingredientIds = detectIngredients(userMessage);

  // 2. Run study-level RAG
  const { context: ragContext, citedStudies } = getRelevantContext(userMessage, ingredientIds);

  // 3. Build dynamic prompt with citation instructions
  const systemPrompt = buildDynamicPrompt(userMessage, ragContext, ingredientIds, citedStudies);

  // 4. Try LLM providers
  const hasClaude = !!process.env.REACT_APP_ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.REACT_APP_OPENAI_API_KEY;
  let claudeError = null;

  if (hasClaude) {
    try {
      return await askClaudeWithContext(userMessage, systemPrompt, conversationHistory);
    } catch (err) {
      claudeError = err;
    }
  }

  if (hasOpenAI) {
    try {
      return await askOpenAIWithContext(userMessage, systemPrompt, conversationHistory);
    } catch (_) {
      // Fall through
    }
  }

  if (claudeError) throw claudeError;

  // 5. Keyword fallback
  return keywordFallback(userMessage);
}
