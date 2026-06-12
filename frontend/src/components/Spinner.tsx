import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: number;
  color?: string;
  message?: string;
}

export function Spinner({ size = 40, color = 'var(--primary)', message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle
          cx="20" cy="20" r="16"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="40 60"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />
      </svg>
      {message && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      )}
    </div>
  );
}

export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-6"
    >
      {/* Animated heart */}
      <div className="relative">
        <motion.svg
          width="64" height="64" viewBox="0 0 100 100"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="spinnerHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <path
            d="M50 85 C50 85 15 60 15 35 C15 22 25 15 35 15 C42 15 48 20 50 25 C52 20 58 15 65 15 C75 15 85 22 85 35 C85 60 50 85 50 85Z"
            fill="url(#spinnerHeartGrad)"
            opacity="0.8"
          />
        </motion.svg>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </motion.div>
  );
}
