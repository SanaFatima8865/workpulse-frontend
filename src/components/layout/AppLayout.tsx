import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { cn }           from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSidebarMobileOpen, selectSidebarMobileOpen } from '@/store/uiSlice';
import { selectIsAuthenticated } from '@/store/authSlice';
import { Sidebar }      from './Sidebar';
import { Header }       from './Header';
import { ConnectionStatus } from '@/features/realtime/components/ConnectionStatus';
import { AIAssistantPanel }  from '@/features/ai/components/AIAssistantPanel';
import { AISearchBar }       from '@/features/ai/components/AISearchBar';
import { CreateTaskModal }   from '@/components/modals/CreateTaskModal';
import { Sparkles }          from 'lucide-react';
import { useWorkspacePresence, useLiveNotifications } from '@/features/realtime';

// ─── Workspace Presence Watcher ───────────────────────────────────────────────
// Isolated so only one instance runs

const WorkspaceWatcher: React.FC = () => {
  useWorkspacePresence();
  useLiveNotifications();
  return null;
};

// ─── AppLayout ────────────────────────────────────────────────────────────────

export const AppLayout: React.FC = () => {
  const dispatch        = useAppDispatch();
  const mobileOpen      = useAppSelector(selectSidebarMobileOpen);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [aiOpen,     setAIOpen]     = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // ⌘K keyboard shortcut for search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(o => !o); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-secondary)]">
      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => dispatch(setSidebarMobileOpen(false))}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 w-[260px] lg:hidden"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global real-time watcher */}
      {isAuthenticated && <WorkspaceWatcher />}

      {/* Connection banner */}
      <ConnectionStatus />

      {/* Floating AI button */}
      {isAuthenticated && (
        <button
          onClick={() => setAIOpen(true)}
          className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center shadow-brand hover:shadow-brand-lg hover:scale-105 transition-all duration-200"
          title="AI Assistant (or click AI Features in sidebar)"
        >
          <Sparkles size={20} className="text-white" />
        </button>
      )}

      {/* AI panels */}
      <AIAssistantPanel open={aiOpen} onClose={() => setAIOpen(false)} />
      <AISearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global modals */}
      <CreateTaskModal />
    </div>
  );
};
