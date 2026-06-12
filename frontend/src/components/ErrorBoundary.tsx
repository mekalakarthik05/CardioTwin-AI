import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="text-center p-8 glass-strong rounded-2xl max-w-lg">
            <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: 'var(--warning)' }} />
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="btn-primary"
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            >
              <RefreshCcw size={16} /> Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
