import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Calendar, DollarSign, Users, MoreHorizontal, Trash2, ExternalLink, MapPin } from 'lucide-react';

import { Card }     from '@/components/ui/Card';
import { Badge }    from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button }   from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { cn }       from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PublicProject, ProjectPhase, ProjectType } from '@/store/projectSlice';
import { useDeleteProject } from '../hooks/useProjects';

// ─── Display helpers ──────────────────────────────────────────────────────────

export const PHASE_CONFIG: Record<ProjectPhase, { label: string; color: string; bg: string; dot: string }> = {
  pre_bid:          { label: 'Pre-Bid',         color: 'text-gray-600',   bg: 'bg-gray-100',   dot: '#9CA3AF' },
  bidding:          { label: 'Bidding',          color: 'text-blue-600',   bg: 'bg-blue-100',   dot: '#3B82F6' },
  awarded:          { label: 'Awarded',          color: 'text-teal-600',   bg: 'bg-teal-100',   dot: '#14B8A6' },
  pre_construction: { label: 'Pre-Construction', color: 'text-indigo-600', bg: 'bg-indigo-100', dot: '#6366F1' },
  construction:     { label: 'Construction',     color: 'text-brand-600',  bg: 'bg-brand-100',  dot: '#6453F8' },
  closeout:         { label: 'Close-Out',        color: 'text-amber-600',  bg: 'bg-amber-100',  dot: '#F59E0B' },
  warranty:         { label: 'Warranty',         color: 'text-orange-600', bg: 'bg-orange-100', dot: '#F97316' },
  completed:        { label: 'Completed',        color: 'text-emerald-600',bg: 'bg-emerald-100',dot: '#10B981' },
  cancelled:        { label: 'Cancelled',        color: 'text-red-600',    bg: 'bg-red-100',    dot: '#EF4444' },
  on_hold:          { label: 'On Hold',          color: 'text-yellow-600', bg: 'bg-yellow-100', dot: '#EAB308' },
};

export const TYPE_LABELS: Record<ProjectType, string> = {
  commercial:     'Commercial',
  residential:    'Residential',
  industrial:     'Industrial',
  infrastructure: 'Infrastructure',
  renovation:     'Renovation',
  interior:       'Interior',
  civil:          'Civil',
  mixed_use:      'Mixed Use',
  other:          'Other',
};

export const PhaseBadge: React.FC<{ phase: ProjectPhase; size?: 'sm' | 'md' }> = ({ phase, size = 'sm' }) => {
  const cfg = PHASE_CONFIG[phase] ?? PHASE_CONFIG.pre_bid;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
      cfg.color, cfg.bg
    )}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

export const HealthBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? 'text-emerald-600 bg-emerald-50' : score >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
  const label = score >= 80 ? 'Healthy' : score >= 60 ? 'At Risk' : 'Critical';
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full', color)}>
      {score} · {label}
    </span>
  );
};

// ─── ProjectCard ──────────────────────────────────────────────────────────────

interface ProjectCardProps { project: PublicProject; index?: number }

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index = 0 }) => {
  const navigate     = useNavigate();
  const deleteProject = useDeleteProject();
  const hasBudget    = project.budget.originalContractValue > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Card hover padding="none" className="cursor-pointer overflow-visible group"
        onClick={() => navigate(`/projects/${project._id}`)}>
        {/* Color bar */}
        <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: project.coverColor }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xs font-mono text-[var(--color-text-muted)] bg-surface-secondary dark:bg-surface-dark-tertiary px-1.5 py-0.5 rounded">
                  {project.jobNumber}
                </span>
                <PhaseBadge phase={project.phase} />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text)] leading-tight truncate">
                {project.name}
              </h3>
              {project.address?.city && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-[var(--color-text-muted)]" />
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {project.address.city}{project.address.state ? `, ${project.address.state}` : ''}
                  </p>
                </div>
              )}
            </div>

            <Dropdown
              trigger={<Button variant="ghost" size="xs" onClick={(e) => e.stopPropagation()} className="shrink-0"><MoreHorizontal size={14} /></Button>}
              items={[
                { label: 'View Project',  icon: <ExternalLink size={14} />, onClick: () => navigate(`/projects/${project._id}`) },
                { label: '', onClick: undefined, divider: true },
                { label: 'Delete',        icon: <Trash2 size={14} />, danger: true,
                  onClick: () => { if (confirm(`Delete "${project.name}"?`)) deleteProject.mutate(project._id); } },
              ]}
              align="right" width={160}
            />
          </div>

          {/* Progress + Health */}
          <div className="space-y-1.5 mb-3">
            <Progress
              value={project.completionPercent}
              size="xs"
              color="auto"
              label={`${project.completionPercent}% complete`}
              showLabel
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface-border dark:border-surface-dark-border">
            <div className="text-center">
              <p className={cn('text-sm font-bold', project.healthScore >= 80 ? 'text-emerald-600' : project.healthScore >= 60 ? 'text-amber-500' : 'text-red-500')}>
                {project.healthScore}
              </p>
              <p className="text-2xs text-[var(--color-text-muted)]">Health</p>
            </div>

            <div className="text-center">
              {hasBudget ? (
                <>
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    {formatCurrency(project.budget.revisedContractValue, 'USD').replace('$','$').slice(0,-3)}M
                  </p>
                  <p className="text-2xs text-[var(--color-text-muted)]">Contract</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-[var(--color-text-muted)]">—</p>
                  <p className="text-2xs text-[var(--color-text-muted)]">No budget</p>
                </>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-[var(--color-text)]">{project.members.length}</p>
              <p className="text-2xs text-[var(--color-text-muted)]">Team</p>
            </div>
          </div>

          {/* Dates */}
          {(project.startDate || project.plannedEndDate) && (
            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-surface-border dark:border-surface-dark-border">
              <Calendar size={11} className="text-[var(--color-text-muted)]" />
              <p className="text-2xs text-[var(--color-text-muted)]">
                {project.startDate && formatDate(project.startDate)}
                {project.startDate && project.plannedEndDate && ' → '}
                {project.plannedEndDate && formatDate(project.plannedEndDate)}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
