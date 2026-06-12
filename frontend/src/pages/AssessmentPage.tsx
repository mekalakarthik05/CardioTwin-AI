import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { predict } from '@/services/api';
import {
  ScanHeart, ChevronRight, ChevronLeft, User, Stethoscope,
  FlaskConical, HeartPulse, Check, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { AssessmentInput } from '@/types';

/* ── Step definitions ── */
const STEPS = [
  { label: 'Demographics', icon: User, desc: 'Basic patient information' },
  { label: 'Symptoms',     icon: Stethoscope, desc: 'Clinical symptom profile' },
  { label: 'Lab Results',  icon: FlaskConical, desc: 'Blood work & ECG findings' },
  { label: 'Exercise & Tests', icon: HeartPulse, desc: 'Stress test & imaging results' },
];

/* ── Option label maps ── */
const CP_LABELS    = ['Typical Angina', 'Atypical Angina', 'Non-Anginal Pain', 'Asymptomatic'];
const ECG_LABELS   = ['Normal', 'ST-T Wave Abnormality', 'LV Hypertrophy'];
const SLOPE_LABELS = ['Upsloping', 'Flat', 'Downsloping'];
const THAL_LABELS  = ['Normal', 'Fixed Defect', 'Reversible Defect', 'Unknown'];

const DEFAULT: AssessmentInput = {
  age: 50, sex: 1, cp: 0, trestbps: 130, chol: 230, fbs: 0,
  restecg: 0, thalach: 150, exang: 0, oldpeak: 1.0, slope: 1, ca: 0, thal: 2,
};

/* ── Sub-components ── */
function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div>
        <label className="input-label" style={{ marginBottom: '0.15rem' }}>{label}</label>
        {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function SelectBtn({
  selected, onClick, label,
}: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="option-card"
      style={{
        borderColor: selected ? 'var(--primary)' : 'var(--border)',
        background: selected ? 'var(--primary-soft)' : 'var(--surface)',
        padding: '0.85rem 1.25rem',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius)'
      }}
    >
      <span style={{
        fontSize: '0.875rem',
        fontWeight: selected ? 700 : 500,
        color: selected ? 'var(--primary-dark)' : 'var(--text-secondary)'
      }}>
        {label}
      </span>
      <div className="option-card-check" style={{
        background: selected ? 'var(--primary)' : 'transparent',
        borderColor: selected ? 'var(--primary)' : 'var(--border)'
      }}>
        {selected && <Check size={11} color="white" strokeWidth={3} />}
      </div>
    </motion.button>
  );
}

