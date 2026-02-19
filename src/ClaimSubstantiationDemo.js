import React, { useState } from 'react';
import {
  Database,
  FlaskConical,
  BookOpen,
  Building2,
  Globe,
  Users,
  FileText,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Star,
  Target,
  Zap,
  Brain,
  Pill,
} from 'lucide-react';
import { INGREDIENT_OPTIONS, INGREDIENT_DATA } from './data/demoData';

// ---------------------------------------------------------------------------
// Fade-in keyframes injected via style tag
// ---------------------------------------------------------------------------
const fadeInStyle = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

// ---------------------------------------------------------------------------
// Icon map for data sources
// ---------------------------------------------------------------------------
const SOURCE_ICONS = {
  'PubMed / MEDLINE': Database,
  'ClinicalTrials.gov': FlaskConical,
  'Cochrane Library': BookOpen,
  'Internal Nestlé R&D Archive': Building2,
  'J-STAGE': Globe,
  'CiNii': Globe,
  'EMBASE': Search,
  'Consumer / Social Media': Users,
};

function getSourceIcon(name) {
  for (const key of Object.keys(SOURCE_ICONS)) {
    if (name.includes(key) || key.includes(name)) return SOURCE_ICONS[key];
  }
  return FileText;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(severity) {
  if (!severity) return '#8D8C8C';
  const s = severity.toLowerCase();
  if (s === 'high') return '#FF3366';
  if (s === 'moderate') return '#00A8FF';
  return '#00FFB3';
}

function mapStudyDesign(design) {
  if (!design) return 'Other';
  const d = design.toLowerCase();
  if (d.includes('meta') || d.includes('systematic')) return 'Systematic Reviews & Meta-analyses';
  if (d === 'rct') return 'Randomized Controlled Trials';
  if (d.includes('cohort')) return 'Cohort Studies';
  if (d.includes('case-control')) return 'Case-Control Studies';
  if (d.includes('case-report') || d.includes('case report')) return 'Case Reports / Series';
  return 'Other';
}

function qualityLabel(score) {
  if (score >= 85) return 'High';
  if (score >= 70) return 'Medium';
  return 'Low';
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ClaimSubstantiationDemo() {
  const [selectedIngredient, setSelectedIngredient] = useState('magnesium_sleep');
  const [activeStep, setActiveStep] = useState(1);

  const data = INGREDIENT_DATA[selectedIngredient];
  if (!data) return null;

  const ingestion = data.ingestion || {};
  const studies = data.studies || [];
  const ingredientForms = data.ingredientForms || [];
  const endpointAnalysis = data.endpointAnalysis || [];
  const dosageRanges = data.dosageRanges || [];
  const researchGaps = data.researchGaps || [];
  const suggestedClaims = data.suggestedClaims || [];
  const consumerSocial = data.consumerSocial || {};

  // Compute quality distribution from studies
  const qualityDistribution = studies.reduce(
    (acc, s) => {
      const label = qualityLabel(s.qualityScore);
      if (label === 'High') acc.high++;
      else if (label === 'Medium') acc.medium++;
      else acc.low++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );
  const totalQuality = qualityDistribution.high + qualityDistribution.medium + qualityDistribution.low;

  // Compute study design tiers
  const tierMap = {};
  studies.forEach((s) => {
    const tier = mapStudyDesign(s.studyDesign);
    tierMap[tier] = (tierMap[tier] || 0) + 1;
  });
  const tierOrder = [
    'Systematic Reviews & Meta-analyses',
    'Randomized Controlled Trials',
    'Cohort Studies',
    'Case-Control Studies',
    'Case Reports / Series',
    'Other',
  ];
  const studyDesignTiers = tierOrder
    .filter((t) => tierMap[t])
    .map((t) => ({ tier: t, count: tierMap[t] }));

  // Data source entries
  const dataSources = ingestion.dataSources || [];
  const totalPapers = ingestion.totalPapersIdentified || dataSources.reduce((sum, d) => sum + d.papers, 0);
  const fullText = ingestion.fullTextAccessed || 0;
  const languagesDetected = ingestion.languagesDetected || [];
  const dateRange = ingestion.dateRange
    ? `${ingestion.dateRange.from?.slice(0, 4) || ''}\u2013${ingestion.dateRange.to?.slice(0, 4) || ''}`
    : '';

  // Source progress max
  const maxSourcePapers = Math.max(...dataSources.map((d) => d.papers), 1);

  // Selected option label
  const selectedOption = INGREDIENT_OPTIONS.find((o) => o.id === selectedIngredient);
  const ingredientLabel = selectedOption ? selectedOption.label : '';

  // Confidence colors for claims
  function confidenceColor(c) {
    if (!c) return '#8D8C8C';
    const cl = c.toLowerCase();
    if (cl === 'strong') return '#00FFB3';
    if (cl === 'moderate') return '#00A8FF';
    return '#9D4EDD';
  }

  // ---------------------------------------------------------------------------
  // Steps config
  // ---------------------------------------------------------------------------
  const steps = [
    { num: 1, label: 'Evidence Ingestion' },
    { num: 2, label: 'Quality Assessment' },
    { num: 3, label: 'Claim Intelligence' },
  ];

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111111' }}>
      <style>{fadeInStyle}</style>

      {/* ----------------------------------------------------------------- */}
      {/* HEADER                                                            */}
      {/* ----------------------------------------------------------------- */}
      <header className="px-6 pt-8 pb-4 max-w-7xl mx-auto">
        <h1
          className="text-2xl md:text-3xl tracking-wider mb-1"
          style={{ fontFamily: 'Michroma, sans-serif', color: '#00FFB3' }}
        >
          Claim Substantiation Intelligence
        </h1>
        <p className="text-aurivian-gray text-sm mb-6">
          Nestl&eacute; Health Science VMHS Portfolio
        </p>

        {/* Ingredient selector */}
        <div className="relative inline-block">
          <select
            value={selectedIngredient}
            onChange={(e) => {
              setSelectedIngredient(e.target.value);
              setActiveStep(1);
            }}
            className="appearance-none bg-aurivian-dark-gray/80 border border-aurivian-blue/20 text-aurivian-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-aurivian-blue cursor-pointer"
            style={{ minWidth: 280 }}
          >
            {INGREDIENT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aurivian-blue pointer-events-none" />
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* STEP NAVIGATION                                                   */}
      {/* ----------------------------------------------------------------- */}
      <nav className="px-6 max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 md:gap-4">
          {steps.map((step, i) => {
            const isActive = step.num === activeStep;
            const isCompleted = step.num < activeStep;
            return (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => setActiveStep(step.num)}
                  className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-aurivian-blue text-white'
                        : isCompleted
                        ? 'bg-[#00FFB3] text-aurivian-black'
                        : 'bg-aurivian-dark-gray text-aurivian-gray'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.num}
                  </span>
                  <span
                    className={`text-sm hidden sm:inline ${
                      isActive ? 'text-white font-medium' : 'text-aurivian-gray'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px ${
                      step.num < activeStep ? 'bg-[#00FFB3]' : 'bg-aurivian-dark-gray'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* STEP CONTENT                                                      */}
      {/* ----------------------------------------------------------------- */}
      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-6">
        {/* ============================================================= */}
        {/* STEP 1: Evidence Ingestion & Discovery                        */}
        {/* ============================================================= */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Papers Found', value: totalPapers.toLocaleString(), icon: FileText },
                { label: 'Full-Text Accessed', value: fullText.toLocaleString(), icon: BookOpen },
                { label: 'Languages Detected', value: languagesDetected.length, icon: Globe },
                { label: 'Date Range', value: dateRange, icon: BarChart3 },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="border border-aurivian-blue/20 rounded-xl p-5"
                  style={{
                    backgroundColor: '#2D2C2C',
                    animation: `fadeIn 0.5s ease-in ${idx * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className="w-5 h-5 text-aurivian-blue" />
                    <span className="text-aurivian-gray text-xs uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-aurivian-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Data source cards */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Data Sources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataSources.map((source, index) => {
                  const Icon = getSourceIcon(source.name);
                  const progress = (source.papers / maxSourcePapers) * 100;
                  return (
                    <div
                      key={source.name}
                      className="border border-aurivian-blue/20 rounded-xl p-5 hover:border-aurivian-blue/40 transition-colors"
                      style={{
                        backgroundColor: '#2D2C2C',
                        animation: `fadeIn 0.5s ease-in ${index * 0.15}s both`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-aurivian-blue/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-aurivian-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-aurivian-light-gray text-sm font-medium truncate">{source.name}</p>
                          <p className="text-aurivian-gray text-xs">{source.papers} papers</p>
                        </div>
                      </div>
                      <div className="w-full bg-aurivian-dark-gray rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-aurivian-blue"
                          style={{ width: `${progress}%`, transition: 'width 0.8s ease' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totality of Evidence callout */}
            <div
              className="border border-[#00FFB3]/30 rounded-xl p-5 flex items-center gap-4"
              style={{ backgroundColor: 'rgba(0, 255, 179, 0.05)' }}
            >
              <Zap className="w-6 h-6 text-[#00FFB3] flex-shrink-0" />
              <p className="text-aurivian-light-gray text-sm">
                <span className="font-bold text-[#00FFB3]">{totalPapers} papers analyzed</span>
                {' \u2014 '}
                <span className="text-aurivian-gray">
                  across {data.ingestion.dataSources.length} data sources in {data.ingestion.languagesDetected.length} languages
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* STEP 2: Quality Assessment & Enrichment                       */}
        {/* ============================================================= */}
        {activeStep === 2 && (
          <div className="space-y-6">
            {/* Quality distribution */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Quality Distribution
              </h2>
              <div
                className="border border-aurivian-blue/20 rounded-xl p-6 space-y-4"
                style={{ backgroundColor: '#2D2C2C' }}
              >
                {[
                  { label: 'High', count: qualityDistribution.high, color: '#00FFB3' },
                  { label: 'Medium', count: qualityDistribution.medium, color: '#00A8FF' },
                  { label: 'Low', count: qualityDistribution.low, color: '#FF3366' },
                ].map((q) => {
                  const pct = totalQuality > 0 ? ((q.count / totalQuality) * 100).toFixed(0) : 0;
                  return (
                    <div key={q.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-aurivian-light-gray font-medium">{q.label} Quality</span>
                        <span className="text-aurivian-gray">
                          {q.count} studies ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-aurivian-dark-gray rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: q.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study design tier */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Study Design Hierarchy
              </h2>
              <div
                className="border border-aurivian-blue/20 rounded-xl p-6"
                style={{ backgroundColor: '#2D2C2C' }}
              >
                <div className="space-y-3">
                  {studyDesignTiers.map((tier, idx) => {
                    const maxCount = Math.max(...studyDesignTiers.map((t) => t.count), 1);
                    const widthPct = Math.max((tier.count / maxCount) * 100, 12);
                    // Gradient from top tier (cyan) to bottom (purple)
                    const colors = ['#00FFB3', '#00D4A0', '#00A8FF', '#6B8CFF', '#9D4EDD', '#8D8C8C'];
                    const barColor = colors[idx] || '#8D8C8C';
                    return (
                      <div key={tier.tier} className="flex items-center gap-4">
                        <span className="text-aurivian-gray text-xs w-64 min-w-[160px] text-right hidden md:block">
                          {tier.tier}
                        </span>
                        <span className="text-aurivian-gray text-xs md:hidden min-w-[40px]">
                          L{idx + 1}
                        </span>
                        <div className="flex-1 bg-aurivian-dark-gray rounded h-6 relative">
                          <div
                            className="h-6 rounded flex items-center px-3 transition-all duration-700"
                            style={{ width: `${widthPct}%`, backgroundColor: barColor }}
                          >
                            <span className="text-xs font-bold text-aurivian-black whitespace-nowrap">
                              {tier.count}
                            </span>
                          </div>
                        </div>
                        <span className="text-aurivian-gray text-xs w-64 min-w-[160px] md:hidden">
                          {tier.tier}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form analysis table */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Ingredient Form Analysis
              </h2>
              <div
                className="border border-aurivian-blue/20 rounded-xl overflow-hidden"
                style={{ backgroundColor: '#2D2C2C' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-aurivian-blue/10">
                        <th className="text-left p-4 text-aurivian-gray font-medium">Form</th>
                        <th className="text-left p-4 text-aurivian-gray font-medium">Studies</th>
                        <th className="text-left p-4 text-aurivian-gray font-medium">Key Finding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredientForms.map((form, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-aurivian-blue/5 hover:bg-aurivian-dark-gray transition-colors"
                        >
                          <td className="p-4 text-aurivian-light-gray font-medium">{form.form}</td>
                          <td className="p-4 text-aurivian-gray">{form.studyCount}</td>
                          <td className="p-4 text-aurivian-gray text-xs leading-relaxed">
                            {form.efficacySummary}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Multilingual indicator */}
            <div
              className="border border-aurivian-blue/20 rounded-xl p-5 flex items-center gap-4"
              style={{ backgroundColor: '#2D2C2C' }}
            >
              <Globe className="w-6 h-6 text-aurivian-blue flex-shrink-0" />
              <div>
                <p className="text-aurivian-light-gray text-sm font-medium">
                  {languagesDetected.length} languages processed
                </p>
                <p className="text-aurivian-gray text-xs mt-1">
                  {languagesDetected.join(' \u00B7 ')}
                </p>
              </div>
            </div>

            {/* Methodology extraction preview */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Methodology Extraction Preview
              </h2>
              <p className="text-aurivian-gray text-xs mb-3">
                Sample study: <span className="text-aurivian-light-gray italic">{studies[0]?.title?.slice(0, 80)}...</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Population', value: studies[0]?.population || 'N/A', icon: Users },
                  { label: 'Dosage', value: studies[0]?.dose || 'N/A', icon: Pill },
                  {
                    label: 'Primary Endpoints',
                    value: (studies[0]?.endpoints || []).join(', ') || 'N/A',
                    icon: Target,
                  },
                  {
                    label: 'Effect Summary',
                    value: studies[0]?.effectSummary?.slice(0, 80) || 'N/A',
                    icon: TrendingUp,
                  },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className="border border-aurivian-blue/20 rounded-xl p-4"
                    style={{
                      backgroundColor: '#2D2C2C',
                      animation: `fadeIn 0.5s ease-in ${idx * 0.15}s both`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-4 h-4 text-aurivian-blue" />
                      <span className="text-aurivian-gray text-xs uppercase tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-aurivian-light-gray text-xs leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* STEP 3: Claim Intelligence Outputs                            */}
        {/* ============================================================= */}
        {activeStep === 3 && (
          <div className="space-y-6">
            {/* Evidence summary card */}
            <div
              className="border border-aurivian-blue/20 rounded-xl p-6"
              style={{ backgroundColor: '#2D2C2C' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-7 h-7 text-[#00FFB3]" />
                  <h2
                    className="text-lg tracking-wide text-white"
                    style={{ fontFamily: 'Michroma, sans-serif' }}
                  >
                    {ingredientLabel}
                  </h2>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full w-fit"
                  style={{
                    backgroundColor: `${confidenceColor(suggestedClaims[0]?.confidence)}20`,
                    color: confidenceColor(suggestedClaims[0]?.confidence),
                    border: `1px solid ${confidenceColor(suggestedClaims[0]?.confidence)}40`,
                  }}
                >
                  {suggestedClaims[0]?.confidence || 'N/A'} Evidence
                </span>
              </div>
              <p className="text-aurivian-light-gray text-sm leading-relaxed">
                {data.ingredient} for {data.claimArea}: analyzed {totalPapers} papers across{' '}
                {languagesDetected.length} languages. {studies.length} key studies evaluated with{' '}
                {qualityDistribution.high} high-quality studies forming the evidence core. The totality
                of evidence supports a{' '}
                <span style={{ color: confidenceColor(suggestedClaims[0]?.confidence) }}>
                  {suggestedClaims[0]?.confidence?.toLowerCase() || 'moderate'}
                </span>{' '}
                substantiation position.
              </p>
            </div>

            {/* Endpoint Analysis */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Endpoint Analysis
              </h2>
              <div
                className="border border-aurivian-blue/20 rounded-xl p-6 space-y-5"
                style={{ backgroundColor: '#2D2C2C' }}
              >
                {endpointAnalysis.map((ep) => {
                  const total = ep.totalStudies || 1;
                  const supPct = (ep.supporting / total) * 100;
                  const neuPct = (ep.neutral / total) * 100;
                  const negPct = (ep.negative / total) * 100;
                  return (
                    <div key={ep.endpoint}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-aurivian-light-gray text-sm font-medium">{ep.endpoint}</span>
                        <span className="text-aurivian-gray text-xs">
                          {ep.totalStudies} studies &middot; {ep.averageEffectSize}
                        </span>
                      </div>
                      <div className="flex w-full h-4 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${supPct}%`, backgroundColor: '#00FFB3' }}
                          title={`Supporting: ${ep.supporting}`}
                        />
                        <div
                          className="h-full"
                          style={{ width: `${neuPct}%`, backgroundColor: '#4A4A4A' }}
                          title={`Neutral: ${ep.neutral}`}
                        />
                        <div
                          className="h-full"
                          style={{ width: `${negPct}%`, backgroundColor: '#FF3366' }}
                          title={`Negative: ${ep.negative}`}
                        />
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-aurivian-gray">
                        <span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#00FFB3] mr-1" />
                          {ep.supporting} supporting
                        </span>
                        <span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#4A4A4A] mr-1" />
                          {ep.neutral} neutral
                        </span>
                        {ep.negative > 0 && (
                          <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-[#FF3366] mr-1" />
                            {ep.negative} negative
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dosage Analysis */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Dosage Analysis
              </h2>
              <div
                className="border border-aurivian-blue/20 rounded-xl overflow-hidden"
                style={{ backgroundColor: '#2D2C2C' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-aurivian-blue/10">
                        <th className="text-left p-4 text-aurivian-gray font-medium">Form</th>
                        <th className="text-left p-4 text-aurivian-gray font-medium">Effective Dose</th>
                        <th className="text-left p-4 text-aurivian-gray font-medium">Optimal Dose</th>
                        <th className="text-left p-4 text-aurivian-gray font-medium">Timing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dosageRanges.map((d, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-aurivian-blue/5 hover:bg-aurivian-dark-gray transition-colors"
                        >
                          <td className="p-4 text-aurivian-light-gray font-medium">{d.form}</td>
                          <td className="p-4 text-aurivian-gray">{d.effectiveDose}</td>
                          <td className="p-4 text-[#00FFB3] font-medium">{d.optimalDose}</td>
                          <td className="p-4 text-aurivian-gray text-xs">{d.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Research Gaps */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Research Gaps
              </h2>
              <div className="space-y-3">
                {researchGaps.map((g, idx) => (
                  <div
                    key={idx}
                    className="border border-aurivian-blue/20 rounded-xl p-4 flex items-start gap-4 hover:border-aurivian-blue/40 transition-colors"
                    style={{ backgroundColor: '#2D2C2C' }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle
                        className="w-5 h-5"
                        style={{ color: severityColor(g.severity) }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-aurivian-light-gray text-sm font-medium">{g.gap}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{
                            color: severityColor(g.severity),
                            backgroundColor: `${severityColor(g.severity)}15`,
                            border: `1px solid ${severityColor(g.severity)}30`,
                          }}
                        >
                          {g.severity}
                        </span>
                      </div>
                      <p className="text-aurivian-gray text-xs leading-relaxed">{g.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Claim Wording */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Suggested Claim Wording
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                {suggestedClaims.map((c, idx) => (
                  <div
                    key={idx}
                    className="border border-aurivian-blue/20 rounded-xl p-5 hover:border-aurivian-blue/40 transition-colors"
                    style={{
                      backgroundColor: '#2D2C2C',
                      animation: `fadeIn 0.5s ease-in ${idx * 0.15}s both`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${confidenceColor(c.confidence)}20`,
                          color: confidenceColor(c.confidence),
                          border: `1px solid ${confidenceColor(c.confidence)}40`,
                        }}
                      >
                        {c.confidence}
                      </span>
                      <span className="text-aurivian-gray text-xs">{c.evidenceLevel}</span>
                    </div>
                    <p className="text-aurivian-light-gray text-sm leading-relaxed mb-3 italic">
                      &ldquo;{c.claimText}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 text-xs text-aurivian-gray">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {c.supportingStudyCount} supporting studies
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        {c.regulatoryContext?.slice(0, 60)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Defense Package */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Claim Defense Package
              </h2>
              <div
                className="border border-aurivian-blue/20 rounded-xl p-6 space-y-5"
                style={{ backgroundColor: '#2D2C2C' }}
              >
                {/* Strength of evidence bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-aurivian-light-gray text-sm font-medium">
                      Strength of Evidence
                    </span>
                    <span className="text-[#00FFB3] text-sm font-bold">
                      {endpointAnalysis.length > 0
                        ? Math.round(
                            (endpointAnalysis.reduce((sum, ep) => sum + ep.supporting / ep.totalStudies, 0) /
                              endpointAnalysis.length) *
                              100
                          )
                        : 0}
                      /100
                    </span>
                  </div>
                  <div className="w-full bg-aurivian-dark-gray rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#00FFB3] transition-all duration-700"
                      style={{
                        width: `${
                          endpointAnalysis.length > 0
                            ? Math.round(
                                (endpointAnalysis.reduce(
                                  (sum, ep) => sum + ep.supporting / ep.totalStudies,
                                  0
                                ) /
                                  endpointAnalysis.length) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Consistency across studies bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-aurivian-light-gray text-sm font-medium">
                      Consistency Across Studies
                    </span>
                    <span className="text-[#00A8FF] text-sm font-bold">
                      {endpointAnalysis.length > 0
                        ? Math.round(
                            (endpointAnalysis.reduce(
                              (sum, ep) => sum + (ep.supporting + ep.neutral) / ep.totalStudies,
                              0
                            ) /
                              endpointAnalysis.length) *
                              100
                          )
                        : 0}
                      /100
                    </span>
                  </div>
                  <div className="w-full bg-aurivian-dark-gray rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#00A8FF] transition-all duration-700"
                      style={{
                        width: `${
                          endpointAnalysis.length > 0
                            ? Math.round(
                                (endpointAnalysis.reduce(
                                  (sum, ep) => sum + (ep.supporting + ep.neutral) / ep.totalStudies,
                                  0
                                ) /
                                  endpointAnalysis.length) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Biological plausibility */}
                <div>
                  <span className="text-aurivian-light-gray text-sm font-medium block mb-1">
                    Biological Plausibility
                  </span>
                  <p className="text-aurivian-gray text-xs leading-relaxed">
                    {selectedIngredient === 'magnesium_sleep' &&
                      'Magnesium regulates GABA receptors and melatonin pathways; acts as a positive allosteric modulator at GABA-A receptors. Well-characterized mechanism with strong in-vitro and in-vivo support.'}
                    {selectedIngredient === 'red_clover_menopause' &&
                      'Isoflavones (biochanin A, formononetin) act as selective estrogen receptor modulators (SERMs), preferentially binding ER-\u03B2. Well-characterized phytoestrogenic mechanism relevant to vasomotor symptom modulation.'}
                    {selectedIngredient === 'collagen_skin' &&
                      'Collagen peptides are absorbed as bioactive di/tripeptides (Pro-Hyp, Hyp-Gly) that accumulate in the dermis and stimulate fibroblast proliferation, collagen synthesis, and hyaluronic acid production. Well-characterized absorption and distribution pathway.'}
                  </p>
                </div>

                {/* Dose-response relationship */}
                <div>
                  <span className="text-aurivian-light-gray text-sm font-medium block mb-1">
                    Dose-Response Relationship
                  </span>
                  <p className="text-aurivian-gray text-xs leading-relaxed">
                    {selectedIngredient === 'magnesium_sleep' &&
                      'Clear dose-response observed between 200\u2013400 mg elemental Mg for glycinate and citrate forms. Threshold effect at ~300 mg/day. No additional benefit above 400 mg. Oxide shows poor response due to low bioavailability.'}
                    {selectedIngredient === 'red_clover_menopause' &&
                      'Dose-response demonstrated between 40\u2013160 mg isoflavones/day. 80 mg appears optimal with 56% hot flash reduction. 160 mg shows no additional benefit. Equol producer status modifies response magnitude.'}
                    {selectedIngredient === 'collagen_skin' &&
                      'Dose-response observed between 2.5\u201310 g/day with diminishing returns above 5 g for most sources. VERISOL-type bioactive peptides effective at lower 2.5 g dose. Duration of 8+ weeks required for measurable effects.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Consumer Intelligence */}
            <div>
              <h2
                className="text-lg mb-4 tracking-wide"
                style={{ fontFamily: 'Michroma, sans-serif', color: '#00A8FF' }}
              >
                Consumer Intelligence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sentiment + questions */}
                <div
                  className="border border-aurivian-blue/20 rounded-xl p-5"
                  style={{ backgroundColor: '#2D2C2C' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-5 h-5 text-aurivian-blue" />
                    <span className="text-aurivian-light-gray text-sm font-medium">
                      Consumer Sentiment
                    </span>
                    <span className="ml-auto text-[#00FFB3] font-bold text-lg">
                      {Math.round((consumerSocial.sentimentScore || 0) * 100)}%
                    </span>
                  </div>
                  <p className="text-aurivian-gray text-xs mb-3">
                    Based on {consumerSocial.sampleSize?.toLocaleString() || 0} posts &middot;{' '}
                    {consumerSocial.dataWindow}
                  </p>
                  <div className="space-y-2">
                    <p className="text-aurivian-gray text-xs uppercase tracking-wide mb-1">
                      Top Consumer Questions
                    </p>
                    {(consumerSocial.commonQuestions || []).slice(0, 4).map((q, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-aurivian-blue flex-shrink-0 mt-0.5" />
                        <span className="text-aurivian-light-gray text-xs">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand mentions */}
                <div
                  className="border border-aurivian-blue/20 rounded-xl p-5"
                  style={{ backgroundColor: '#2D2C2C' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-aurivian-blue" />
                    <span className="text-aurivian-light-gray text-sm font-medium">Brand Mentions</span>
                  </div>
                  <div className="space-y-3">
                    {(consumerSocial.brandMentions || []).map((b, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-aurivian-light-gray text-xs flex-1 min-w-0 truncate">
                          {b.brand}
                        </span>
                        <span className="text-aurivian-gray text-xs w-16 text-right">
                          {b.mentions.toLocaleString()}
                        </span>
                        <div className="w-20 bg-aurivian-dark-gray rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.round(b.sentiment * 100)}%`,
                              backgroundColor:
                                b.sentiment >= 0.75
                                  ? '#00FFB3'
                                  : b.sentiment >= 0.65
                                  ? '#00A8FF'
                                  : '#FF3366',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
