import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine
} from 'recharts';
import {
  AlertTriangle, CheckCircle2, Zap, Download, GitFork,
  Activity, RefreshCcw, Heart, ShieldCheck
} from 'lucide-react';
import { downloadReport } from '@/services/api';
import type { AssessmentResponse } from '@/types';
import toast from 'react-hot-toast';

/* ── Animated SVG gauge ── */
function RiskGauge({ percent, color }: { percent: number; color: string }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ margin: '1rem 0' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-sm">
        {/* Bg track */}
        <circle cx="90" cy="90" r={r} fill="none" strokeWidth="12" stroke="#F3F4F6" />
        {/* Glow ring */}
        <circle cx="90" cy="90" r={r} fill="none" strokeWidth="12" stroke={color} strokeOpacity="0.08" />
        {/* Active fill */}
        <motion.circle
          cx="90" cy="90" r={r}
          fill="none" strokeWidth="12" stroke={color}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          transform="rotate(-90 90 90)"
        />
        {/* Center text */}
        <text x="90" y="82" textAnchor="middle" dominantBaseline="middle"
          fill="#111827" fontSize="32" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
          {percent}%
        </text>
        <text x="90" y="104" textAnchor="middle"
          fill="#6B7280" fontSize="11" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
          Bayesian Risk
        </text>
      </svg>
      {/* Soft color backdrop */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        background: `radial-gradient(circle at center, ${color}0C 0%, transparent 70%)`,
      }} />
    </div>
  );
}

