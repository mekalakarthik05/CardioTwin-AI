import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanHeart, LayoutDashboard, FlaskConical, BrainCircuit,
  ChevronLeft, Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/assessment', icon: ScanHeart,      label: 'Assessment',    color: '#FF6B35' },
  { to: '/results',    icon: LayoutDashboard, label: 'Results',       color: '#22C55E' },
  { to: '/simulator',  icon: FlaskConical,    label: 'What-If',       color: '#7C3AED' },
  { to: '/explain',    icon: BrainCircuit,    label: 'Explainability',color: '#3B82F6' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF8' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid #E8E8E4' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              width: '100%'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
              flexShrink: 0
            }}>
              <ScanHeart size={18} color="white" strokeWidth={2.5} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                CardioTwin
              </div>
              <div style={{ fontSize: '0.65rem', color: '#FF6B35', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                AI Health
              </div>
            </div>
          </button>
        </div>

        {/* Nav Label */}
        <div style={{ padding: '1.25rem 1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Navigation
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map(({ to, icon: Icon, label, color }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`sidebar-item ${active ? 'active' : ''}`}
                style={active ? { background: 'rgba(255,107,53,0.08)', color: '#E85520', borderColor: 'rgba(255,107,53,0.15)' } : {}}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '0.5rem',
                  background: active ? 'rgba(255,107,53,0.12)' : '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s'
                }}>
                  <Icon size={15} color={active ? color : '#9CA3AF'} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }}>
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    style={{
                      marginLeft: 'auto',
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#FF6B35'
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Back to home */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #E8E8E4' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', color: '#6B7280', fontSize: '0.8rem' }}
          >
            <ChevronLeft size={14} />
            Back to Home
          </button>

          {/* AI Badge */}
          <div style={{
            marginTop: '0.75rem',
            background: 'linear-gradient(135deg, #FFF7F5, #FFF0EB)',
            border: '1px solid rgba(255,107,53,0.2)',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={14} color="#FF6B35" />
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E85520' }}>AI-Powered</div>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.1rem' }}>Bayesian Network Model</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ minHeight: '100%' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
