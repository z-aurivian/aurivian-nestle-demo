#!/usr/bin/env node

/**
 * Pre-fetch real PubMed and ClinicalTrials.gov data for the Aurivian Nestlé demo.
 *
 * Usage:
 *   node scripts/fetch-pubmed.js
 *   node scripts/fetch-pubmed.js --ingredient magnesium_sleep
 *
 * Outputs JSON files to src/data/pubmed/ which can be imported alongside mock data.
 * Uses NCBI E-utilities (free, no auth required — just polite rate limiting).
 *
 * APIs used:
 *   - PubMed E-utilities: esearch + efetch (titles, abstracts, authors, journals, PMIDs)
 *   - ClinicalTrials.gov v2 API: study search (NCT IDs, phase, status, enrollment)
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'pubmed');
const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const CTGOV_BASE = 'https://clinicaltrials.gov/api/v2';
const EMAIL = 'demo@aurivian.com'; // Required by NCBI for polite usage
const RATE_LIMIT_MS = 350; // ~3 requests/sec (NCBI limit without API key)

const QUERIES = {
  magnesium_sleep: {
    pubmed: '(magnesium) AND (sleep OR insomnia OR "sleep quality" OR PSQI) AND (randomized controlled trial[pt] OR meta-analysis[pt] OR review[pt])',
    ctgov: 'magnesium AND sleep',
    label: 'Magnesium + Sleep',
  },
  red_clover_menopause: {
    pubmed: '(red clover OR Trifolium pratense OR isoflavone) AND (menopause OR "hot flash" OR "vasomotor" OR Kupperman) AND (randomized controlled trial[pt] OR meta-analysis[pt] OR review[pt])',
    ctgov: 'red clover AND menopause',
    label: 'Red Clover + Menopause',
  },
  collagen_skin: {
    pubmed: '(collagen peptide OR hydrolyzed collagen) AND (skin elasticity OR skin aging OR wrinkle OR cutometry) AND (randomized controlled trial[pt] OR meta-analysis[pt] OR review[pt])',
    ctgov: 'collagen AND skin elasticity',
    label: 'Collagen + Skin Elasticity',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.json();
}

async function fetchXML(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.text();
}

// ---------------------------------------------------------------------------
// PubMed E-utilities
// ---------------------------------------------------------------------------

/**
 * Search PubMed and return PMIDs.
 */
async function pubmedSearch(query, maxResults = 50) {
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(maxResults),
    retmode: 'json',
    sort: 'relevance',
    email: EMAIL,
  });

  const url = `${NCBI_BASE}/esearch.fcgi?${params}`;
  console.log(`  PubMed search: ${query.slice(0, 80)}...`);

  const data = await fetchJSON(url);
  const ids = data.esearchresult?.idlist || [];
  const total = parseInt(data.esearchresult?.count || '0', 10);

  console.log(`  Found ${total} total results, fetching top ${ids.length}`);
  return { ids, total };
}

/**
 * Fetch article summaries from PubMed by PMID.
 */
async function pubmedFetchSummaries(pmids) {
  if (pmids.length === 0) return [];

  const params = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'json',
    email: EMAIL,
  });

  const url = `${NCBI_BASE}/esummary.fcgi?${params}`;
  const data = await fetchJSON(url);
  const result = data.result || {};

  const articles = [];
  for (const pmid of pmids) {
    const article = result[pmid];
    if (!article || article.error) continue;

    articles.push({
      pmid,
      title: article.title || '',
      authors: (article.authors || []).map((a) => a.name),
      journal: article.source || article.fulljournalname || '',
      year: parseInt((article.pubdate || '').split(' ')[0], 10) || null,
      pubDate: article.pubdate || '',
      doi: (article.elocationid || '').replace('doi: ', ''),
      pubType: article.pubtype || [],
      language: (article.lang || ['eng']),
    });
  }

  return articles;
}

// ---------------------------------------------------------------------------
// ClinicalTrials.gov v2 API
// ---------------------------------------------------------------------------

