/**
 * Dynamic prompt builder for Auri – Nestlé Health Science context.
 * v2: Citation instructions, Nestlé-specific framing, study-aware prompts.
 */

import {
  EVIDENCE_LANDSCAPE,
  INGREDIENT_POSITIONING,
  REGULATORY_GUIDANCE,
  EVIDENCE_GAPS,
  PORTFOLIO_INSIGHTS,
} from '../data/strategicContent';

// ---------------------------------------------------------------------------
// Category detection (for few-shot example selection)
// ---------------------------------------------------------------------------
const CATEGORY_KEYWORDS = {
  evidenceLandscape: [
    'evidence', 'landscape', 'trend', 'trends', 'market', 'regulatory', 'fda', 'efsa',
    'vmhs', 'supplement', 'supplements', 'industry', 'overview', 'totality',
  ],
  ingredientPositioning: [
    'ingredient', 'form', 'forms', 'magnesium', 'collagen', 'red clover', 'glycinate',
    'citrate', 'oxide', 'threonate', 'taurate', 'promensil', 'hydrolyzed', 'peptide',
    'compare', 'comparison', 'positioning', 'competitor', 'pure encapsulations', 'solgar',
    'nature\'s bounty', 'vital proteins', 'brand', 'brands',
  ],
  regulatoryGuidance: [
    'claim', 'claims', 'regulatory', 'structure function', 'health claim', 'wording',
    'defense', 'substantiation', 'fda', 'efsa', 'label', 'labeling', 'compliance',
    'confidence', 'approved', 'permitted',
  ],
  evidenceGaps: [
    'gap', 'gaps', 'missing', 'lacking', 'opportunity', 'unmet', 'pediatric', 'safety',
    'long-term', 'duration', 'population', 'investment', 'priority', 'research',
  ],
  portfolioInsights: [
    'portfolio', 'cross', 'brand', 'brands', 'consumer', 'insight', 'leverage',
    'competitive', 'intelligence', 'strategy', 'strategic',
  ],
};

export function detectCategories(query) {
  const lower = query.toLowerCase();
  const detected = new Set();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) detected.add(category);
  }

  if (detected.size === 0) detected.add('evidenceLandscape');
  return detected;
}

// ---------------------------------------------------------------------------
// Few-shot examples (category-specific)
// ---------------------------------------------------------------------------
function getFewShotExamples(categories) {
  const examples = [];

  if (categories.has('ingredientPositioning')) {
    examples.push(`Example Q: "How does magnesium glycinate compare to oxide for sleep?"
Example A: **Magnesium Glycinate vs Oxide for Sleep:**

| Feature | Glycinate | Oxide |
|---------|-----------|-------|
| Bioavailability | High | Low |
| Evidence strength | Strong (8 RCTs) | Limited (2 RCTs) |
| Effective dose | 200-400mg | 400-500mg |
| Tolerability | Excellent | GI side effects common |

Glycinate has stronger evidence for sleep outcomes, particularly PSQI improvement (Abbasi et al., 2012, J Res Med Sci; Held et al., 2002, Pharmacopsychiatry). Oxide's low bioavailability limits clinical effect despite higher elemental magnesium content.`);
  }

  if (categories.has('regulatoryGuidance')) {
    examples.push(`Example Q: "What claims can we make for collagen and skin?"
Example A: **Recommended Claim Wording (Collagen + Skin Elasticity):**
- **Strong confidence:** "Collagen peptides support skin elasticity and hydration" — supported by 12 RCTs (Proksch et al., 2014; de Miranda et al., 2021)
- **Moderate confidence:** "May help reduce the appearance of fine lines" — supported by 8 RCTs
- **Structure/function (21 CFR 101.93):** Qualifies with current evidence base
- **EFSA Art. 13.5:** Application possible with additional bioavailability data`);
  }

  if (categories.has('evidenceGaps')) {
    examples.push(`Example Q: "What are the evidence gaps for red clover?"
Example A: **Red Clover Evidence Gaps:**
1. **Long-term safety** — No RCTs beyond 24 months (Tice et al., 2003 only ran 12 months)
2. **Early perimenopause** — Most studies recruit postmenopausal women; only 1 pilot in perimenopausal
3. **Dose-response** — Limited data on optimal isoflavone concentrations beyond 40-80mg
4. **Combination use** — No data with HRT co-administration or probiotic combinations

These gaps represent investment opportunities, particularly the isoflavone + probiotic combination (leverages Garden of Life expertise).`);
  }

  return examples.length > 0 ? `\n\nFEW-SHOT EXAMPLES (follow this citation style):\n${examples.join('\n\n')}` : '';
}

