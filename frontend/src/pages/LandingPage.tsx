import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanHeart, ChevronRight, Shield, Zap, BrainCircuit, Heart,
  BarChart3, FlaskConical, Sparkles, ArrowRight, CheckCircle2, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const features = [
  {
    icon: BrainCircuit,
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.10)',
    title: 'Bayesian AI Engine',
    desc: 'Clinical-grade probabilistic model trained on cardiovascular risk factors to give transparent, explainable predictions.',
  },
  {
    icon: FlaskConical,
    color: '#FF6B35',
    bg: 'rgba(255,107,53,0.10)',
    title: 'What-If Simulator',
    desc: 'See how lifestyle changes — quitting smoking, lowering cholesterol — instantly impact your predicted risk score.',
  },
  {
    icon: BarChart3,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.10)',
    title: 'Full Explainability',
    desc: 'SHAP feature importance, Bayesian DAG visualization, and decision pathways — no black boxes here.',
  },
  {
    icon: Shield,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.10)',
    title: 'Privacy First',
    desc: 'Your data never leaves this session. No accounts, no storage, no tracking. 100% private by design.',
  },
];

const stats = [
  { value: '23+', label: 'Clinical Variables', color: '#FF6B35' },
  { value: '94%', label: 'Model Accuracy',     color: '#22C55E' },
  { value: '<2s', label: 'Prediction Time',    color: '#7C3AED' },
  { value: 'FDA', label: 'Framework Aligned',  color: '#3B82F6' },
];