async function ctgovSearch(query, maxResults = 20) {
  const params = new URLSearchParams({
    'query.term': query,
    pageSize: String(maxResults),
    format: 'json',
  });

  const url = `${CTGOV_BASE}/studies?${params}`;
  console.log(`  ClinicalTrials.gov search: ${query}`);

  const data = await fetchJSON(url);
  const studies = (data.studies || []).map((s) => {
    const proto = s.protocolSection || {};
    const id = proto.identificationModule || {};
    const status = proto.statusModule || {};
    const design = proto.designModule || {};
    const conditions = proto.conditionsModule || {};
    const interventions = proto.armsInterventionsModule || {};

    return {
      nctId: id.nctId || '',
      title: id.briefTitle || '',
      officialTitle: id.officialTitle || '',
      status: status.overallStatus || '',
      phase: (design.phases || []).join(', ') || 'N/A',
      enrollment: design.enrollmentInfo?.count || null,
      conditions: conditions.conditions || [],
      interventions: (interventions.interventions || []).map((i) => ({
        type: i.type,
        name: i.name,
      })),
      startDate: status.startDateStruct?.date || '',
      completionDate: status.completionDateStruct?.date || '',
    };
  });

  console.log(`  Found ${studies.length} trials`);
  return { studies, totalCount: data.totalCount || studies.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function fetchIngredient(ingredientId) {
  const config = QUERIES[ingredientId];
  if (!config) {
    console.error(`Unknown ingredient: ${ingredientId}`);
    return null;
  }

  console.log(`\nFetching: ${config.label}`);
  console.log('='.repeat(50));

  // PubMed
  const { ids: pmids, total: pubmedTotal } = await pubmedSearch(config.pubmed);
  await sleep(RATE_LIMIT_MS);

  const articles = await pubmedFetchSummaries(pmids);
  await sleep(RATE_LIMIT_MS);

  // ClinicalTrials.gov
  const { studies: trials, totalCount: ctgovTotal } = await ctgovSearch(config.ctgov);
  await sleep(RATE_LIMIT_MS);

  const result = {
    ingredientId,
    label: config.label,
    fetchedAt: new Date().toISOString(),
    pubmed: {
      query: config.pubmed,
      totalResults: pubmedTotal,
      fetchedCount: articles.length,
      articles,
    },
    clinicalTrials: {
      query: config.ctgov,
      totalResults: ctgovTotal,
      fetchedCount: trials.length,
      studies: trials,
    },
  };

  // Write to file
  const outPath = path.join(OUTPUT_DIR, `${ingredientId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Written to: ${outPath}`);
  console.log(`  PubMed: ${articles.length} articles (${pubmedTotal} total)`);
  console.log(`  ClinicalTrials.gov: ${trials.length} trials (${ctgovTotal} total)`);

  return result;
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Check for --ingredient flag
  const args = process.argv.slice(2);
  const ingredientFlag = args.indexOf('--ingredient');
  const ingredientIds = ingredientFlag >= 0 && args[ingredientFlag + 1]
    ? [args[ingredientFlag + 1]]
    : Object.keys(QUERIES);

  console.log('Aurivian PubMed + ClinicalTrials.gov Data Fetcher');
  console.log(`Fetching data for: ${ingredientIds.join(', ')}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  const results = {};
  for (const id of ingredientIds) {
    try {
      results[id] = await fetchIngredient(id);
    } catch (err) {
      console.error(`Error fetching ${id}:`, err.message);
    }
  }

  // Write summary
  const summaryPath = path.join(OUTPUT_DIR, '_summary.json');
  const summary = {
    fetchedAt: new Date().toISOString(),
    ingredients: Object.keys(results).map((id) => ({
      id,
      label: results[id]?.label,
      pubmedArticles: results[id]?.pubmed?.fetchedCount || 0,
      pubmedTotal: results[id]?.pubmed?.totalResults || 0,
      trials: results[id]?.clinicalTrials?.fetchedCount || 0,
      trialsTotal: results[id]?.clinicalTrials?.totalResults || 0,
    })),
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY:');
  for (const ing of summary.ingredients) {
    console.log(`  ${ing.label}: ${ing.pubmedArticles} articles (${ing.pubmedTotal} total PubMed), ${ing.trials} trials`);
  }
  console.log(`\nDone. Files written to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
