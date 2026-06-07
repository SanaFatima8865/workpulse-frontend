import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState } from '@/types';

export type ClientType   = 'owner'|'general_contractor'|'subcontractor'|'architect'|'engineer'|'supplier'|'government'|'other';
export type ClientStatus = 'active'|'inactive'|'prospect'|'archived';
export type LeadStatus   = 'new'|'contacted'|'qualified'|'proposal'|'negotiating'|'won'|'lost';

export interface PublicClient {
  _id: string;
  workspaceId: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  leadStatus?: LeadStatus;
  taxId?: string;
  licenseNumber?: string;
  website?: string;
  email?: string;
  phone?: string;
  address: { street?: string; city?: string; state?: string; zip?: string; country?: string };
  contacts: Array<{ _id: string; firstName: string; lastName: string; title?: string; email?: string; phone?: string; isPrimary: boolean }>;
  tags: string[];
  notes?: string;
  rating: number;
  totalContractValue: number;
  projectCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientState {
  clients: PublicClient[];
  status: LoadingState;
  error: string | null;
}

const initialState: ClientState = { clients: [], status: 'idle', error: null };

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients:   (s, a: PayloadAction<PublicClient[]>) => { s.clients = a.payload; s.status = 'succeeded'; },
    addClient:    (s, a: PayloadAction<PublicClient>)   => { s.clients.unshift(a.payload); },
    updateClient: (s, a: PayloadAction<PublicClient>)   => {
      const i = s.clients.findIndex(c => c._id === a.payload._id);
      if (i !== -1) s.clients[i] = a.payload;
    },
    removeClient: (s, a: PayloadAction<string>)         => { s.clients = s.clients.filter(c => c._id !== a.payload); },
    clearClients: (s) => { s.clients = []; s.status = 'idle'; },
  },
});

export const { setClients, addClient, updateClient, removeClient, clearClients } = clientSlice.actions;
export const clientReducer = clientSlice.reducer;

export const selectClients = (s: { clients: ClientState }) => s.clients.clients;
