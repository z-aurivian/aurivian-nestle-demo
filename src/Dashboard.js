import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const evidenceData = [
  { ingredient: 'Omega-3 + Heart Health', score: 89 },
  { ingredient: 'Magnesium + Sleep', score: 87 },
  { ingredient: 'Vitamin D + Bone Health', score: 85 },
  { ingredient: 'Collagen + Skin Elasticity', score: 82 },
  { ingredient: 'Probiotics + Gut Health', score: 78 },
  { ingredient: 'Lutein + Eye Health', score: 76 },
  { ingredient: 'Red Clover + Menopause', score: 71 },
  { ingredient: 'Biotin + Hair Growth', score: 64 },
];

const studyQualityData = [
  { name: 'High Quality', value: 342 },
  { name: 'Medium Quality', value: 518 },
  { name: 'Low Quality', value: 187 },
];
const studyQualityColors = ['#00FFB3', '#00A8FF', '#FF3366'];

const publicationTrendsData = [
  { year: '2018', Magnesium: 28, Collagen: 15, 'Red Clover': 12 },
  { year: '2019', Magnesium: 35, Collagen: 22, 'Red Clover': 14 },
  { year: '2020', Magnesium: 42, Collagen: 31, 'Red Clover': 18 },
  { year: '2021', Magnesium: 51, Collagen: 45, 'Red Clover': 21 },
  { year: '2022', Magnesium: 63, Collagen: 58, 'Red Clover': 24 },
  { year: '2023', Magnesium: 78, Collagen: 72, 'Red Clover': 28 },
  { year: '2024', Magnesium: 92, Collagen: 89, 'Red Clover': 31 },
];

const languageData = [
  { name: 'English', value: 724 },
  { name: 'Japanese', value: 89 },
  { name: 'German', value: 52 },
  { name: 'Chinese', value: 41 },
  { name: 'Other', value: 28 },
];
const languageColors = ['#00A8FF', '#FF3CAC', '#9D4EDD', '#F9E900', '#8D8C8C'];

const brandData = [
  { brand: 'Pure Encapsulations', papers: 156 },
  { brand: 'Solgar', papers: 134 },
  { brand: "Nature's Bounty", papers: 112 },
  { brand: 'Vital Proteins', papers: 98 },
  { brand: 'Garden of Life', papers: 87 },
];

const heatmapRows = ['Magnesium', 'Collagen', 'Red Clover', 'Probiotics', 'Vitamin D', 'Omega-3'];
const heatmapCols = ['Pediatric', 'Elderly', 'Long-term Safety', 'Dose-Response', 'Diverse Populations'];
// 0 = gap (red), 1 = some data (yellow), 2 = adequate (green)
const heatmapValues = [
  [1, 2, 1, 2, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 0, 0],
  [1, 2, 1, 2, 1],
  [2, 2, 2, 2, 1],
  [1, 2, 2, 2, 1],
];
const heatmapColorMap = {
  0: '#FF3366',
  1: '#F9E900',
  2: '#00FFB3',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#2D2C2C', border: '1px solid #8D8C8C', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ color: '#FAFAFA', margin: 0, fontSize: 12 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#00A8FF', margin: 0, fontSize: 12 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderPieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

export default function Dashboard() {
  return (
    <div style={{ backgroundColor: '#111111', minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontFamily: 'Michroma, sans-serif',
            color: '#00FFB3',
            fontSize: '1.75rem',
            marginBottom: '0.25rem',
          }}
        >
          Portfolio Analytics
        </h1>
        <p style={{ color: '#8D8C8C', fontSize: '0.875rem', margin: 0 }}>
          Nestl&eacute; Health Science VMHS Evidence Overview
        </p>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Evidence Strength Across Portfolio */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#2D2C2C' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#E3E3E3' }}>
            Evidence Strength Across Portfolio
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evidenceData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2C2C" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#8D8C8C', fontSize: 12 }}
                axisLine={{ stroke: '#2D2C2C' }}
              />
              <YAxis
                type="category"
                dataKey="ingredient"
                tick={{ fill: '#8D8C8C', fontSize: 12 }}
                axisLine={{ stroke: '#2D2C2C' }}
                width={180}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#00A8FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Study Quality Distribution */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#2D2C2C' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#E3E3E3' }}>
            Study Quality Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studyQualityData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={renderPieLabel}
                labelLine={{ stroke: '#8D8C8C' }}
              >
                {studyQualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={studyQualityColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Publication Trends Over Time */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#2D2C2C' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#E3E3E3' }}>
            Publication Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={publicationTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2C2C" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#8D8C8C', fontSize: 12 }}
                axisLine={{ stroke: '#2D2C2C' }}
              />
              <YAxis
                tick={{ fill: '#8D8C8C', fontSize: 12 }}
                axisLine={{ stroke: '#2D2C2C' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#8D8C8C' }} />
              <Line type="monotone" dataKey="Magnesium" stroke="#00A8FF" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Collagen" stroke="#9D4EDD" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Red Clover" stroke="#FF3CAC" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Language Distribution */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#2D2C2C' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#E3E3E3' }}>
            Language Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={renderPieLabel}
                labelLine={{ stroke: '#8D8C8C' }}
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={languageColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Brand Coverage */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#2D2C2C' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#E3E3E3' }}>
            Brand Coverage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2C2C" />
              <XAxis
                dataKey="brand"
                tick={{ fill: '#8D8C8C', fontSize: 11 }}
                axisLine={{ stroke: '#2D2C2C' }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: '#8D8C8C', fontSize: 12 }}
                axisLine={{ stroke: '#2D2C2C' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="papers" fill="#00A8FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Evidence Gap Heatmap */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#2D2C2C' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#E3E3E3' }}>
            Evidence Gap Heatmap
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
              <thead>
                <tr>
                  <th style={{ color: '#8D8C8C', fontSize: 11, textAlign: 'left', padding: '4px 8px', fontWeight: 500 }}></th>
                  {heatmapCols.map((col) => (
                    <th
                      key={col}
                      style={{
                        color: '#8D8C8C',
                        fontSize: 11,
                        textAlign: 'center',
                        padding: '4px 6px',
                        fontWeight: 500,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapRows.map((row, ri) => (
                  <tr key={row}>
                    <td style={{ color: '#E3E3E3', fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }}>
                      {row}
                    </td>
                    {heatmapValues[ri].map((val, ci) => (
                      <td
                        key={ci}
                        style={{
                          backgroundColor: heatmapColorMap[val],
                          opacity: 0.75,
                          borderRadius: 4,
                          width: 48,
                          height: 32,
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: 10, color: '#111111', fontWeight: 600 }}>
                          {val === 2 ? 'OK' : val === 1 ? 'Low' : 'Gap'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              {[
                { label: 'Adequate Data', color: '#00FFB3' },
                { label: 'Some Data', color: '#F9E900' },
                { label: 'Evidence Gap', color: '#FF3366' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: item.color, opacity: 0.75 }} />
                  <span style={{ color: '#8D8C8C', fontSize: 11 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
