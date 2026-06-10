// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// ─── User Types ────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface UserBase {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends UserBase {
  bio?: string;
  jobTitle?: string;
  phone?: string;
  timezone: string;
  language: string;
  preferences: UserPreferences;
  emailVerified?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  dashboardLayout: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  taskAssigned: boolean;
  taskDue: boolean;
  mentions: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
}

// ─── Workspace Types ───────────────────────────────────────────────────────

export type WorkspacePlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface WorkspaceBase {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: WorkspacePlan;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicWorkspace extends WorkspaceBase {
  description?: string;
  coverColor?: string;
  memberCount?: number;
  settings?: {
    defaultProjectView?: 'board' | 'list' | 'table' | 'timeline';
    allowGuestAccess?: boolean;
    requireApprovalForMaterialRequests?: boolean;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };
}

// ─── Project Types ─────────────────────────────────────────────────────────

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectType = 'software' | 'construction' | 'marketing' | 'operations' | 'other';
export type ProjectPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ProjectBase {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  type: ProjectType;
  priority: ProjectPriority;
  workspaceId: string;
  ownerId: string;
  startDate?: string;
  dueDate?: string;
  progress: number;
  healthScore: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Task Types ────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done' | 'cancelled';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TaskBase {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  boardId: string;
  groupId: string;
  assigneeIds: string[];
  reporterId: string;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  tags: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  workspaceId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  workspaceName?: string;
}

// ─── Notification Types ────────────────────────────────────────────────────

export type NotificationType =
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_completed'
  | 'comment_mention'
  | 'project_update'
  | 'ai_insight'
  | 'material_request'
  | 'approval_needed';

export interface NotificationBase {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
