import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppSelector } from '@/store';
import { selectTypingInTask } from '@/store/presenceSlice';
import { selectCurrentUser }  from '@/store/authSlice';

interface TypingIndicatorProps {
  taskId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ taskId }) => {
  const typingUsers = useAppSelector(selectTypingInTask(taskId));
  const currentUser = useAppSelector(selectCurrentUser);

  // Exclude self
  const others = typingUsers.filter(t => t.userId !== currentUser?._id);

  if (others.length === 0) return null;

  const label =
    others.length === 1
      ? `${others[0].firstName} is typing`
      : `${others.map(t => t.firstName).join(', ')} are typing`;

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
      >
        {/* Animated dots */}
        <span className="flex items-center gap-0.5">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-400"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration:   0.6,
                repeat:     Infinity,
                delay:      i * 0.15,
                ease:       'easeInOut',
              }}
            />
          ))}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] italic">{label}...</span>
      </motion.div>
    </AnimatePresence>
  );
};