/* ── Custom tooltip for recharts ── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const isPositive = d.value > 0;
  return (
    <div className="card" style={{ padding: '0.6rem 0.9rem', fontSize: '0.78rem', boxShadow: 'var(--shadow-md)', background: '#FFFFFF', border: '1px solid #E8E8E4' }}>
      <p style={{ fontWeight: 700, color: '#111827', marginBottom: '0.15rem' }}>{d.payload.name}</p>
      <p style={{ color: isPositive ? 'var(--danger)' : '#16A34A', fontWeight: 700 }}>
        {isPositive ? '↑ Increases' : '↓ Reduces'} risk by {(Math.abs(d.value) * 100).toFixed(1)}%
      </p>
    </div>
  );
}

/* ── Feature labels ── */
const FEAT_LABELS: Record<string, string> = {
  age:'Age', sex:'Sex', cp:'Chest Pain', trestbps:'Blood Pressure',
  chol:'Cholesterol', fbs:'Blood Sugar', restecg:'ECG', thalach:'Max HR',
  exang:'Ex. Angina', oldpeak:'ST Depress.', slope:'ST Slope',
  ca:'Vessels (ca)', thal:'Thalassemia',
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AssessmentResponse | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [shapTab, setShapTab] = useState<'bar' | 'table'>('bar');

  useEffect(() => {
    const stored = sessionStorage.getItem('cardiotwin_result');
    if (stored) {
      try { setData(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  /* ── Empty state ── */
  if (!data) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '6rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div className="icon-wrap icon-wrap-lg icon-wrap-primary shadow-sm" style={{ margin: '0 auto 1.5rem', width: 64, height: 64, borderRadius: '1.25rem' }}>
            <Heart size={30} className="heartbeat" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>No Assessment Found</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 380, margin: '0.5rem auto 2rem' }}>
            Please complete a cardiovascular health assessment first to view personalized Bayesian outputs.
          </p>
          <button className="btn-primary" onClick={() => navigate('/assessment')}>
            <Activity size={16} /> Start Assessment
          </button>
        </motion.div>
      </div>
    );
  }

  const { results, inputs, shapContributions, shapBaseValue } = data;
  const riskPct = Math.round(results.bayesianRiskProb * 100);
  const xgbPct  = Math.round(results.xgboostRiskProb * 100);
  
  let gaugeColor = 'var(--secondary)';
  let riskColorClass = 'risk-low';
  if (riskPct >= 60) {
    gaugeColor = 'var(--danger)';
    riskColorClass = 'risk-high';
  } else if (riskPct >= 35) {
    gaugeColor = 'var(--warning)';
    riskColorClass = 'risk-moderate';
  }

  /* SHAP chart data */
  const shapData = Object.entries(shapContributions)
    .map(([k, v]) => ({ name: FEAT_LABELS[k] || k, key: k, value: v }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10);

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading('Generating PDF report…');
    try {
      await downloadReport(inputs, results);
      toast.success('Report downloaded!', { id: toastId });
    } catch {
      toast.error('PDF generation failed — is the backend running?', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }} className="space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E8E8E4', paddingBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-wrap icon-wrap-md icon-wrap-primary shadow-sm" style={{ width: 42, height: 42, borderRadius: '0.875rem' }}>
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="page-title">Results Dashboard</h1>
              <p className="page-subtitle" style={{ marginTop: '0.15rem' }}>
                Cardiovascular health profile analysis generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={handleDownload} disabled={downloading} className="btn-secondary">
            <Download size={14} /> {downloading ? 'Generating…' : 'Download Report'}
          </button>
          <button onClick={() => navigate('/assessment')} className="btn-ghost">
            <RefreshCcw size={14} /> Reassess
          </button>
        </div>
      </motion.div>

      {/* ── Top 3-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Gauge card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <RiskGauge percent={riskPct} color={gaugeColor} />
          <div className={`risk-badge ${riskColorClass}`} style={{ marginTop: '0.5rem' }}>
            {riskPct >= 35 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            <span>{results.riskGroup} Risk Group</span>
          </div>
        </motion.div>

        {/* Model comparison */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Risk Engine Consensus
            </h3>
            {[
              { label: 'Bayesian Network', pct: riskPct, color: 'var(--primary)', tag: 'Primary Probabilistic Engine' },
              { label: 'XGBoost Predictor', pct: xgbPct, color: 'var(--accent)', tag: 'Complementary Machine Learning' },
            ].map((m, idx) => (
              <div key={m.label} style={{ marginBottom: idx === 0 ? '1.25rem' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: m.color }}>{m.pct}%</span>
                </div>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99 }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                  />
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{m.tag}</p>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #E8E8E4', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Model Agreement</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: Math.abs(riskPct - xgbPct) <= 10 ? '#16A34A' : '#D97706' }}>
              {Math.abs(riskPct - xgbPct) <= 10 ? '✅ Confirmed Consensus' : '⚠️ Deviated Consensus'} (Δ{Math.abs(riskPct - xgbPct)}%)
            </span>
          </div>
        </motion.div>

        {/* Score cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Key Performance Indicators
          </h3>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Risk indicators */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius)', background: 'var(--bg-alt)', border: '1px solid #E8E8E4' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Risk Score Flags</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)' }}>{results.riskScore}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 10</span>
              </div>
              <div style={{ height: 5, background: '#E5E7EB', borderRadius: 99, marginTop: '0.5rem' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.riskScore * 10}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: gaugeColor }}
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{results.riskScore} hazard indicators present.</p>
            </div>

            {/* Health index */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius)', background: 'var(--bg-alt)', border: '1px solid #E8E8E4' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Health Index</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
                <span className="gradient-text-green" style={{ fontSize: '1.75rem', fontWeight: 900 }}>{results.healthScore}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Calculated based on positive health markers.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── SHAP Feature Contributions ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card"
        style={{ padding: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              Feature Importance Map (SHAP)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Base risk expectation: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{(shapBaseValue * 100).toFixed(1)}%</span>
              &nbsp;·&nbsp; <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Orange increases risk</span> &nbsp;·&nbsp; <span style={{ color: '#16A34A', fontWeight: 700 }}>Green reduces risk</span>
            </p>
          </div>
          <div className="tab-group">
            {(['bar', 'table'] as const).map(t => (
              <button key={t} onClick={() => setShapTab(t)}
                className={`tab-btn ${shapTab === t ? 'active' : ''}`}>
                {t === 'bar' ? 'Visual Chart' : 'Detailed Table'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {shapTab === 'bar' ? (
            <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                  <XAxis type="number" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(1)}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#374151', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <ReferenceLine x={0} stroke="#E5E7EB" strokeWidth={1.5} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                    {shapData.map((d, i) => (
                      <Cell key={i} fill={d.value > 0 ? 'var(--primary)' : 'var(--secondary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Feature Parameter</th>
                    <th>Risk Impact (SHAP)</th>
                    <th>Status</th>
                    <th>Strength Indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {shapData.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{d.name}</td>
                      <td className="tabular-nums" style={{ color: d.value > 0 ? 'var(--primary-dark)' : '#16A34A', fontWeight: 800 }}>
                        {d.value > 0 ? '+' : ''}{(d.value * 100).toFixed(2)}%
                      </td>
                      <td>
                        {d.value > 0
                          ? <span className="chip chip-primary">Elevates Risk</span>
                          : <span className="chip chip-green">Reduces Risk</span>}
                      </td>
                      <td>
                        <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, width: 100 }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.abs(d.value) * 600)}%`, background: d.value > 0 ? 'var(--primary)' : 'var(--secondary)' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Recommendations ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="card"
        style={{ padding: '2rem' }}
      >
        <h2 className="section-title flex items-center gap-2 mb-4" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
          Clinical Action Recommendations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {results.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              style={{ display: 'flex', gap: '0.85rem', padding: '1.25rem', borderRadius: 'var(--radius)', background: 'var(--bg-alt)', border: '1px solid #E8E8E4' }}
            >
              <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{rec.slice(0, 2)}</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                {rec.slice(2).trim()}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Action bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem' }}
      >
        <button className="btn-primary shadow-primary" onClick={() => navigate('/simulator')}>
          <Zap size={15} /> Open What-If Simulator
        </button>
        <button className="btn-secondary" onClick={() => navigate('/explain')}>
          <GitFork size={15} /> Explainability Center
        </button>
        <button className="btn-secondary" onClick={handleDownload} disabled={downloading}>
          <Download size={15} /> {downloading ? 'Downloading Report…' : 'Export PDF'}
        </button>
        <button className="btn-ghost" onClick={() => navigate('/assessment')}>
          <RefreshCcw size={14} /> Retake Assessment
        </button>
      </motion.div>
    </div>
  );
}
