import React from 'react';
import { Modal }  from '@/components/ui/Modal';
import { cn }     from '@/lib/cn';

interface ShortcutRow { keys: string[]; desc: string }
interface Section { title: string; rows: ShortcutRow[] }

const SECTIONS: Section[] = [
  { title: 'Navigation', rows: [
    { keys: ['G', 'D'], desc: 'Go to Dashboard' },
    { keys: ['G', 'P'], desc: 'Go to Projects' },
    { keys: ['G', 'B'], desc: 'Go to Boards' },
    { keys: ['G', 'T'], desc: 'Go to My Tasks' },
    { keys: ['G', 'I'], desc: 'Go to Inbox' },
    { keys: ['G', 'A'], desc: 'Go to Analytics' },
  ]},
  { title: 'Actions', rows: [
    { keys: ['⌘', 'K'],      desc: 'Open AI Search' },
    { keys: ['⌘', 'N'],      desc: 'New Task' },
    { keys: ['Esc'],          desc: 'Close panel / modal' },
    { keys: ['Enter'],        desc: 'Submit form / confirm' },
  ]},
  { title: 'Board', rows: [
    { keys: ['N'],            desc: 'Add task in first column' },
    { keys: ['←', '→'],      desc: 'Move between columns' },
    { keys: ['Drag'],         desc: 'Move task between columns' },
  ]},
];

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded border border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-tertiary text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
    {children}
  </kbd>
);

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Keyboard Shortcuts & Help" size="md">
    <div className="space-y-5">
      {SECTIONS.map(section => (
        <div key={section.title}>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            {section.title}
          </p>
          <div className="space-y-1.5">
            {section.rows.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--color-text)]">{row.desc}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {row.keys.map((k, ki) => <Kbd key={ki}>{k}</Kbd>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border">
        <p className="text-xs text-[var(--color-text-muted)]">
          WorkPulse — Construction Project Management Platform.
          Need help? Contact your workspace admin or visit the documentation.
        </p>
      </div>
    </div>
  </Modal>
);
