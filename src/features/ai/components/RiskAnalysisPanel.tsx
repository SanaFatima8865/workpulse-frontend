import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { useRiskAnalysis } from '../api/aiApi';
import type { RiskItem } from '../api/aiApi';

const LEVEL_CFG = {
  high:  { color:'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900', text:'text-red-700 dark:text-red-400', badge:'bg-red-500 text-white', dot:'#EF4444', label:'HIGH' },
  medium:{ color:'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900', text:'text-amber-700 dark:text-amber-400', badge:'bg-amber-400 text-white', dot:'#F59E0B', label:'MED' },
  low:   { color:'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900', text:'text-blue-700 dark:text-blue-400', badge:'bg-blue-400 text-white', dot:'#3B82F6', label:'LOW' },
};

const RiskCard: React.FC<{ risk: RiskItem; index: number }> = ({ risk, index }) => {
  const [exp, setExp] = React.useState(index === 0);
  const cfg = LEVEL_CFG[risk.level];
  return (
    <motion.div className={cn('rounded-xl border p-3.5 cursor-pointer', cfg.color)} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:index*0.07 }} onClick={() => setExp(e=>!e)}>
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 shrink-0">
          <svg viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke={cfg.dot} strokeWidth="4" strokeDasharray={`${(risk.score/100)*100.5} 100.5`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: cfg.dot }}>{risk.score}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded', cfg.badge)}>{cfg.label}</span>
            <span className={cn('text-xs font-bold', cfg.text)}>{risk.category}</span>
          </div>
          <p className="text-xs text-[var(--color-text)] leading-snug">{risk.impact}</p>
        </div>
        {exp ? <ChevronUp size={14} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />}
      </div>
      <AnimatePresence>
        {exp && (
          <motion.div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-dark-border" initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}>
            <div className="flex items-start gap-2">
              <Shield size={13} className={cn('shrink-0 mt-0.5', cfg.text)} />
              <div><p className="text-2xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Recommendation</p><p className="text-xs text-[var(--color-text)] leading-relaxed">{risk.recommendation}</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const RiskAnalysisPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data, isLoading, refetch, isFetching } = useRiskAnalysis(projectId);
  const risks = data?.risks ?? [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <h3 className="text-sm font-bold text-[var(--color-text)]">AI Risk Analysis</h3>
          {data?.provider === 'mock' && <span className="text-2xs bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-muted)] px-1.5 py-0.5 rounded font-medium">Demo</span>}
        </div>
        <Button variant="ghost" size="xs" leftIcon={<RefreshCw size={12} className={isFetching?'animate-spin':''} />} onClick={() => refetch()}>Refresh</Button>
      </div>
      {risks.length > 0 && (
        <div className="flex items-center gap-2">
          {risks.filter(r=>r.level==='high').length > 0 && <span className="text-2xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{risks.filter(r=>r.level==='high').length} High</span>}
          {risks.filter(r=>r.level==='medium').length > 0 && <span className="text-2xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{risks.filter(r=>r.level==='medium').length} Med</span>}
          <span className="text-2xs text-[var(--color-text-muted)]">{risks.length} risks found</span>
        </div>
      )}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} height={72} className="rounded-xl"/>)}</div>
      ) : risks.length === 0 ? (
        <div className="text-center py-6"><Shield size={24} className="text-emerald-500 mx-auto mb-2"/><p className="text-sm font-medium text-[var(--color-text)]">No significant risks identified</p></div>
      ) : (
        <div className="space-y-2.5">{risks.map((r,i)=><RiskCard key={i} risk={r} index={i}/>)}</div>
      )}
    </div>
  );
};
