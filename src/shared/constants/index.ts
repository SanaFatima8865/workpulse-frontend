// ─── App Constants ─────────────────────────────────────────────────────────

export const APP_NAME = 'WorkPulse';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Enterprise Work Management Platform';

// ─── API Constants ─────────────────────────────────────────────────────────

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// ─── Pagination ────────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ─── JWT ───────────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const REMEMBER_ME_EXPIRY = '30d';

// ─── Roles ─────────────────────────────────────────────────────────────────

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const ROLE_PERMISSIONS = {
  owner: ['*'],
  admin: ['workspace:manage', 'project:*', 'task:*', 'member:manage'],
  member: ['project:read', 'project:create', 'task:*'],
  guest: ['project:read', 'task:read'],
} as const;

// ─── Task Constants ────────────────────────────────────────────────────────

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  BLOCKED: 'blocked',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export const TASK_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TASK_STATUS_COLORS = {
  todo: '#6B7280',
  in_progress: '#3B82F6',
  in_review: '#F59E0B',
  blocked: '#EF4444',
  done: '#10B981',
  cancelled: '#9CA3AF',
} as const;

export const TASK_PRIORITY_COLORS = {
  critical: '#DC2626',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
} as const;

// ─── Project Constants ─────────────────────────────────────────────────────

export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PROJECT_TYPES = {
  SOFTWARE: 'software',
  CONSTRUCTION: 'construction',
  MARKETING: 'marketing',
  OPERATIONS: 'operations',
  OTHER: 'other',
} as const;

// ─── File Upload ───────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// ─── Plans ─────────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    members: 5,
    projects: 3,
    storage: 500 * 1024 * 1024, // 500MB
    aiCredits: 50,
  },
  starter: {
    members: 25,
    projects: 20,
    storage: 5 * 1024 * 1024 * 1024, // 5GB
    aiCredits: 500,
  },
  professional: {
    members: 100,
    projects: -1, // unlimited
    storage: 50 * 1024 * 1024 * 1024, // 50GB
    aiCredits: -1, // unlimited
  },
  enterprise: {
    members: -1,
    projects: -1,
    storage: -1,
    aiCredits: -1,
  },
} as const;

// ─── Socket Events ─────────────────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_WORKSPACE: 'workspace:join',
  LEAVE_WORKSPACE: 'workspace:leave',
  JOIN_PROJECT: 'project:join',
  LEAVE_PROJECT: 'project:leave',

  // Tasks
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',

  // Presence
  USER_ONLINE: 'presence:online',
  USER_OFFLINE: 'presence:offline',
  USER_TYPING: 'presence:typing',

  // Notifications
  NOTIFICATION: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
} as const;

// ─── HTTP Status Codes ─────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
