import type { UserProfile } from '@workpulse/shared';

import type { LoadingState } from './index';

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: LoadingState;
  error: string | null;
  initialized: boolean;
}