// ---------------------------------------------------------------------------
// Strategic context (condensed, only for detected categories)
// ---------------------------------------------------------------------------
function getStrategicContext(categories) {
  const parts = [];
  const sources = {
    evidenceLandscape: { data: EVIDENCE_LANDSCAPE, budget: 1200 },
    ingredientPositioning: { data: INGREDIENT_POSITIONING, budget: 1500 },
    regulatoryGuidance: { data: REGULATORY_GUIDANCE, budget: 1200 },
    evidenceGaps: { data: EVIDENCE_GAPS, budget: 1200 },
    portfolioInsights: { data: PORTFOLIO_INSIGHTS, budget: 1200 },
  };

  for (const [key, { data, budget }] of Object.entries(sources)) {
    if (!categories.has(key) || !data) continue;
    const label = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    parts.push(`${label}:\n${JSON.stringify(data, null, 2).slice(0, budget)}`);
  }

  return parts.length > 0 ? `\nSTRATEGIC INTELLIGENCE:\n${parts.join('\n\n---\n\n')}` : '';
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the full system prompt for Claude/OpenAI.
 * @param {string} query - User's question
 * @param {string} ragContext - RAG-retrieved context string
 * @param {string[]} ingredientIds - Detected ingredient IDs
 * @param {Array} citedStudies - Top-scored studies from RAG
 */
export function buildDynamicPrompt(query, ragContext, ingredientIds = [], citedStudies = []) {
  const categories = detectCategories(query);
  const strategicContext = getStrategicContext(categories);
  const fewShotExamples = getFewShotExamples(categories);

  // Build citation reference list for the LLM
  const citationRef = citedStudies.length > 0
    ? `\nAVAILABLE CITATIONS (use these when referencing evidence):\n${citedStudies.map((s, i) => {
        const author = (s.authors || [])[0]?.split(' ').pop() || 'Unknown';
        const etAl = (s.authors || []).length > 1 ? ' et al.' : '';
        return `[${i + 1}] ${author}${etAl}, ${s.year}, ${s.journal}`;
      }).join('\n')}\n`
    : '';

  const ingredientContext = ingredientIds.length === 1
    ? `The user is asking specifically about: ${ingredientIds[0].replace(/_/g, ' ')}.`
    : ingredientIds.length <= 3
    ? `The user's question relates to: ${ingredientIds.map((id) => id.replace(/_/g, ' ')).join(', ')}.`
    : 'The user is asking a general question across the VMHS portfolio.';

  return `You are Auri, the AI evidence analyst powering Aurivian's Claim Substantiation Intelligence platform. You are presenting to Nestle Health Science's VMHS (Vitamins, Minerals, Herbs & Supplements) team.

CONTEXT ABOUT THIS DEMO:
- Nestle Health Science is evaluating Aurivian to replace their current evidence analysis tools
- Their pain points: current tools (like Consensus AI) cap at ~50 papers, miss foreign-language studies, can't access full-text, and take too long
- Aurivian analyzes 300-450+ papers per ingredient across PubMed, ClinicalTrials.gov, Cochrane, J-STAGE, internal archives, and consumer/social sources
- Aurivian processes multilingual evidence (English, Japanese, German, Chinese) and provides regulatory-grade claim language
- Nestle HS brands: Pure Encapsulations (premium/practitioner), Solgar (specialty retail), Nature's Bounty (mass market), Vital Proteins (lifestyle/beauty), Garden of Life (organic/natural)

${ingredientContext}

RULES FOR YOUR RESPONSES:
1. ALWAYS cite studies when referencing evidence: use format "(Author et al., Year, Journal)" or "(Author, Year)"
2. Use the numbered references provided in the RELEVANT STUDIES section for citations
3. Be concise but thorough — use markdown tables and bullet points
4. When comparing ingredient forms, use tables
5. When discussing claims, specify the regulatory framework (FDA structure/function, EFSA, etc.)
6. When discussing gaps, frame them as investment opportunities for Nestle HS
7. NEVER use emojis or emoticons in your responses — this is a professional platform for regulatory and scientific audiences
8. You may use your pre-trained knowledge about supplement science, clinical research, and regulatory frameworks to enrich answers when the provided data is insufficient — but prefer the provided evidence data and cite it

${citationRef}
RETRIEVED EVIDENCE DATA:
${ragContext}
${strategicContext}
${fewShotExamples}

If the question is outside the scope of VMHS claim substantiation, politely redirect.`;
}

const promptBuilder = { detectCategories, buildDynamicPrompt };
export default promptBuilder;
