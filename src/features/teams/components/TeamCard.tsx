import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Code, Hammer, Pencil, BarChart2, Globe, Star, Zap, Shield, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card }     from '@/components/ui/Card';
import { Badge }    from '@/components/ui/Badge';
import { Button }   from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import type { PublicTeam } from '@/store/teamSlice';
import { useDeleteTeam }   from '../hooks/useTeams';

const ICON_MAP: Record<string, React.ReactNode> = {
  users: <Users size={18} />, code: <Code size={18} />, hammer: <Hammer size={18} />,
  pencil: <Pencil size={18} />, chart: <BarChart2 size={18} />, globe: <Globe size={18} />,
  star: <Star size={18} />, zap: <Zap size={18} />, shield: <Shield size={18} />, heart: <Heart size={18} />,
};

export const TeamCard: React.FC<{ team: PublicTeam; index?: number }> = ({ team, index = 0 }) => {
  const navigate   = useNavigate();
  const deleteTeam = useDeleteTeam();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card hover padding="none" className="cursor-pointer overflow-visible group"
        onClick={() => navigate(`/teams/${team._id}`)}>
        <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: team.color }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: team.color }}>
                {ICON_MAP[team.icon] ?? <Users size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[var(--color-text)] truncate leading-none">{team.name}</h3>
                  {team.isDefault && <Badge variant="secondary" size="sm">Default</Badge>}
                  {team.myRole === 'lead' && <Badge variant="primary" size="sm">Lead</Badge>}
                </div>
                {team.description && <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">{team.description}</p>}
              </div>
            </div>
            <Dropdown
              trigger={<Button variant="ghost" size="xs" onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 shrink-0"><MoreHorizontal size={15} /></Button>}
              items={[
                { label: 'View Team', icon: <Users size={14} />, onClick: () => navigate(`/teams/${team._id}`) },
                ...(team.myRole === 'lead' ? [
                  { label: '', onClick: undefined, divider: true },
                  { label: 'Delete Team', icon: <Trash2 size={14} />, danger: true,
                    onClick: () => { if (confirm(`Delete team "${team.name}"?`)) deleteTeam.mutate(team._id); } },
                ] : []),
              ]}
              align="right" width={160}
            />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Users size={13} />
              <span>{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${team.color}20`, color: team.color }}>
              {team.myRole ?? 'member'}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
