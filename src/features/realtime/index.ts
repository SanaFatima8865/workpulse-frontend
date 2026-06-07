// Hooks
export { useSocket, useSocketEvent, useSocketEmit } from './hooks/useSocket';
export { useWorkspacePresence, useBoardPresence, useTypingIndicator, useLiveNotifications } from './hooks/usePresence';
export { useBoardSync } from './hooks/useBoardSync';

// Components
export { ConnectionStatus, ConnectionDot } from './components/ConnectionStatus';
export { BoardPresenceBar }    from './components/BoardPresenceBar';
export { TypingIndicator }     from './components/TypingIndicator';
export { NotificationBell, LiveNotificationsPanel } from './components/LiveNotificationsPanel';
