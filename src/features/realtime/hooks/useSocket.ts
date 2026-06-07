import React from 'react';
import type { Socket } from 'socket.io-client';

import { getSocket, connectSocket, disconnectSocket, isSocketConnected } from '@/lib/socket';
import { useAppDispatch, useAppSelector } from '@/store';
import { setConnected } from '@/store/presenceSlice';
import { selectIsAuthenticated } from '@/store/authSlice';
import { selectAccessToken } from '@/store/authSlice';

// ─── useSocket ────────────────────────────────────────────────────────────────

/**
 * Returns the socket instance, managing connection lifecycle.
 * On auth, connects automatically; on logout, disconnects.
 */
export const useSocket = (): Socket => {
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const accessToken     = useAppSelector(selectAccessToken);
  const socket          = getSocket();

  React.useEffect(() => {
    if (isAuthenticated && accessToken && !socket.connected) {
      connectSocket(accessToken);
    } else if (!isAuthenticated && socket.connected) {
      disconnectSocket();
    }
  }, [isAuthenticated, accessToken]);

  // Track connection status in Redux
  React.useEffect(() => {
    const onConnect    = () => dispatch(setConnected(true));
    const onDisconnect = () => dispatch(setConnected(false));
    const onError      = (err: Error) => console.warn('[socket] Error:', err.message);

    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('error',      onError);

    // Set initial state
    if (socket.connected) dispatch(setConnected(true));

    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('error',      onError);
    };
  }, []);

  return socket;
};

// ─── useSocketEvent ───────────────────────────────────────────────────────────

/**
 * Subscribes to a socket event. Auto-unsubscribes on unmount.
 */
export const useSocketEvent = <T = unknown>(
  event:   string,
  handler: (data: T) => void,
  deps:    React.DependencyList = []
): void => {
  const socket = getSocket();

  React.useEffect(() => {
    socket.on(event, handler);
    return () => { socket.off(event, handler); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
};

// ─── useSocketEmit ────────────────────────────────────────────────────────────

/**
 * Returns a stable emit function.
 */
export const useSocketEmit = () => {
  const socket = getSocket();
  return React.useCallback((event: string, data?: unknown) => {
    if (socket.connected) {
      socket.emit(event, data);
    }
  }, []);
};
