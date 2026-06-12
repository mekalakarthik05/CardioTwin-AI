import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { runSimulation } from '@/services/api';
import {
  Zap, TrendingDown, TrendingUp, RefreshCcw,
  Activity, ArrowRight, Info, Heart
} from 'lucide-react';
import type { AssessmentInput, AssessmentResponse, SimulatorResponse } from '@/types';
import toast from 'react-hot-toast';

/* ── Default baseline ── */
const DEFAULT_BASE: AssessmentInput = {
  age:50, sex:1, cp:0, trestbps:130, chol:230, fbs:0,
  restecg:0, thalach:150, exang:0, oldpeak:1.0, slope:1, ca:0, thal:2,
};

/* ── Mini animated gauge ── */
function MiniGauge({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div className="relative">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" strokeWidth="8" stroke="#F3F4F6" />
          <circle cx="45" cy="45" r={r} fill="none" strokeWidth="8" stroke={color} strokeOpacity="0.10" />
          <motion.circle
            cx="45" cy="45" r={r}
            fill="none" strokeWidth="8" stroke={color}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            transform="rotate(-90 45 45)"
          />
          <text x="45" y="49" textAnchor="middle" dominantBaseline="middle"
            fill="#111827" fontSize="16" fontWeight="800" fontFamily="Plus Jakarta Sans">
            {value}%
          </text>
        </svg>
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}0C 0%, transparent 70%)` }} />
      </div>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

/* ── Parameter slider ── */
interface SliderConfig {
  field: 'trestbps' | 'chol' | 'thalach';
  label: string;
  unit: string;
  min: number;
  max: number;
  color: string;
  idealText: string;
  idealOk: (v: number) => boolean;
}

const PARAMS: SliderConfig[] = [
  {
    field: 'trestbps', label: 'Resting Blood Pressure', unit: 'mmHg',
    min: 80, max: 200, color: 'var(--primary)',
    idealText: 'Ideal: < 120 mmHg',
    idealOk: v => v < 120,
  },
  {
    field: 'chol', label: 'Serum Cholesterol', unit: 'mg/dl',
    min: 100, max: 500, color: 'var(--accent)',
    idealText: 'Ideal: < 200 mg/dl',
    idealOk: v => v < 200,
  },
  {
    field: 'thalach', label: 'Max Heart Rate', unit: 'bpm',
    min: 60, max: 220, color: 'var(--secondary)',
    idealText: 'Ideal: > 150 bpm',
    idealOk: v => v > 150,
  },
];

export default function SimulatorPage() {
  const navigate  = useNavigate();
  const [base, setBase]               = useState<AssessmentInput>(DEFAULT_BASE);
  const [sliders, setSliders]         = useState({ trestbps: 130, chol: 230, thalach: 150 });
  const [result, setResult]           = useState<SimulatorResponse | null>(null);
  const [loading, setLoading]         = useState(false);
  const [hasBase, setHasBase]         = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('cardiotwin_result');
    if (stored) {
      const d: AssessmentResponse = JSON.parse(stored);
      setBase(d.inputs);
      setSliders({ trestbps: d.inputs.trestbps, chol: d.inputs.chol, thalach: d.inputs.thalach });
      setHasBase(true);
    }
  }, []);

  const simulate = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setResult(null);
    const toastId = toast.loading('Running Bayesian inference…');
    try {
      const res = await runSimulation({ baseInputs: base, ...sliders });
      setResult(res);
      toast.dismiss(toastId);
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') {
        toast.error(err?.response?.data?.detail || 'Simulation failed', { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentPct   = result ? Math.round(result.currentRisk * 100)   : null;
  const projectedPct = result ? Math.round(result.projectedRisk * 100) : null;
  const improved     = result ? result.improvement > 0 : null;
  const improvePct   = result ? Math.abs(result.improvement * 100).toFixed(1) : null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }} className="space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E8E8E4', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-wrap icon-wrap-md icon-wrap-warning shadow-sm" style={{ width: 42, height: 42, borderRadius: '0.875rem' }}>
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="page-title">What-If Simulator</h1>
            <p className="page-subtitle" style={{ marginTop: '0.15rem' }}>Adjust clinical sliders to project real-time changes in Bayesian risk probabilities.</p>
          </div>
        </div>
        {!hasBase && (
          <button className="btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => navigate('/assessment')}>
            <Activity size={14} /> Run Assessment First
          </button>
        )}
      </motion.div>

      {/* Info banner when no base data */}
      {!hasBase && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFFBEB',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <Info size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <p style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 500 }}>
            Currently utilizing a standard reference template. <button onClick={() => navigate('/assessment')}
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>Run a health assessment first</button> to calibrate predictions to your specific baseline profile.
          </p>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* ── Sliders panel (Left width) ── */}
        <motion.div
          initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
          className="card"
          style={{ padding: '2rem', gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="section-title">Calibration Panel</h2>
            <span className="chip chip-primary">
              <Zap size={10} strokeWidth={3} /> Live Prediction
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {PARAMS.map(({ field, label, unit, min, max, color, idealText, idealOk }) => {
              const value = sliders[field];
              const pct   = ((value - min) / (max - min)) * 100;
              const ok    = idealOk(value);
              const baseline = (base[field] as number);
              const delta = value - baseline;

              return (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>{label}</p>
                    <p style={{ fontSize: '0.8rem', color: ok ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                      {ok ? '✓' : '✗'} {idealText}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <motion.div
                      key={value}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'var(--surface)',
                        border: `1.5px solid ${color}`,
                        borderRadius: 'var(--radius-full)',
                        padding: '0.45rem 1.25rem',
                        color: color,
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: '0.3rem'
                      }}
                    >
                      {value} <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.85 }}>{unit}</span>
                    </motion.div>
                    
                    {delta !== 0 && (
                      <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: delta > 0 ? 'var(--danger)' : '#16A34A' }}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      type="range" min={min} max={max} value={value}
                      onChange={e => {
                        setSliders(prev => ({ ...prev, [field]: +e.target.value }));
                        setResult(null);
                      }}
                      style={{
                        width: '100%',
                        margin: 0,
                        '--val': `${pct}%`,
                        '--slider-color': color,
                        background: `linear-gradient(to right, ${color} ${pct}%, #E5E7EB ${pct}%)`
                      } as React.CSSProperties}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>{min} {unit}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>{max} {unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={simulate}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Computing Simulator Model…
              </>
            ) : (
              <><RefreshCcw size={16} /> Recalculate Risk</>
            )}
          </button>
        </motion.div>

        {/* ── Results panel (Right width) ── */}
        <motion.div
          initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}
        >
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Projected Risk Delta</h2>

          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}
              >
                <div className="icon-wrap icon-wrap-lg icon-wrap-warning shadow-sm" style={{ width: 56, height: 56, borderRadius: '1.25rem' }}>
                  <Zap size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>Simulation Pending</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: 200, margin: '0.25rem auto 0', lineHeight: 1.4 }}>
                    Calibrate parameters on the left and recalculate risk index.
                  </p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="icon-wrap icon-wrap-lg icon-wrap-primary"
                  style={{ width: 56, height: 56 }}
                >
                  <Heart size={26} fill="var(--primary)" color="var(--primary)" />
                </motion.div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Running Bayesian graph inference…</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Gauges */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '0.5rem' }}>
                  <MiniGauge value={currentPct!}
                    color={currentPct! >= 60 ? 'var(--danger)' : currentPct! >= 35 ? 'var(--warning)' : 'var(--secondary)'}
                    label="Current Risk" />
                  <MiniGauge value={projectedPct!}
                    color={improved ? 'var(--secondary)' : projectedPct! === currentPct! ? 'var(--text-dim)' : 'var(--warning)'}
                    label="Projected Risk" />
                </div>

                {/* Arrow indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{currentPct}%</span>
                  <ArrowRight size={16} color="var(--text-dim)" strokeWidth={2.5} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: improved ? '#16A34A' : projectedPct! === currentPct! ? 'var(--text-dim)' : 'var(--danger)' }}>
                    {projectedPct}%
                  </span>
                </div>

                {/* Result banner */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  background: improved ? 'var(--secondary-soft)' : result.improvement < 0 ? 'var(--danger-soft)' : 'var(--bg-alt)',
                  border: `1.5px solid ${improved ? 'rgba(34,197,94,0.2)' : result.improvement < 0 ? 'rgba(239,68,68,0.2)' : '#E8E8E4'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  {improved ? <TrendingDown size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            : result.improvement < 0 ? <TrendingUp size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            : <Activity size={18} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />}
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: improved ? '#16A34A' : result.improvement < 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {improved ? `Risk reduced by ${improvePct}%`
                                : result.improvement < 0 ? `Risk increased by ${improvePct}%`
                                : 'No change projected'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Calculated from custom sliders.
                    </p>
                  </div>
                </div>

                {/* Delta summary */}
                <div style={{ borderTop: '1px solid #E8E8E4', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Changes against baseline
                  </p>
                  {PARAMS.map(({ field, label, unit }) => {
                    const orig = base[field] as number;
                    const curr = sliders[field];
                    const delta = curr - orig;
                    if (Math.abs(delta) < 0.5) return null;
                    return (
                      <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: delta > 0 ? 'var(--danger)' : '#16A34A' }}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(0)} {unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Clinical Tips ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card"
        style={{ padding: '2rem' }}
      >
        <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>💡 Educational Clinical Guidance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              icon: '🩺',
              title: 'Blood Pressure Impact',
              tip: 'Lowering resting BP below 120 mmHg reduces the risk of stroke, heart attack, and cardiovascular disease by up to 25%.',
              range: '< 120 mmHg target',
            },
            {
              icon: '🧪',
              title: 'Serum Cholesterol Profile',
              tip: 'Maintaining serum cholesterol under 200 mg/dl keeps the arterial passages clean and prevents atherosclerotic buildup.',
              range: '< 200 mg/dl target',
            },
            {
              icon: '❤️',
              title: 'Max Heart Rate & Vitals',
              tip: 'Higher max HR during activity indicates active myocardium conditioning and robust stroke volume performance.',
              range: '> 150 bpm optimal range',
            },
          ].map(({ icon, title, tip, range }) => (
            <div key={title} style={{ padding: '1.25rem', borderRadius: 'var(--radius)', background: 'var(--bg-alt)', border: '1px solid #E8E8E4', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{title}</p>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{tip}</p>
              <div style={{ alignSelf: 'flex-start' }} className="chip chip-primary">{range}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
