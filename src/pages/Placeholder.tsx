import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';

import { useTitle } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface PlaceholderProps {
  title?: string;
  description?: string;
  module?: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({
  title = 'Coming Soon',
  description = 'This module is under development.',
  module,
}) => {
  useTitle(title);
  const navigate = useNavigate();

  return (
    <div className={cn(
      'min-h-full flex items-center justify-center p-8',
    )}>
      <div className="text-center max-w-md space-y-5">
        {/* Animated icon */}
        <div className="w-20 h-20 mx-auto bg-brand-50 dark:bg-brand-950/30 rounded-3xl flex items-center justify-center">
          <Construction size={36} className="text-brand-500" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">{title}</h1>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{description}</p>
          {module && (
            <p className="inline-flex items-center gap-1.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-100 dark:border-brand-900">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
              {module}
            </p>
          )}
        </div>

        {/* Action */}
        <Button variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Placeholder;
