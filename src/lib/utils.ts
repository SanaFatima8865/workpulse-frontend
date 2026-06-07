import { format, formatDistanceToNow, isToday, isYesterday, isThisYear } from 'date-fns';

// ─── Date Formatting ─────────────────────────────────────────────────────────

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisYear(d)) return format(d, 'MMM d');
  return format(d, 'MMM d, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  if (isThisYear(d)) return format(d, 'MMM d, h:mm a');
  return format(d, 'MMM d, yyyy h:mm a');
};

export const formatRelative = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDueDate = (date: string | Date): { text: string; isOverdue: boolean; isDueSoon: boolean } => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueSoon = diffDays >= 0 && diffDays <= 2;
  return { text: formatDate(date), isOverdue, isDueSoon };
};

// ─── Number Formatting ───────────────────────────────────────────────────────

export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

export const formatPercent = (n: number, decimals = 0): string =>
  `${n.toFixed(decimals)}%`;

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─── String Utilities ────────────────────────────────────────────────────────

export const truncate = (str: string, maxLen: number): string =>
  str.length <= maxLen ? str : `${str.slice(0, maxLen - 3)}...`;

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const titleCase = (str: string): string =>
  str
    .split(/[\s_-]+/)
    .map(capitalize)
    .join(' ');

export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getInitials = (name: string, maxChars = 2): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, maxChars)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

// ─── Color Utilities ─────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#6453f8', '#14b8a6', '#f97316', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f59e0b', '#3b82f6',
];

export const getAvatarColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── URL Utilities ───────────────────────────────────────────────────────────

export const buildQueryString = (params: Record<string, unknown>): string => {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!filtered.length) return '';
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString();
};
