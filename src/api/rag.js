/**
 * Lightweight RAG over demo data and strategic content for Nestlé Health Science.
 * Keyword-based section selection — no embeddings.
 */

import {
  EVIDENCE_LANDSCAPE,
  INGREDIENT_POSITIONING,
  REGULATORY_GUIDANCE,
  EVIDENCE_GAPS,
  PORTFOLIO_INSIGHTS,
} from '../data/strategicContent';

const SECTION_KEYWORDS = {
  ingestion: ['ingestion', 'papers', 'studies', 'sources', 'pubmed', 'cochrane', 'clinicaltrials', 'j-stage', 'data'],
  studies: ['study', 'trial', 'rct', 'cohort', 'meta-analysis', 'systematic review', 'author', 'journal', 'publication'],
  forms: ['form', 'forms', 'glycinate', 'citrate', 'oxide', 'threonate', 'taurate', 'promensil', 'hydrolyzed', 'peptide', 'bovine', 'fish', 'type i', 'type iii'],
  endpoints: ['endpoint', 'sleep', 'psqi', 'latency', 'hot flash', 'kupperman', 'elasticity', 'wrinkle', 'hydration', 'outcome'],
  dosage: ['dose', 'dosage', 'mg', 'gram', 'amount', 'serving', 'effective'],
  gaps: ['gap', 'missing', 'lacking', 'pediatric', 'safety', 'long-term', 'limitation'],
  claims: ['claim', 'wording', 'regulatory', 'substantiation', 'defense', 'confidence', 'label'],
  consumer: ['consumer', 'social', 'sentiment', 'question', 'brand', 'reddit', 'webmd'],
  evidenceLandscape: ['landscape', 'market', 'trend', 'industry', 'vmhs', 'overview'],
  ingredientPositioning: ['positioning', 'competitor', 'competitive', 'compare', 'differentiation', 'advantage'],
  regulatoryGuidance: ['fda', 'efsa', 'regulation', 'compliance', '21 cfr', 'structure function', 'health claim'],
  evidenceGaps: ['opportunity', 'investment', 'priority', 'unmet need', 'research agenda'],
  portfolioInsights: ['portfolio', 'cross-portfolio', 'brand strategy', 'leverage', 'intelligence'],
};

function getQueryKeywords(query) {
  const lower = query.toLowerCase().replace(/[^\w\s]/g, ' ');
  return lower.split(/\s+/).filter((w) => w.length > 2);
}

function getRelevantSectionKeys(query) {
  const queryWords = getQueryKeywords(query);
  const relevant = new Set(['ingestion']);

  for (const [sectionKey, keywords] of Object.entries(SECTION_KEYWORDS)) {
    const match = queryWords.some((w) => keywords.some((k) => k.includes(w) || w.includes(k))) ||
      keywords.some((k) => query.toLowerCase().includes(k));
    if (match) relevant.add(sectionKey);
  }

  if (queryWords.length <= 2 || relevant.size <= 2) {
    Object.keys(SECTION_KEYWORDS).forEach((k) => relevant.add(k));
  }

  return relevant;
}

function getStrategicContent(key) {
  switch (key) {
    case 'evidenceLandscape':
      return EVIDENCE_LANDSCAPE ? JSON.stringify(EVIDENCE_LANDSCAPE, null, 2).slice(0, 1200) : null;
    case 'ingredientPositioning':
      return INGREDIENT_POSITIONING ? JSON.stringify(INGREDIENT_POSITIONING, null, 2).slice(0, 1500) : null;
    case 'regulatoryGuidance':
      return REGULATORY_GUIDANCE ? JSON.stringify(REGULATORY_GUIDANCE, null, 2).slice(0, 1200) : null;
    case 'evidenceGaps':
      return EVIDENCE_GAPS ? JSON.stringify(EVIDENCE_GAPS, null, 2).slice(0, 1200) : null;
    case 'portfolioInsights':
      return PORTFOLIO_INSIGHTS ? JSON.stringify(PORTFOLIO_INSIGHTS, null, 2).slice(0, 1200) : null;
    default:
      return null;
  }
}

export function getRelevantContext(demoContext, query) {
  const keysToInclude = getRelevantSectionKeys(query);
  const parts = [];

  const labels = {
    ingestion: 'EVIDENCE INGESTION STATS',
    studies: 'STUDIES',
    forms: 'INGREDIENT FORMS',
    endpoints: 'ENDPOINT ANALYSIS',
    dosage: 'DOSAGE ANALYSIS',
    gaps: 'RESEARCH GAPS',
    claims: 'SUGGESTED CLAIMS',
    consumer: 'CONSUMER & SOCIAL DATA',
    evidenceLandscape: 'EVIDENCE LANDSCAPE (Strategic)',
    ingredientPositioning: 'INGREDIENT POSITIONING (Strategic)',
    regulatoryGuidance: 'REGULATORY GUIDANCE (Strategic)',
    evidenceGaps: 'EVIDENCE GAPS (Strategic)',
    portfolioInsights: 'PORTFOLIO INSIGHTS (Strategic)',
  };

  const strategicKeys = ['evidenceLandscape', 'ingredientPositioning', 'regulatoryGuidance', 'evidenceGaps', 'portfolioInsights'];

  for (const key of Object.keys(SECTION_KEYWORDS)) {
    if (!keysToInclude.has(key)) continue;
    const label = labels[key] || key;

    if (strategicKeys.includes(key)) {
      const content = getStrategicContent(key);
      if (content) parts.push(`${label}:\n${content}`);
    } else if (demoContext && demoContext[key]) {
      parts.push(`${label}:\n${JSON.stringify(demoContext[key], null, 2)}`);
    }
  }

  return parts.join('\n\n');
}
