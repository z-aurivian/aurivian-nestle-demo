/**
 * Single backend for Auri: lightweight RAG over demo data + Claude/OpenAI.
 * Tries Claude first, then OpenAI; falls back to keyword answers if no keys or both fail.
 */

import { getDemoContext } from '../data/demoData';
import { getRelevantContext } from './rag';
import { askClaudeWithContext } from './claudeApi';
import { askOpenAIWithContext } from './openaiApi';
import { buildDynamicPrompt } from './promptBuilder';

export function keywordFallback(userMessage, demoContext) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('magnesium') && (lower.includes('sleep') || lower.includes('form'))) {
    return '**Magnesium & Sleep Evidence Summary:**\nAurivian analyzed 453 papers across 6 data sources. Magnesium glycinate shows the strongest evidence for sleep quality improvement (PSQI), supported by 8 RCTs. Key findings: sleep onset latency reduced by 12-17 minutes (glycinate, 200-400mg), PSQI scores improved by 2.1-3.4 points. L-threonate shows emerging evidence for sleep architecture. Citrate and oxide have weaker sleep-specific data.\n\n**Recommended claim:** "Magnesium supports restful sleep and relaxation" (Strong confidence)';
  }
  if (lower.includes('red clover') || lower.includes('menopause')) {
    return '**Red Clover & Menopause Evidence Summary:**\nAurivian analyzed 324 papers. Promensil extract (standardized isoflavones) has the strongest evidence, with 6 RCTs showing 44-73% reduction in hot flash frequency. The Kupperman index improved significantly in 4 studies. Bone density markers showed modest improvement in 2 long-term studies.\n\n**Recommended claim:** "Red clover isoflavones help reduce menopausal discomfort" (Moderate confidence)';
  }
  if (lower.includes('collagen') && (lower.includes('skin') || lower.includes('elasticity'))) {
    return '**Collagen & Skin Elasticity Evidence Summary:**\nAurivian analyzed 387 papers. Type I hydrolyzed collagen peptides (2.5-10g/day) show strong evidence for skin elasticity improvement measured by cutometry. Wrinkle depth reduction observed in 7 RCTs after 8-12 weeks. Fish collagen peptides show comparable efficacy to bovine sources.\n\n**Recommended claim:** "Collagen peptides support skin elasticity and hydration" (Strong confidence)';
  }
  if (lower.includes('claim') || lower.includes('regulatory') || lower.includes('substantiation')) {
    return '**Claim Substantiation Guidance:**\nAurivian generates regulatory-grade claim language with confidence levels:\n- **Strong:** Supported by 3+ RCTs with consistent results\n- **Moderate:** Supported by 1-2 RCTs + observational data\n- **Emerging:** Primarily observational/mechanistic evidence\n\nEach claim includes a defense package: evidence strength, consistency, biological plausibility, and dose-response relationship.';
  }
  if (lower.includes('gap') || lower.includes('research') || lower.includes('opportunity')) {
    return '**Research Gaps Identified:**\n1. **Magnesium:** No pediatric sleep studies; no head-to-head form comparisons in RCTs\n2. **Red Clover:** Limited long-term (>2yr) safety data; few early perimenopause studies\n3. **Collagen:** Limited data in diverse skin types; dosing duration variability across studies\n\nThese gaps represent opportunities for Nestlé Health Science to fund targeted studies.';
  }
  if (lower.includes('brand') || lower.includes('portfolio') || lower.includes('pure encapsulations') || lower.includes('solgar')) {
    return '**Nestlé Health Science Portfolio Coverage:**\n- **Pure Encapsulations:** Magnesium glycinate, collagen peptides (premium positioning)\n- **Solgar:** Full magnesium range, red clover extract\n- **Nature\'s Bounty:** Collagen (mass market), magnesium oxide/citrate\n- **Vital Proteins:** Collagen peptides (lifestyle/beauty positioning)\n\nEvidence strength varies by brand and form — Aurivian maps evidence to specific product SKUs.';
  }
  if (lower.includes('help') || lower.includes('what can you')) {
    return 'I can answer questions about: magnesium & sleep evidence, red clover & menopause data, collagen & skin elasticity research, regulatory claim guidance, evidence gaps, portfolio analysis, and competitive intelligence for Nestlé Health Science VMHS products.';
  }
  return 'I can help with Nestlé Health Science claim substantiation intelligence: evidence analysis for magnesium, red clover, and collagen across multiple data sources. Ask me about evidence strength, ingredient forms, claims, gaps, or portfolio insights.';
}

export async function askAuri(userMessage, conversationHistory = []) {
  const demoContext = getDemoContext();
  const ragContext = getRelevantContext(demoContext, userMessage);
  const systemPrompt = buildDynamicPrompt(userMessage, ragContext);

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
      // Fall through to keyword fallback
    }
  }

  if (claudeError) {
    throw claudeError;
  }

  return keywordFallback(userMessage, demoContext);
}
