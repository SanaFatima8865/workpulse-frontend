import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState } from '@/types';

export interface PublicTeam {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  memberCount: number;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  myRole?: 'lead' | 'member' | null;
}

export interface TeamState {
  teams: PublicTeam[];
  status: LoadingState;
  error: string | null;
}

const initialState: TeamState = { teams: [], status: 'idle', error: null };

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<PublicTeam[]>) => {
      state.teams  = action.payload;
      state.status = 'succeeded';
      state.error  = null;
    },
    addTeam: (state, action: PayloadAction<PublicTeam>) => {
      state.teams.unshift(action.payload);
    },
    updateTeamInList: (state, action: PayloadAction<PublicTeam>) => {
      const idx = state.teams.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.teams[idx] = action.payload;
    },
    removeTeam: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter((t) => t._id !== action.payload);
    },
    clearTeams: (state) => {
      state.teams  = [];
      state.status = 'idle';
      state.error  = null;
    },
    setTeamStatus: (state, action: PayloadAction<LoadingState>) => { state.status = action.payload; },
    setTeamError:  (state, action: PayloadAction<string | null>) => { state.error = action.payload; state.status = 'failed'; },
  },
});

export const { setTeams, addTeam, updateTeamInList, removeTeam, clearTeams, setTeamStatus, setTeamError } = teamSlice.actions;
export const teamReducer = teamSlice.reducer;

export const selectTeams      = (s: { teams: TeamState }) => s.teams.teams;
export const selectTeamStatus = (s: { teams: TeamState }) => s.teams.status;
