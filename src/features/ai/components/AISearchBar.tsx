import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight, HardHat, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { useAISearch } from '../api/aiApi';
import type { SearchResult } from '../api/aiApi';
import { useDebounce } from '@/hooks';

interface AISearchBarProps {
  open:    boolean;
  onClose: () => void;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({ open, onClose }) => {
  const navigate  = useNavigate();
  const search    = useAISearch();
  const [query, setQuery] = React.useState('');
  const debouncedQuery    = useDebounce(query, 400);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); }
    else       { setQuery(''); }
  }, [open]);

  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      search.mutate(debouncedQuery);
    }
  }, [debouncedQuery]);

  const results: SearchResult[] = (search.data?.data?.results ?? []) as SearchResult[];

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose} />
          <motion.div
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
            initial={{ opacity:0, y:-20, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20, scale:0.96 }}
            transition={{ type:'spring', stiffness:400, damping:30 }}
          >
            <div className="bg-white dark:bg-surface-dark-secondary rounded-2xl shadow-modal border border-surface-border dark:border-surface-dark-border overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border dark:border-surface-dark-border">
                {search.isPending
                  ? <Loader2 size={18} className="text-brand-600 animate-spin shrink-0" />
                  : <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && onClose()}
                  placeholder="Search projects, tasks, clients..."
                  className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 rounded text-[var(--color-text-muted)] hover:bg-surface-secondary transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto">
                {query.length < 2 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">Type to search across your workspace</p>
                    <p className="text-2xs text-[var(--color-text-muted)] mt-1">Search projects, tasks, job numbers...</p>
                  </div>
                ) : results.length === 0 && !search.isPending ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">No results for "{query}"</p>
                  </div>
                ) : (
                  <div className="py-1.5">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors text-left group"
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          result.type === 'project' ? 'bg-brand-100 text-brand-600' : 'bg-teal-100 text-teal-600'
                        )}>
                          {result.type === 'project' ? <HardHat size={15} /> : <CheckSquare size={15} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{result.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)] capitalize">{result.subtitle}</p>
                        </div>
                        <ArrowRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-border dark:border-surface-dark-border bg-surface-secondary/50 dark:bg-surface-dark-tertiary/30">
                <div className="flex items-center gap-1.5 text-2xs text-[var(--color-text-muted)]">
                  <kbd className="px-1.5 py-0.5 rounded border border-surface-border-strong text-2xs font-mono">↑↓</kbd> navigate
                  <kbd className="px-1.5 py-0.5 rounded border border-surface-border-strong text-2xs font-mono ml-1">↵</kbd> open
                  <kbd className="px-1.5 py-0.5 rounded border border-surface-border-strong text-2xs font-mono ml-1">Esc</kbd> close
                </div>
                <span className="text-2xs text-[var(--color-text-muted)]">AI-powered search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
