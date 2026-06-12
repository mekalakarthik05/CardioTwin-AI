import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import AssessmentPage from '@/pages/AssessmentPage';
import ResultsPage from '@/pages/ResultsPage';
import SimulatorPage from '@/pages/SimulatorPage';
import ExplainabilityPage from '@/pages/ExplainabilityPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#111827',
              border: '1px solid #E8E8E4',
              borderRadius: '0.875rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#FFFFFF' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/results"    element={<ResultsPage />} />
            <Route path="/simulator"  element={<SimulatorPage />} />
            <Route path="/explain"    element={<ExplainabilityPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
