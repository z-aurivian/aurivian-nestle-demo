/**
 * Dynamic prompt builder with category detection for Auri – Nestlé Health Science context
 */

import {
  EVIDENCE_LANDSCAPE,
  INGREDIENT_POSITIONING,
  REGULATORY_GUIDANCE,
  EVIDENCE_GAPS,
  PORTFOLIO_INSIGHTS,
} from '../data/strategicContent';

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
    const match = keywords.some((kw) => lower.includes(kw));
    if (match) detected.add(category);
  }

  if (detected.size === 0) detected.add('evidenceLandscape');
  return detected;
}

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
Glycinate has stronger evidence for sleep outcomes, particularly PSQI improvement.`);
  }

  if (categories.has('regulatoryGuidance')) {
    examples.push(`Example Q: "What claims can we make for collagen and skin?"
Example A: **Recommended Claim Wording (Collagen + Skin Elasticity):**
- **Strong confidence:** "Collagen peptides support skin elasticity and hydration"
- **Moderate confidence:** "May help reduce the appearance of fine lines"
- **Structure/function (21 CFR 101.93):** Qualifies with current evidence base
- **EFSA Art. 13.5:** Application possible with additional bioavailability data`);
  }

  if (categories.has('evidenceGaps')) {
    examples.push(`Example Q: "What are the evidence gaps for red clover?"
Example A: **Red Clover Evidence Gaps:**
1. **Long-term safety** - No studies beyond 24 months
2. **Early perimenopause** - Most studies in post-menopausal women
3. **Dose-response** - Limited data on optimal isoflavone concentrations
4. **Combination use** - No data with HRT co-administration`);
  }

  return examples.length > 0 ? `\n\nFEW-SHOT EXAMPLES:\n${examples.join('\n\n')}` : '';
}

function getStrategicContext(categories) {
  const parts = [];

  if (categories.has('evidenceLandscape') && EVIDENCE_LANDSCAPE) {
    parts.push(`EVIDENCE LANDSCAPE:\n${JSON.stringify(EVIDENCE_LANDSCAPE, null, 2).slice(0, 1500)}`);
  }

  if (categories.has('ingredientPositioning') && INGREDIENT_POSITIONING) {
    parts.push(`INGREDIENT POSITIONING:\n${JSON.stringify(INGREDIENT_POSITIONING, null, 2).slice(0, 2000)}`);
  }

  if (categories.has('regulatoryGuidance') && REGULATORY_GUIDANCE) {
    parts.push(`REGULATORY GUIDANCE:\n${JSON.stringify(REGULATORY_GUIDANCE, null, 2).slice(0, 1500)}`);
  }

  if (categories.has('evidenceGaps') && EVIDENCE_GAPS) {
    parts.push(`EVIDENCE GAPS:\n${JSON.stringify(EVIDENCE_GAPS, null, 2).slice(0, 1500)}`);
  }

  if (categories.has('portfolioInsights') && PORTFOLIO_INSIGHTS) {
    parts.push(`PORTFOLIO INSIGHTS:\n${JSON.stringify(PORTFOLIO_INSIGHTS, null, 2).slice(0, 1500)}`);
  }

  return parts.join('\n\n---\n\n');
}

export function buildDynamicPrompt(query, ragContext) {
  const categories = detectCategories(query);
  const strategicContext = getStrategicContext(categories);
  const fewShotExamples = getFewShotExamples(categories);

  return `You are Auri, a helpful assistant for the Nestlé Health Science Claim Substantiation Intelligence demo. You help with evidence analysis for VMHS (Vitamins, Minerals, Herbs & Supplements) products. Answer using the following retrieved data and strategic content when applicable. Be concise, accurate, and format responses with markdown tables and bullet points where appropriate. Do not use emojis in your responses.

You may also use your pre-trained knowledge about supplement science, clinical research methodology, and regulatory frameworks (FDA structure/function claims, EFSA health claims) to enrich your answers when the provided data does not fully address the question.

STRATEGIC CONTENT (pre-analyzed intelligence):
${strategicContext}

RETRIEVED DATA (from demo data):
${ragContext}
${fewShotExamples}

If the question is outside this scope, politely say you can only help with Nestlé Health Science claim substantiation intelligence.`;
}

const promptBuilder = { detectCategories, buildDynamicPrompt };
export default promptBuilder;
