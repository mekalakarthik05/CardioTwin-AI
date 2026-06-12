import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine
} from 'recharts';
import { GitFork, Brain, Activity, ChevronRight, ArrowRight, Info, Heart } from 'lucide-react';
import type { AssessmentResponse } from '@/types';

/* ── Feature display labels ── */
const FEAT_LABELS: Record<string, string> = {
  age:'Age', sex:'Sex', cp:'Chest Pain', trestbps:'Blood Pressure',
  chol:'Cholesterol', fbs:'Blood Sugar', restecg:'ECG', thalach:'Max HR',
  exang:'Ex. Angina', oldpeak:'ST Depression', slope:'ST Slope',
  ca:'Vessels (ca)', thal:'Thalassemia', target:'Heart Disease',
};

/* ── Bayesian DAG node layout ── */
const NODE_POS: Record<string, [number, number]> = {
  age:      [80,  55],
  sex:      [220, 55],
  cp:       [360, 55],
  restecg:  [500, 55],
  trestbps: [80,  170],
  chol:     [220, 170],
  fbs:      [360, 170],
  slope:    [500, 170],
  thalach:  [80,  285],
  exang:    [220, 285],
  oldpeak:  [360, 285],
  ca:       [500, 285],
  thal:     [290, 380],
  target:   [290, 480],
};

