import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Send, Loader2, Bot, Sparkles, ChevronDown } from 'lucide-react';

import { Button }      from '@/components/ui/Button';
import { Avatar }      from '@/components/ui/Avatar';
import { cn }          from '@/lib/cn';
import { formatRelative } from '@/lib/utils';
import { useAIChat, useAIStatus } from '../api/aiApi';
import type { ChatMessage } from '../api/aiApi';

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  'Summarize portfolio risks',
  'What projects are at risk?',
  'How should I handle change orders?',
  'What are best practices for punch lists?',
];

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {!isUser && (
        <div className="w-7 h-7 bg-gradient-brand rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
        isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text)] rounded-tl-sm'
      )}>
        {/* Render markdown-lite: bold, newlines */}
        {msg.content.split('\n').map((line, i) => {
          const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return (
            <p key={i} className={cn(i > 0 && 'mt-1.5')} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />
          );
        })}
        {msg.timestamp && (
          <p className={cn('text-2xs mt-1.5 opacity-60', isUser ? 'text-right' : '')}>
            {formatRelative(msg.timestamp)}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

interface AIAssistantPanelProps {
  open:       boolean;
  onClose:    () => void;
  projectId?: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ open, onClose, projectId }) => {
  const { data: status }  = useAIStatus();
  const chat              = useAIChat();
  const [messages, setMessages]   = React.useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your WorkPulse AI assistant. I can help with project analysis, risk assessment, task generation, and more. What would you like to know?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = React.useState('');
  const [minimized, setMinimized] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef  = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || chat.isPending) return;
    setInput('');

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text, timestamp: new Date().toISOString() },
    ];
    setMessages(newMessages);

    const result = await chat.mutateAsync({ messages: newMessages, projectId });
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: result.data?.reply ?? 'Sorry, I couldn\'t generate a response.',
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            'fixed bottom-4 right-4 z-50 flex flex-col',
            'bg-white dark:bg-surface-dark-secondary rounded-2xl shadow-modal',
            'border border-surface-border dark:border-surface-dark-border',
            minimized ? 'w-72 h-auto' : 'w-80 sm:w-96 h-[520px]'
          )}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border dark:border-surface-dark-border shrink-0">
            <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-text)] leading-none">WorkPulse AI</p>
              <p className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                {status?.provider === 'mock' ? '🟡 Demo mode' : `🟢 ${status?.provider ?? 'Connected'}`}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setMinimized(m => !m)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
                {minimized ? <ChevronDown size={15} /> : <Minimize2 size={15} />}
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

                {/* Typing indicator */}
                <AnimatePresence>
                  {chat.isPending && (
                    <motion.div className="flex gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="w-7 h-7 bg-gradient-brand rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="bg-surface-secondary dark:bg-surface-dark-tertiary rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
                        {[0,1,2].map(i => (
                          <motion.span key={i} className="w-1.5 h-1.5 bg-brand-400 rounded-full"
                            animate={{ y: [0,-4,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Quick actions */}
              {messages.length <= 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map(action => (
                    <button key={action} onClick={() => handleQuickAction(action)}
                      className="text-2xs font-medium px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors">
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="shrink-0 px-3 pb-3 pt-2 border-t border-surface-border dark:border-surface-dark-border">
                <div className="flex items-end gap-2 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl px-3 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask anything about your projects..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none resize-none leading-snug"
                    style={{ maxHeight: '80px', overflowY: 'auto' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || chat.isPending}
                    className="text-brand-600 disabled:opacity-30 hover:text-brand-700 transition-colors shrink-0 mb-0.5"
                  >
                    {chat.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
