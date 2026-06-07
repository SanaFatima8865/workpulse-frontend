import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

import { useAppSelector } from '@/store';
import { selectIsConnected } from '@/store/presenceSlice';
import { cn } from '@/lib/cn';

export const ConnectionStatus: React.FC = () => {
  const connected   = useAppSelector(selectIsConnected);
  const [showBanner, setShowBanner] = React.useState(false);
  const [wasConnected, setWasConnected] = React.useState(true);

  React.useEffect(() => {
    if (!connected && wasConnected) {
      // Went offline
      setShowBanner(true);
      setWasConnected(false);
    } else if (connected && !wasConnected) {
      // Came back online — show "reconnected" briefly
      setShowBanner(true);
      setWasConnected(true);
      const t = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(t);
    }
  }, [connected]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          className={cn(
            'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-modal',
            'text-sm font-medium',
            connected
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          )}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {connected ? (
            <>
              <Wifi size={15} />
              <span>Reconnected — you're back online</span>
            </>
          ) : (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Reconnecting...</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Compact dot for header ───────────────────────────────────────────────────

export const ConnectionDot: React.FC = () => {
  const connected = useAppSelector(selectIsConnected);
  return (
    <span
      title={connected ? 'Real-time: connected' : 'Real-time: reconnecting...'}
      className={cn(
        'inline-block w-2 h-2 rounded-full transition-colors',
        connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
      )}
    />
  );
};
