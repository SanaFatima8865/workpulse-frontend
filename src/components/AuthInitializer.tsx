import React from 'react';

import { useInitAuth }   from '@/features/auth/hooks/useAuth';
import { workspaceApi }  from '@/features/workspaces/api/workspaceApi';
import { teamApi }       from '@/features/teams/api/teamApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { setWorkspaces } from '@/store/workspaceSlice';
import { setTeams }      from '@/store/teamSlice';
import { selectIsAuthenticated } from '@/store/authSlice';
import { selectAccessToken }     from '@/store/authSlice';
import { connectSocket }         from '@/lib/socket';

/**
 * Runs once on app mount:
 * 1. Silent session restoration via refresh cookie
 * 2. On auth: loads workspaces + teams
 * 3. Connects Socket.io with the access token
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize }  = useInitAuth();
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const accessToken     = useAppSelector(selectAccessToken);
  const initialized     = React.useRef(false);

  // Run once on mount
  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize();
    }
  }, [initialize]);

  // When auth state changes, load workspace data + connect socket
  React.useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Connect Socket.io
    connectSocket(accessToken);

    // Load workspaces
    workspaceApi.getAll()
      .then((res) => {
        if (res.data) {
          dispatch(setWorkspaces(res.data));
          const firstWs = res.data[0];
          if (firstWs) {
            teamApi.getAll(firstWs._id)
              .then((r) => { if (r.data) dispatch(setTeams(r.data)); })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated, accessToken, dispatch]);

  return <>{children}</>;
};
