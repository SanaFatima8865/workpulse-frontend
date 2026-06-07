import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/cn';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const FEATURE_HIGHLIGHTS = [
  'AI-powered project insights and risk alerts',
  'Real-time collaboration with your team',
  'Construction workflow management',
  'Smart task generation and automation',
  'Advanced analytics and health scoring',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* ── Left Brand Panel (desktop only) ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col justify-between p-10 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Zap size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              WorkPulse
            </span>
          </motion.div>

          {/* Hero text */}
          <div>
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-display font-bold text-white leading-tight mb-4"
            >
              Work smarter,{' '}
              <span className="text-teal-300">ship faster.</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-brand-100 text-base leading-relaxed mb-8"
            >
              The enterprise work management platform that combines the power of AI with
              real-time collaboration to keep your team aligned and projects on track.
            </motion.p>

            {/* Features list */}
            <motion.ul className="space-y-3" variants={containerVariants}>
              {FEATURE_HIGHLIGHTS.map((feature) => (
                <motion.li
                  key={feature}
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 size={16} className="text-teal-300 shrink-0" />
                  <span className="text-brand-100 text-sm">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Footer */}
          <motion.p variants={itemVariants} className="text-brand-300 text-xs">
            © {new Date().getFullYear()} WorkPulse Inc. · Enterprise-grade security
          </motion.p>
        </motion.div>
      </div>

      {/* ── Right Auth Form ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-brand">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-text)]">
              WorkPulse
            </span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
              {title}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5">{subtitle}</p>
          </div>

          {/* Form content */}
          {children}
        </motion.div>
      </div>
    </div>
  );
};
