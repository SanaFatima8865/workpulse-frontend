import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';

import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { useAppSelector }      from '@/store';
import { selectBoardViewers }  from '@/store/presenceSlice';
import { selectCurrentUser }   from '@/store/authSlice';
import { cn }                  from '@/lib/cn';

interface BoardPresenceBarProps {
  boardId: string;
  className?: string;
}

export const BoardPresenceBar: React.FC<BoardPresenceBarProps> = ({ boardId, className }) => {
  const viewers     = useAppSelector(selectBoardViewers(boardId));
  const currentUser = useAppSelector(selectCurrentUser);

  // Exclude self from the display
  const others = viewers.filter(v => v.userId !== currentUser?._id);

  if (others.length === 0) return null;

  return (
    <motion.div
      className={cn('flex items-center gap-2', className)}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
    >
      <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">
        {others.length === 1 ? `${others[0].firstName} is here` : `${others.length} others`}
      </span>
      <AvatarGroup
        users={others.map(v => ({
          name: `${v.firstName} ${v.lastName}`,
          _id:  v.userId,
          src:  v.avatar,
        }))}
        max={4}
        size="xs"
      />
      <span className="flex items-center gap-1 text-2xs text-emerald-500 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    </motion.div>
  );
};
