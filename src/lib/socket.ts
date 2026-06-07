import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect:           false,
      withCredentials:       true,
      transports:            ['websocket', 'polling'],
      reconnection:          true,
      reconnectionAttempts:  10,
      reconnectionDelay:     1000,
      reconnectionDelayMax:  10000,
      timeout:               20000,
    });

    // Global debug in dev
    if (import.meta.env.DEV) {
      socket.onAny((event, ...args) => {
        if (!event.includes('cursor')) { // skip noisy cursor events
          console.debug(`[socket] ← ${event}`, args[0] ?? '');
        }
      });
    }
  }
  return socket;
};

export const connectSocket = (token: string): void => {
  const s = getSocket();
  currentToken = token;
  if (!s.connected) {
    s.auth = { token };
    s.connect();
  } else if (token !== currentToken) {
    // Token refreshed — reconnect with new token
    s.auth = { token };
    s.disconnect().connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
  currentToken = null;
};

export const isSocketConnected = (): boolean =>
  socket?.connected ?? false;

// Re-attach token after reconnect (token refresh)
export const refreshSocketToken = (newToken: string): void => {
  if (socket) {
    currentToken   = newToken;
    socket.auth    = { token: newToken };
  }
};
