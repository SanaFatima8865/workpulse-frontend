import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HardHat, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Illustration */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="w-32 h-32 bg-brand-50 dark:bg-brand-950/30 rounded-3xl flex items-center justify-center">
            <HardHat size={56} className="text-brand-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">?</span>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-7xl font-display font-black text-brand-600 mb-2">404</h1>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">Page not found</h2>
        <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed">
          Looks like this page is still under construction. The URL you're looking for doesn't exist or has moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const error    = useRouteError() as Error | null;
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-24 h-24 bg-red-50 dark:bg-red-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⚠️</span>
        </div>
        <h1 className="text-6xl font-display font-black text-red-500 mb-2">500</h1>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">Something went wrong</h2>
        <p className="text-[var(--color-text-muted)] mb-4">
          An unexpected error occurred. The team has been notified.
        </p>
        {import.meta.env.DEV && error?.message && (
          <pre className="text-left bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl p-4 text-xs font-mono text-red-600 overflow-auto mb-6 max-h-32">
            {error.message}
          </pre>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => window.location.reload()}>Reload Page</Button>
          <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