function SliderField({
  label, value, onChange, min, max, step = 1, unit, accentColor, hint, dangerAbove, warnAbove,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit: string;
  accentColor: string; hint?: string;
  dangerAbove?: number; warnAbove?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  let valueColor = accentColor;
  if (dangerAbove && value >= dangerAbove) valueColor = 'var(--danger)';
  else if (warnAbove && value >= warnAbove) valueColor = 'var(--warning)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>{label}</label>
        {hint && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hint}</p>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface)',
            border: `1.5px solid ${valueColor}`,
            borderRadius: 'var(--radius-full)',
            padding: '0.45rem 1.25rem',
            color: valueColor,
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '0.3rem'
          }}
        >
          {Number.isInteger(step) ? value : value.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.85 }}>{unit}</span>
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          style={{
            width: '100%',
            margin: 0,
            '--val': `${pct}%`,
            '--slider-color': valueColor,
            background: `linear-gradient(to right, ${valueColor} ${pct}%, #E5E7EB ${pct}%)`
          } as React.CSSProperties}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>{min} {unit}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AssessmentPage() {
  const [step, setStep]         = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]         = useState<AssessmentInput>(DEFAULT);
  const navigate                = useNavigate();

  const set = useCallback(<K extends keyof AssessmentInput>(field: K, val: number) => {
    setForm(prev => ({ ...prev, [field]: val }));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Running AI analysis…');
    try {
      const res = await predict(form);
      sessionStorage.setItem('cardiotwin_result', JSON.stringify(res));
      toast.success('Analysis complete!', { id: toastId });
      navigate('/results');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Analysis failed — is the backend running?';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Step content ── */
  const stepContent = [
    /* Step 0: Demographics */
    <div className="space-y-6" key="s0">
      <SliderField
        label="Age"
        value={form.age} onChange={v => set('age', v)}
        min={20} max={85} unit="years" accentColor="var(--primary)"
        hint="Patient age in years"
        warnAbove={45} dangerAbove={60}
      />
      <FieldGroup label="Biological Sex">
        <div className="grid grid-cols-2 gap-3">
          <SelectBtn selected={form.sex === 1} onClick={() => set('sex', 1)} label="Male" />
          <SelectBtn selected={form.sex === 0} onClick={() => set('sex', 0)} label="Female" />
        </div>
      </FieldGroup>

      <div style={{
        background: '#FFF7F5',
        border: '1px solid rgba(255,107,53,0.2)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start'
      }}>
        <AlertCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <p style={{ fontSize: '0.78rem', color: '#B45309', lineHeight: 1.5, fontWeight: 500 }}>
          This assessment uses 13 clinical variables from the UCI Heart Disease dataset.
          The AI engine calculates probability risk weights using a Bayesian Network.
        </p>
      </div>
    </div>,

    /* Step 1: Symptoms */
    <div className="space-y-6" key="s1">
      <FieldGroup label="Chest Pain Type" hint="Select the characterization that best fits the symptoms">
        <div className="grid grid-cols-2 gap-3">
          {CP_LABELS.map((l, i) => (
            <SelectBtn key={i} selected={form.cp === i} onClick={() => set('cp', i)} label={l} />
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Exercise-Induced Angina" hint="Does physical exertion trigger chest pain?">
        <div className="grid grid-cols-2 gap-3">
          <SelectBtn selected={form.exang === 0} onClick={() => set('exang', 0)} label="No Angina" />
          <SelectBtn selected={form.exang === 1} onClick={() => set('exang', 1)} label="Yes, Angina Induced" />
        </div>
      </FieldGroup>
    </div>,

    /* Step 2: Lab Results */
    <div className="space-y-6" key="s2">
      <SliderField
        label="Resting Blood Pressure"
        value={form.trestbps} onChange={v => set('trestbps', v)}
        min={80} max={220} unit="mmHg" accentColor="var(--primary)"
        hint="Systolic BP measured at rest"
        warnAbove={130} dangerAbove={140}
      />
      <SliderField
        label="Serum Cholesterol"
        value={form.chol} onChange={v => set('chol', v)}
        min={100} max={564} unit="mg/dl" accentColor="var(--primary)"
        hint="Total serum cholesterol level"
        warnAbove={200} dangerAbove={240}
      />
      <FieldGroup label="Fasting Blood Sugar > 120 mg/dl" hint="Is blood glucose above threshold?">
        <div className="grid grid-cols-2 gap-3">
          <SelectBtn selected={form.fbs === 0} onClick={() => set('fbs', 0)} label="No (≤ 120 mg/dl)" />
          <SelectBtn selected={form.fbs === 1} onClick={() => set('fbs', 1)} label="Yes (> 120 mg/dl)" />
        </div>
      </FieldGroup>
      <FieldGroup label="Resting ECG Results" hint="Electrocardiogram findings at rest">
        <div className="flex flex-col gap-2.5">
          {ECG_LABELS.map((l, i) => (
            <SelectBtn key={i} selected={form.restecg === i} onClick={() => set('restecg', i)} label={l} />
          ))}
        </div>
      </FieldGroup>
    </div>,

    /* Step 3: Exercise & Tests */
    <div className="space-y-6" key="s3">
      <SliderField
        label="Max Heart Rate Achieved"
        value={form.thalach} onChange={v => set('thalach', v)}
        min={60} max={220} unit="bpm" accentColor="var(--secondary)"
        hint="Peak heart rate during cardiovascular stress test"
      />
      <SliderField
        label="ST Depression (Oldpeak)"
        value={form.oldpeak} onChange={v => set('oldpeak', v)}
        min={0} max={6.2} step={0.1} unit="" accentColor="var(--accent)"
        hint="Exercise-induced ST segment depression relative to rest"
        warnAbove={1} dangerAbove={2}
      />
      <FieldGroup label="Peak Exercise ST Slope" hint="Shape of the ST segment at peak exertion">
        <div className="grid grid-cols-3 gap-2">
          {SLOPE_LABELS.map((l, i) => (
            <SelectBtn key={i} selected={form.slope === i} onClick={() => set('slope', i)} label={l} />
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Major Vessels (Fluoroscopy)" hint="Number of major blood vessels colored by fluoroscopy (0–4)">
        <div className="grid grid-cols-5 gap-2">
          {[0,1,2,3,4].map(i => (
            <SelectBtn key={i} selected={form.ca === i} onClick={() => set('ca', i)} label={`${i}`} />
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Thalassemia" hint="Thalassemia blood disorder classification">
        <div className="grid grid-cols-2 gap-3">
          {THAL_LABELS.map((l, i) => (
            <SelectBtn key={i} selected={form.thal === i} onClick={() => set('thal', i)} label={l} />
          ))}
        </div>
      </FieldGroup>
    </div>,
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div className="icon-wrap icon-wrap-lg icon-wrap-primary shadow-sm" style={{ width: 48, height: 48, borderRadius: '1rem' }}>
            <ScanHeart size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="page-title">Health Assessment</h1>
            <p className="page-subtitle">Answer 13 questions to generate your personalized CardioTwin cardiovascular report.</p>
          </div>
        </div>
      </motion.div>

      {/* Step progress bar */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="card"
        style={{ padding: '1.25rem', marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
          {STEPS.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <button
                  onClick={() => done && setStep(i)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    cursor: done ? 'pointer' : 'default',
                    outline: 'none',
                    flexShrink: 0
                  }}
                  title={s.label}
                >
                  <div
                    className="step-dot"
                    style={{
                      background: done
                        ? 'var(--secondary)'
                        : current
                        ? 'var(--primary)'
                        : '#F3F4F6',
                      color: done || current ? 'white' : 'var(--text-dim)',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      boxShadow: current ? 'var(--shadow-primary)' : 'none'
                    }}
                  >
                    {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: current || done ? 700 : 500,
                    color: current ? 'var(--text)' : done ? 'var(--secondary)' : 'var(--text-dim)',
                    whiteSpace: 'nowrap'
                  }}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, margin: '0 0.75rem', height: 2, background: done ? 'var(--secondary)' : '#E5E7EB', borderRadius: 1 }} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Step form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="card"
          style={{ padding: '2.5rem', marginBottom: '2rem' }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Section {step + 1} of {STEPS.length}
            </p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{STEPS[step].label}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{STEPS[step].desc}</p>
          </div>
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-secondary"
          style={{ opacity: step === 0 ? 0.4 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i < step ? 'var(--secondary)' : i === step ? 'var(--primary)' : '#E5E7EB',
              }}
            />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="btn-primary"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary pulse-primary"
            style={{ minWidth: 180 }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Running AI…
              </>
            ) : (
              <> <HeartPulse size={16} /> Run AI Analysis </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
