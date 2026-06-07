import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectBudget {
  originalContractValue: number;
  approvedChangeOrders: number;
  pendingChangeOrders: number;
  revisedContractValue: number;
  billedToDate: number;
  paidToDate: number;
  retainagePercent: number;
  retainageHeld: number;
  contingency: number;
  projectedFinalCost?: number;
}

export interface ProjectMilestone {
  _id: string;
  name: string;
  dueDate: string;
  completedDate?: string;
  isCompleted: boolean;
  notes?: string;
}

export interface ProjectMember {
  userId: string;
  role: string;
  addedAt: string;
}

export type ProjectPhase = 'pre_bid'|'bidding'|'awarded'|'pre_construction'|'construction'|'closeout'|'warranty'|'completed'|'cancelled'|'on_hold';
export type ProjectType  = 'commercial'|'residential'|'industrial'|'infrastructure'|'renovation'|'interior'|'civil'|'mixed_use'|'other';

export interface PublicProject {
  _id: string;
  workspaceId: string;
  jobNumber: string;
  name: string;
  description?: string;
  type: ProjectType;
  phase: ProjectPhase;
  priority: string;
  address: { street?: string; city?: string; state?: string; zip?: string; country?: string };
  sqFootage?: number;
  buildingType?: string;
  clientId?: string;
  gcId?: string;
  architectId?: string;
  contractType: string;
  deliveryMethod: string;
  permitNumbers: string[];
  budget: ProjectBudget;
  bidDueDate?: string;
  awardDate?: string;
  startDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  warrantyExpiry?: string;
  projectManagerId?: string;
  superintendentId?: string;
  members: ProjectMember[];
  milestones: ProjectMilestone[];
  healthScore: number;
  completionPercent: number;
  scheduleVariance?: number;
  budgetVariance?: number;
  tags: string[];
  isArchived: boolean;
  coverColor: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberRole?: string | null;
}

export interface ProjectState {
  projects: PublicProject[];
  activeProject: PublicProject | null;
  status: LoadingState;
  error: string | null;
}

const initialState: ProjectState = {
  projects:      [],
  activeProject: null,
  status:        'idle',
  error:         null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects:       (s, a: PayloadAction<PublicProject[]>)   => { s.projects = a.payload; s.status = 'succeeded'; },
    addProject:        (s, a: PayloadAction<PublicProject>)     => { s.projects.unshift(a.payload); },
    updateProject:     (s, a: PayloadAction<PublicProject>)     => {
      const idx = s.projects.findIndex(p => p._id === a.payload._id);
      if (idx !== -1) s.projects[idx] = a.payload;
      if (s.activeProject?._id === a.payload._id) s.activeProject = a.payload;
    },
    removeProject:     (s, a: PayloadAction<string>)            => { s.projects = s.projects.filter(p => p._id !== a.payload); },
    setActiveProject:  (s, a: PayloadAction<PublicProject|null>)=> { s.activeProject = a.payload; },
    setProjectStatus:  (s, a: PayloadAction<LoadingState>)      => { s.status = a.payload; },
    clearProjects:     (s) => { s.projects = []; s.activeProject = null; s.status = 'idle'; },
  },
});

export const { setProjects, addProject, updateProject, removeProject, setActiveProject, setProjectStatus, clearProjects } = projectSlice.actions;
export const projectReducer = projectSlice.reducer;

export const selectProjects      = (s: { projects: ProjectState }) => s.projects.projects;
export const selectActiveProject = (s: { projects: ProjectState }) => s.projects.activeProject;
export const selectProjectStatus = (s: { projects: ProjectState }) => s.projects.status;