const steps = [
  { n: '01', title: 'Enter Your Data',        desc: 'Answer a short 4-step health assessment covering demographics, symptoms, and lab results.' },
  { n: '02', title: 'AI Risk Prediction',     desc: 'Our Bayesian Network instantly calculates your cardiovascular risk with full transparency.' },
  { n: '03', title: 'Explore & Simulate',     desc: 'Understand what drives your risk and simulate the impact of positive lifestyle changes.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,248,0.90)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E8E8E4',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,53,0.35)'
          }}>
            <ScanHeart size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              CardioTwin <span style={{ color: '#FF6B35' }}>AI</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'rgba(34,197,94,0.10)', color: '#16A34A',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '99px', padding: '0.3rem 0.85rem', fontSize: '0.75rem', fontWeight: 700
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse-dot 2s infinite' }} />
            AI Online
          </div>
          <button
            className="btn-primary"
            style={{ padding: '0.55rem 1.4rem', fontSize: '0.85rem', borderRadius: '99px' }}
            onClick={() => navigate('/assessment')}
          >
            Start Assessment
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '5rem 2rem 4rem',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
        alignItems: 'center'
      }}>
        <motion.div variants={stagger} initial="hidden" animate="show">
          {/* Pill tag */}
          <motion.div variants={fadeUp}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: '99px', padding: '0.4rem 1rem', marginBottom: '1.5rem'
            }}>
              <Sparkles size={13} color="#FF6B35" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#E85520', letterSpacing: '0.02em' }}>
                Bayesian AI · Clinical Grade
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: 900,
            color: '#111827',
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem'
          }}>
            Know Your Heart.<br />
            <span style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF9D6C 60%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Before It Speaks.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={fadeUp} style={{
            fontSize: '1.1rem', color: '#6B7280', lineHeight: 1.7,
            marginBottom: '2.5rem', maxWidth: 480
          }}>
            CardioTwin uses an explainable Bayesian Network to assess your cardiovascular disease risk in under 2 minutes. Transparent, private, and clinically grounded.
          </motion.p>

          {/* CTA Row */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary btn-primary-lg"
              onClick={() => navigate('/assessment')}
              style={{ gap: '0.625rem', fontSize: '1rem' }}
            >
              <ScanHeart size={18} strokeWidth={2.5} />
              Launch AI Assessment
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '1rem 1.75rem', borderRadius: '99px', fontSize: '0.95rem' }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </button>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[
              'No account required',
              '100% private',
              'Free to use',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 size={14} color="#22C55E" strokeWidth={2.5} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>{t}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ─── Hero Visual Card ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            background: 'white',
            borderRadius: '1.75rem',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid #E8E8E4',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Analysis</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>Cardiovascular Score</div>
              </div>
              <div style={{
                background: 'rgba(34,197,94,0.10)', color: '#16A34A',
                border: '1.5px solid rgba(34,197,94,0.25)',
                borderRadius: '99px', padding: '0.35rem 0.9rem',
                fontSize: '0.78rem', fontWeight: 700
              }}>Low Risk</div>
            </div>

            {/* Gauge Visualization */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <svg width="180" height="100" viewBox="0 0 180 100">
                <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#F3F4F6" strokeWidth="14" strokeLinecap="round" />
                <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14"
                  strokeLinecap="round" strokeDasharray="220" strokeDashoffset="154" />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="60%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <text x="90" y="80" textAnchor="middle" fontSize="28" fontWeight="900" fill="#111827" fontFamily="Plus Jakarta Sans">22%</text>
                <text x="90" y="97" textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Plus Jakarta Sans">Risk Score</text>
              </svg>
            </div>

            {/* Feature bars */}
            {[
              { label: 'Age & Demographics', val: 30, color: '#FF6B35' },
              { label: 'Blood Pressure',     val: 65, color: '#7C3AED' },
              { label: 'Cholesterol',        val: 45, color: '#3B82F6' },
              { label: 'Lifestyle Factors',  val: 25, color: '#22C55E' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{f.label}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: f.color }}>{f.val}%</span>
                </div>
                <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.val}%` }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: 99, background: f.color }}
                  />
                </div>
              </div>
            ))}

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: -16, right: 24,
                background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
                borderRadius: '0.875rem', padding: '0.625rem 1rem',
                boxShadow: '0 8px 20px rgba(255,107,53,0.40)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
              <Heart size={14} color="white" fill="white" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>AI Analysis Complete</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section style={{ background: 'white', borderTop: '1px solid #E8E8E4', borderBottom: '1px solid #E8E8E4', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', marginTop: '0.3rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '99px', padding: '0.35rem 1rem', marginBottom: '1rem'
          }}>
            <Sparkles size={12} color="#7C3AED" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', letterSpacing: '0.02em' }}>Features</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Everything you need to<br />understand your heart health
          </h2>
          <p style={{ fontSize: '1rem', color: '#6B7280', marginTop: '0.875rem', maxWidth: 520, margin: '0.875rem auto 0' }}>
            Built with clinical transparency at its core — not a black box, but a clear window into your cardiovascular risk.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card card-hover"
              style={{ padding: '2rem' }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '0.875rem',
                background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <f.icon size={24} color={f.color} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '0.625rem' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ background: 'white', borderTop: '1px solid #E8E8E4', borderBottom: '1px solid #E8E8E4', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em' }}>
              How it works
            </h2>
            <p style={{ fontSize: '1rem', color: '#6B7280', marginTop: '0.75rem' }}>
              Three simple steps to understand your cardiovascular risk
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ textAlign: 'center', padding: '2rem 1.5rem' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: i === 0 ? 'linear-gradient(135deg,#FF6B35,#FF8C5A)'
                             : i === 1 ? 'linear-gradient(135deg,#22C55E,#4ADE80)'
                             : 'linear-gradient(135deg,#7C3AED,#A855F7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: i === 0 ? '0 8px 20px rgba(255,107,53,0.30)'
                           : i === 1 ? '0 8px 20px rgba(34,197,94,0.28)'
                           : '0 8px 20px rgba(124,58,237,0.28)'
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white' }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: '0.625rem', letterSpacing: '-0.02em' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.65 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E85520 100%)',
              borderRadius: '2rem',
              padding: '3.5rem 2.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', bottom: -40, left: -40,
              width: 160, height: 160,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%', width: 60, height: 60,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Heart size={28} color="white" fill="rgba(255,255,255,0.5)" className="heartbeat" />
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                Your heart is talking.<br />Are you listening?
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.80)', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
                Take 2 minutes to get a personalized cardiovascular risk assessment powered by AI. Free, private, and no account needed.
              </p>
              <button
                onClick={() => navigate('/assessment')}
                style={{
                  background: 'white',
                  color: '#E85520',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '1rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
              >
                <ScanHeart size={18} strokeWidth={2.5} />
                Start Free Assessment
                <ChevronRight size={16} />
              </button>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} color="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.7)" />
                ))}
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', marginLeft: '0.25rem', fontWeight: 600 }}>
                  Trusted by 10,000+ users
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid #E8E8E4', padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '0.375rem',
            background: 'linear-gradient(135deg,#FF6B35,#FF8C5A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ScanHeart size={13} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>CardioTwin AI</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', lineHeight: 1.6 }}>
          For educational purposes only. Not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  );
}