function DAGGraph({ edges, nodes }: { edges: { source: string; target: string }[]; nodes: string[] }) {
  const allNodes = [...new Set([...nodes, 'target'])];
  const W = 620, H = 560;

  return (
    <div className="overflow-x-auto rounded-xl" style={{ background: 'var(--bg-alt)', padding: '1rem', border: '1px solid #E8E8E4' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto" style={{ minWidth: W }}>
        <defs>
          <marker id="arr-primary" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--primary)" />
          </marker>
          <marker id="arr-danger" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--danger)" />
          </marker>
          <filter id="glow-light">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const from = NODE_POS[e.source];
          const to   = NODE_POS[e.target];
          if (!from || !to) return null;
          const toTarget = e.target === 'target';
          const mx = (from[0] + to[0]) / 2;
          const my = (from[1] + to[1]) / 2;
          return (
            <motion.path
              key={i}
              d={`M${from[0]},${from[1]+18} Q${mx},${my} ${to[0]},${to[1]-18}`}
              fill="none"
              stroke={toTarget ? 'var(--danger)' : 'var(--primary)'}
              strokeWidth={toTarget ? 2 : 1.2}
              strokeDasharray={toTarget ? '0' : '3,3'}
              markerEnd={`url(#arr-${toTarget ? 'danger' : 'primary'})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
            />
          );
        })}

        {/* Nodes */}
        {allNodes.map((node, i) => {
          const pos = NODE_POS[node];
          if (!pos) return null;
          const isTarget = node === 'target';
          const label = FEAT_LABELS[node] || node;
          return (
            <motion.g key={node} transform={`translate(${pos[0]},${pos[1]})`}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}>
              <rect x="-52" y="-18" width="104" height="36" rx="8"
                fill={isTarget ? 'var(--danger-soft)' : 'var(--surface)'}
                stroke={isTarget ? 'var(--danger)' : 'var(--border)'}
                strokeWidth="1.5" filter="url(#glow-light)" />
              <text textAnchor="middle" dominantBaseline="middle"
                fill={isTarget ? 'var(--danger)' : 'var(--text)'}
                fontSize="10.5" fontWeight={700} fontFamily="Plus Jakarta Sans">
                {isTarget ? '❤️ ' + label : label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Custom SHAP Tooltip ── */
function SHAPTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const isPositive = d.value > 0;
  return (
    <div className="card" style={{ padding: '0.6rem 0.9rem', fontSize: '0.78rem', boxShadow: 'var(--shadow-md)', background: '#FFFFFF', border: '1px solid #E8E8E4' }}>
      <p style={{ fontWeight: 700, color: '#111827', marginBottom: '0.15rem' }}>{d.payload.name}</p>
      <p style={{ color: isPositive ? 'var(--danger)' : '#16A34A', fontWeight: 700 }}>
        SHAP value: {isPositive ? '+' : ''}{d.value.toFixed(5)}
      </p>
    </div>
  );
}

type TabKey = 'shap' | 'dag' | 'path';

const TABS = [
  { key: 'shap' as TabKey, label: 'SHAP Values',    icon: GitFork },
  { key: 'dag'  as TabKey, label: 'Bayesian DAG',   icon: Brain   },
  { key: 'path' as TabKey, label: 'Decision Path',  icon: Activity },
];

export default function ExplainabilityPage() {
  const navigate = useNavigate();
  const [data, setData]     = useState<AssessmentResponse | null>(null);
  const [tab, setTab]       = useState<TabKey>('shap');

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
          <div className="icon-wrap icon-wrap-lg icon-wrap-primary shadow-sm" style={{ margin: '0 auto 1.5rem', width: 64, height: 64, borderRadius: '1.25rem' }}>
            <Brain size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>No Assessment Found</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 380, margin: '0.5rem auto 2rem' }}>
            Please complete a cardiovascular health assessment first to view explainability insights.
          </p>
          <button className="btn-primary" onClick={() => navigate('/assessment')}>
            Start Assessment <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  const { shapContributions, shapBaseValue, bnEdges, bnNodes, discretized, results } = data;

  const shapData = Object.entries(shapContributions)
    .map(([k, v]) => ({ name: FEAT_LABELS[k] || k, key: k, value: v }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const directEdges = bnEdges.filter(e => e.target === 'target');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }} className="space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E8E8E4', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-wrap icon-wrap-md icon-wrap-purple shadow-sm" style={{ width: 42, height: 42, borderRadius: '0.875rem' }}>
            <Brain size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="page-title">Explainability Center</h1>
            <p className="page-subtitle" style={{ marginTop: '0.15rem' }}>Explore transparent, causal, and mathematical metrics validating predictions.</p>
          </div>
        </div>
      </motion.div>

      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
        style={{
          background: 'var(--primary-soft)',
          border: '1px solid rgba(255,107,53,0.25)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <Info size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            Consensus: {results.riskGroup} &nbsp;·&nbsp;
            Bayesian Risk Level: {Math.round(results.bayesianRiskProb * 100)}%
            &nbsp;·&nbsp;
            Expectation Reference: {(shapBaseValue * 100).toFixed(1)}%
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.45 }}>
            SHAP (SHapley Additive exPlanations) isolates each parameter contribution relative to baseline risk expectation values.
          </p>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div className="tab-group" style={{ display: 'inline-flex' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`tab-btn ${tab === key ? 'active' : ''}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="card"
          style={{ padding: '2rem' }}
        >
          {/* ── SHAP tab ── */}
          {tab === 'shap' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="section-title flex items-center gap-2">
                  <GitFork size={18} style={{ color: 'var(--primary)' }} /> SHAP Feature Impact Chart
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  🔴 Orange increases disease risk &nbsp;·&nbsp; 🟢 Green reduces disease risk. Values represent additive shift percentage.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                  <XAxis type="number" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v * 100).toFixed(1)}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#374151', fontSize: 11, fontWeight: 700 }}
                    axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<SHAPTooltip />} cursor={{ fill: 'rgba(0,0,0,0.01)' }} />
                  <ReferenceLine x={0} stroke="#E5E7EB" strokeWidth={1.5} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                    {shapData.map((d, i) => (
                      <Cell key={i} fill={d.value > 0 ? 'var(--primary)' : 'var(--secondary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E8E8E4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <div style={{ width: 16, height: 12, borderRadius: 3, background: 'var(--primary)' }} />
                  Positive Contribution (raises risk)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <div style={{ width: 16, height: 12, borderRadius: 3, background: 'var(--secondary)' }} />
                  Negative Contribution (lowers risk)
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Base Expectation: {(shapBaseValue * 100).toFixed(2)}%
                </div>
              </div>
            </>
          )}

          {/* ── DAG tab ── */}
          {tab === 'dag' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="section-title flex items-center gap-2">
                  <Brain size={18} style={{ color: 'var(--secondary)' }} /> Learn Causal Structure DAG
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Directed Acyclic Graph (DAG) visualizing dependencies. Dashed blue edges represent probability distributions. Red arrows indicate direct causal paths to targets.
                </p>
              </div>
              <DAGGraph edges={bnEdges} nodes={bnNodes} />

              {/* Direct risk predictors */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E8E8E4' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  Direct Path Disease Predictors ({directEdges.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {directEdges.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <span className="chip chip-primary" style={{ padding: '0.2rem 0.6rem' }}>{FEAT_LABELS[e.source] || e.source}</span>
                      <ArrowRight size={12} color="var(--danger)" />
                      <span className="chip chip-danger" style={{ padding: '0.2rem 0.6rem' }}>❤️ Heart Disease</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Decision Path tab ── */}
          {tab === 'path' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="section-title flex items-center gap-2">
                  <Activity size={18} style={{ color: 'var(--accent)' }} /> Bayesian Network Discretization Nodes
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Continuous inputs are mapped to discrete categories (0: Low, 1: Medium, 2: High) during Bayesian graph inference.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {Object.entries(discretized).map(([key, val], i) => {
                  const label = FEAT_LABELS[key] || key;
                  const binVal = val as number;

                  // Soft warm colored bins for clean look
                  let boxBg = '#DCFCE7';
                  let textCol = '#15803D';
                  let borderCol = '#BBF7D0';
                  let binLabel = 'Low';

                  if (binVal === 1) {
                    boxBg = '#FEF3C7';
                    textCol = '#B45309';
                    borderCol = '#FDE68A';
                    binLabel = 'Medium';
                  } else if (binVal >= 2) {
                    boxBg = '#FEE2E2';
                    textCol = '#B91C1C';
                    borderCol = '#FCA5A5';
                    binLabel = 'High';
                  }

                  return (
                    <motion.div key={key}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        background: boxBg,
                        border: `1.5px solid ${borderCol}`,
                        borderRadius: 'var(--radius)',
                        padding: '1.25rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</span>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: textCol, lineHeight: 1 }}>{binVal}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: textCol, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        {binLabel}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                background: 'var(--primary-soft)',
                border: '1px solid rgba(255,107,53,0.2)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <p style={{ fontSize: '0.78rem', color: '#B45309', lineHeight: 1.5, fontWeight: 500 }}>
                  Quantile discretization partitions training samples into bins of equal sample counts. This matches nodes to network parameters. Binary nodes remain un-discretized.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
