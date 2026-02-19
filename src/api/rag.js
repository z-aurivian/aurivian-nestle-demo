/**
 * Lightweight RAG over demo data and strategic content for Nestlé Health Science.
 * v2: Multi-ingredient detection, study-level scoring, smart context budgeting.
 */

import { INGREDIENT_DATA } from '../data/demoData';
import {
  EVIDENCE_LANDSCAPE,
  INGREDIENT_POSITIONING,
  REGULATORY_GUIDANCE,
  EVIDENCE_GAPS,
  PORTFOLIO_INSIGHTS,
} from '../data/strategicContent';

// ---------------------------------------------------------------------------
// Ingredient detection
// ---------------------------------------------------------------------------
const INGREDIENT_KEYWORDS = {
  magnesium_sleep: [
    'magnesium', 'mag', 'glycinate', 'citrate', 'oxide', 'threonate', 'taurate',
    'sleep', 'psqi', 'insomnia', 'latency', 'melatonin', 'gaba',
  ],
  red_clover_menopause: [
    'red clover', 'clover', 'menopause', 'menopausal', 'perimenopause', 'hot flash',
    'hot flashes', 'isoflavone', 'isoflavones', 'promensil', 'kupperman',
    'estrogen', 'phytoestrogen', 'bone density',
  ],
  collagen_skin: [
    'collagen', 'skin', 'elasticity', 'wrinkle', 'hydration', 'cutometry',
    'peptide', 'peptides', 'marine', 'bovine', 'fish collagen', 'tewl',
    'dermis', 'procollagen',
  ],
};

/**
 * Detect which ingredients are mentioned in the query.
 * Returns array of ingredient IDs. If none detected, returns all three.
 */
export function detectIngredients(query) {
  const lower = query.toLowerCase();
  const detected = [];

  for (const [id, keywords] of Object.entries(INGREDIENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(id);
    }
  }

  return detected.length > 0 ? detected : Object.keys(INGREDIENT_KEYWORDS);
}

// ---------------------------------------------------------------------------
// Study-level scoring
// ---------------------------------------------------------------------------

/**
 * Score a single study against the user query. Higher = more relevant.
 */
function scoreStudy(study, queryWords) {
  let score = 0;
  const titleLower = study.title.toLowerCase();
  const formLower = (study.form || '').toLowerCase();
  const endpointsLower = (study.endpoints || []).join(' ').toLowerCase();
  const effectLower = (study.effectSummary || '').toLowerCase();

  for (const word of queryWords) {
    if (titleLower.includes(word)) score += 3;
    if (formLower.includes(word)) score += 2;
    if (endpointsLower.includes(word)) score += 2;
    if (effectLower.includes(word)) score += 1;
  }

  // Boost high-quality studies
  if (study.qualityScore >= 85) score += 2;
  else if (study.qualityScore >= 75) score += 1;

  // Boost RCTs and meta-analyses
  const design = (study.studyDesign || '').toLowerCase();
  if (design === 'meta-analysis' || design === 'systematic-review') score += 3;
  else if (design === 'rct') score += 2;

  // Boost supporting outcomes
  if (study.outcome === 'supporting') score += 1;

  return score;
}

/**
 * Get the top N most relevant studies across one or more ingredient datasets.
 * Returns studies with their ingredient context for citation.
 */
function getTopStudies(ingredientIds, queryWords, maxStudies = 8) {
  const scored = [];

  for (const id of ingredientIds) {
    const data = INGREDIENT_DATA[id];
    if (!data || !data.studies) continue;

    for (const study of data.studies) {
      scored.push({
        ...study,
        _ingredientId: id,
        _ingredientLabel: data.ingredient || id,
        _score: scoreStudy(study, queryWords),
      });
    }
  }

  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, maxStudies);
}

/**
 * Format studies for inclusion in the prompt, with citation-ready metadata.
 */
function formatStudiesForPrompt(studies) {
  if (studies.length === 0) return '';

  const lines = studies.map((s, i) => {
    const authorStr = (s.authors || []).slice(0, 2).join(', ') + (s.authors?.length > 2 ? ' et al.' : '');
    return [
      `[${i + 1}] ${authorStr} (${s.year}). "${s.title}"`,
      `   Journal: ${s.journal} | Language: ${s.language} | Design: ${s.studyDesign} | Quality: ${s.qualityScore}/100`,
      `   Population: ${s.population} | N=${s.sampleSize} | Dose: ${s.dose} | Form: ${s.form} | Duration: ${s.duration}`,
      `   Endpoints: ${(s.endpoints || []).join(', ')}`,
      `   Outcome: ${s.outcome} — ${s.effectSummary}`,
    ].join('\n');
  });

  return `RELEVANT STUDIES (ranked by relevance to your query):\n\n${lines.join('\n\n')}`;
}

// ---------------------------------------------------------------------------
// Section-level context (non-study data)
// ---------------------------------------------------------------------------
const SECTION_KEYWORDS = {
  ingestion: ['ingestion', 'papers', 'sources', 'pubmed', 'cochrane', 'clinicaltrials', 'j-stage', 'data', 'total'],
  forms: ['form', 'forms', 'glycinate', 'citrate', 'oxide', 'threonate', 'taurate', 'promensil', 'hydrolyzed', 'peptide', 'bovine', 'fish', 'type i', 'type iii', 'marine'],
  endpoints: ['endpoint', 'sleep', 'psqi', 'latency', 'hot flash', 'kupperman', 'elasticity', 'wrinkle', 'hydration', 'outcome'],
  dosage: ['dose', 'dosage', 'mg', 'gram', 'amount', 'serving', 'effective', 'optimal'],
  gaps: ['gap', 'missing', 'lacking', 'pediatric', 'safety', 'long-term', 'limitation'],
  claims: ['claim', 'wording', 'regulatory', 'substantiation', 'defense', 'confidence', 'label'],
  consumer: ['consumer', 'social', 'sentiment', 'question', 'brand', 'reddit', 'webmd'],
};

