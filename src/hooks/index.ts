import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, selectTheme, addToast, removeToast } from '@/store/uiSlice';
import type { Theme, ToastNotification } from '@/types';

// ─── useTheme ──────────────────────────────────────────────────────────────────

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const resolvedTheme: 'light' | 'dark' = React.useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme: (t: Theme) => dispatch(setTheme(t)),
    isDark: resolvedTheme === 'dark',
  };
};

// ─── useToast ─────────────────────────────────────────────────────────────────

export const useToast = () => {
  const dispatch = useAppDispatch();

  const toast = {
    success: (title: string, message?: string) =>
      dispatch(addToast({ type: 'success', title, message, duration: 4000 })),
    error: (title: string, message?: string) =>
      dispatch(addToast({ type: 'error', title, message, duration: 6000 })),
    warning: (title: string, message?: string) =>
      dispatch(addToast({ type: 'warning', title, message, duration: 5000 })),
    info: (title: string, message?: string) =>
      dispatch(addToast({ type: 'info', title, message, duration: 4000 })),
    dismiss: (id: string) => dispatch(removeToast(id)),
  };

  return toast;
};

// ─── useDebounce ──────────────────────────────────────────────────────────────

export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

// ─── useMediaQuery ─────────────────────────────────────────────────────────────

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export const useIsMobile = () => useMediaQuery('(max-width: 1024px)');
export const useIsTablet = () => useMediaQuery('(max-width: 768px)');

// ─── useLocalStorage ─────────────────────────────────────────────────────────

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const set = React.useCallback((val: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [key]);

  const remove = React.useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, set, remove] as const;
};

// ─── useTitle ─────────────────────────────────────────────────────────────────

export const useTitle = (title: string, suffix = 'WorkPulse') => {
  React.useEffect(() => {
    document.title = title ? `${title} — ${suffix}` : suffix;
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
};

// ─── useClickOutside ─────────────────────────────────────────────────────────

export const useClickOutside = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void
) => {
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