const STRATEGIC_KEYWORDS = {
  evidenceLandscape: ['landscape', 'market', 'trend', 'industry', 'vmhs', 'overview'],
  ingredientPositioning: ['positioning', 'competitor', 'competitive', 'compare', 'differentiation', 'advantage'],
  regulatoryGuidance: ['fda', 'efsa', 'regulation', 'compliance', '21 cfr', 'structure function', 'health claim'],
  evidenceGaps: ['opportunity', 'investment', 'priority', 'unmet need', 'research agenda'],
  portfolioInsights: ['portfolio', 'cross-portfolio', 'brand strategy', 'leverage', 'intelligence'],
};

const STRATEGIC_SOURCES = {
  evidenceLandscape: EVIDENCE_LANDSCAPE,
  ingredientPositioning: INGREDIENT_POSITIONING,
  regulatoryGuidance: REGULATORY_GUIDANCE,
  evidenceGaps: EVIDENCE_GAPS,
  portfolioInsights: PORTFOLIO_INSIGHTS,
};

function getQueryKeywords(query) {
  const lower = query.toLowerCase().replace(/[^\w\s]/g, ' ');
  return lower.split(/\s+/).filter((w) => w.length > 2);
}

function matchesSection(queryWords, queryLower, keywords) {
  return queryWords.some((w) => keywords.some((k) => k.includes(w) || w.includes(k))) ||
    keywords.some((k) => queryLower.includes(k));
}

/**
 * Get non-study ingredient data sections relevant to the query.
 */
function getIngredientSections(ingredientIds, queryWords, queryLower) {
  const parts = [];
  const sectionLabels = {
    ingestion: 'INGESTION STATS',
    ingredientForms: 'INGREDIENT FORMS',
    endpointAnalysis: 'ENDPOINT ANALYSIS',
    dosageRanges: 'DOSAGE ANALYSIS',
    researchGaps: 'RESEARCH GAPS',
    suggestedClaims: 'SUGGESTED CLAIMS',
    consumerSocial: 'CONSUMER & SOCIAL DATA',
  };

  // Map section keywords to actual data keys
  const sectionMap = {
    ingestion: 'ingestion',
    forms: 'ingredientForms',
    endpoints: 'endpointAnalysis',
    dosage: 'dosageRanges',
    gaps: 'researchGaps',
    claims: 'suggestedClaims',
    consumer: 'consumerSocial',
  };

  // Determine which sections to include
  const sectionsToInclude = new Set();
  for (const [sectionKey, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (matchesSection(queryWords, queryLower, keywords)) {
      sectionsToInclude.add(sectionKey);
    }
  }

  // If few sections matched, include the most important ones
  if (sectionsToInclude.size <= 1) {
    sectionsToInclude.add('ingestion');
    sectionsToInclude.add('endpoints');
    sectionsToInclude.add('claims');
  }

  for (const ingredientId of ingredientIds) {
    const data = INGREDIENT_DATA[ingredientId];
    if (!data) continue;

    const ingredientLabel = data.ingredient || ingredientId;
    const ingredientParts = [];

    for (const [sectionKey, dataKey] of Object.entries(sectionMap)) {
      if (!sectionsToInclude.has(sectionKey)) continue;
      if (!data[dataKey]) continue;

      const label = sectionLabels[dataKey] || dataKey;
      const content = JSON.stringify(data[dataKey], null, 2);
      // Budget: cap each section at ~800 chars to leave room for studies
      ingredientParts.push(`${label}:\n${content.slice(0, 800)}`);
    }

    if (ingredientParts.length > 0) {
      parts.push(`--- ${ingredientLabel} ---\n${ingredientParts.join('\n\n')}`);
    }
  }

  return parts.join('\n\n');
}

/**
 * Get strategic content sections relevant to the query.
 */
function getStrategicSections(queryWords, queryLower) {
  const parts = [];

  for (const [key, keywords] of Object.entries(STRATEGIC_KEYWORDS)) {
    if (!matchesSection(queryWords, queryLower, keywords)) continue;

    const source = STRATEGIC_SOURCES[key];
    if (!source) continue;

    const label = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    // Budget: ~1000 chars per strategic section
    parts.push(`${label} (Strategic Intelligence):\n${JSON.stringify(source, null, 2).slice(0, 1000)}`);
  }

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Main export: build full context string
// ---------------------------------------------------------------------------

/**
 * Build RAG context for the prompt. Now multi-ingredient aware and study-level scored.
 * @param {string} query - User's question
 * @param {string[]} ingredientIds - Detected ingredient IDs
 * @returns {{ context: string, citedStudies: Array }} Context string + studies for citation rendering
 */
export function getRelevantContext(query, ingredientIds) {
  const queryWords = getQueryKeywords(query);
  const queryLower = query.toLowerCase();

  // 1. Get top studies (study-level scoring)
  const topStudies = getTopStudies(ingredientIds, queryWords, 8);
  const studiesContext = formatStudiesForPrompt(topStudies);

  // 2. Get ingredient-level sections (non-study data)
  const ingredientContext = getIngredientSections(ingredientIds, queryWords, queryLower);

  // 3. Get strategic content
  const strategicContext = getStrategicSections(queryWords, queryLower);

  // Assemble with clear section separators
  const parts = [];
  if (studiesContext) parts.push(studiesContext);
  if (ingredientContext) parts.push(ingredientContext);
  if (strategicContext) parts.push(strategicContext);

  return {
    context: parts.join('\n\n===\n\n'),
    citedStudies: topStudies,
  };
}
