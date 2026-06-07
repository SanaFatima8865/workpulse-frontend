import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnlineUser {
  userId:      string;
  firstName:   string;
  lastName:    string;
  avatar?:     string;
  status:      'online' | 'away' | 'busy';
  boardId?:    string;
  workspaceId: string;
}

export interface BoardViewer {
  userId:    string;
  firstName: string;
  lastName:  string;
  avatar?:   string;
  boardId:   string;
}

export interface TypingUser {
  userId:    string;
  firstName: string;
  taskId:    string;
  context:   'comment' | 'description';
}

export interface DraggingUser {
  userId:    string;
  firstName: string;
  taskId:    string;
  boardId:   string;
}

export interface PresenceState {
  connected:    boolean;
  workspaceUsers:  Record<string, OnlineUser>;     // userId → presence
  boardViewers:    Record<string, BoardViewer[]>;  // boardId → viewers
  typingUsers:     TypingUser[];                    // currently typing
  draggingUsers:   DraggingUser[];                  // currently dragging
  notifications:   LiveNotification[];              // unread live notifications
  unreadCount:     number;
}

export interface LiveNotification {
  id:         string;
  type:       string;
  title:      string;
  message:    string;
  actionUrl?: string;
  fromUser?:  { userId: string; firstName: string; lastName: string; avatar?: string };
  createdAt:  string;
  isRead:     boolean;
}

const initialState: PresenceState = {
  connected:     false,
  workspaceUsers: {},
  boardViewers:   {},
  typingUsers:    [],
  draggingUsers:  [],
  notifications:  [],
  unreadCount:    0,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setConnected: (s, a: PayloadAction<boolean>) => {
      s.connected = a.payload;
    },

    // Workspace presence
    setWorkspaceUsers: (s, a: PayloadAction<OnlineUser[]>) => {
      s.workspaceUsers = {};
      a.payload.forEach(u => { s.workspaceUsers[u.userId] = u; });
    },
    userCameOnline: (s, a: PayloadAction<OnlineUser>) => {
      s.workspaceUsers[a.payload.userId] = a.payload;
    },
    userWentOffline: (s, a: PayloadAction<string>) => {
      delete s.workspaceUsers[a.payload];
    },
    userStatusChanged: (s, a: PayloadAction<{ userId: string; status: OnlineUser['status'] }>) => {
      if (s.workspaceUsers[a.payload.userId]) {
        s.workspaceUsers[a.payload.userId].status = a.payload.status;
      }
    },

    // Board viewers
    setBoardViewers: (s, a: PayloadAction<{ boardId: string; viewers: BoardViewer[] }>) => {
      s.boardViewers[a.payload.boardId] = a.payload.viewers;
    },
    addBoardViewer: (s, a: PayloadAction<BoardViewer>) => {
      const boardId = a.payload.boardId;
      if (!s.boardViewers[boardId]) s.boardViewers[boardId] = [];
      const exists = s.boardViewers[boardId].some(v => v.userId === a.payload.userId);
      if (!exists) s.boardViewers[boardId].push(a.payload);
    },
    removeBoardViewer: (s, a: PayloadAction<{ userId: string; boardId: string }>) => {
      const { userId, boardId } = a.payload;
      if (s.boardViewers[boardId]) {
        s.boardViewers[boardId] = s.boardViewers[boardId].filter(v => v.userId !== userId);
      }
    },

    // Typing
    userStartedTyping: (s, a: PayloadAction<TypingUser>) => {
      const exists = s.typingUsers.some(t => t.userId === a.payload.userId && t.taskId === a.payload.taskId);
      if (!exists) s.typingUsers.push(a.payload);
    },
    userStoppedTyping: (s, a: PayloadAction<{ userId: string; taskId: string }>) => {
      s.typingUsers = s.typingUsers.filter(t =>
        !(t.userId === a.payload.userId && t.taskId === a.payload.taskId)
      );
    },

    // Drag indicators
    userStartedDragging: (s, a: PayloadAction<DraggingUser>) => {
      const exists = s.draggingUsers.some(d => d.userId === a.payload.userId);
      if (!exists) s.draggingUsers.push(a.payload);
    },
    userStoppedDragging: (s, a: PayloadAction<{ userId: string }>) => {
      s.draggingUsers = s.draggingUsers.filter(d => d.userId !== a.payload.userId);
    },

    // Live notifications
    addLiveNotification: (s, a: PayloadAction<LiveNotification>) => {
      s.notifications.unshift({ ...a.payload, isRead: false });
      s.unreadCount += 1;
      // Keep max 50
      if (s.notifications.length > 50) s.notifications.pop();
    },
    markNotificationRead: (s, a: PayloadAction<string>) => {
      const n = s.notifications.find(n => n.id === a.payload);
      if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
    },
    markAllNotificationsRead: (s) => {
      s.notifications.forEach(n => { n.isRead = true; });
      s.unreadCount = 0;
    },
    clearPresence: () => initialState,
  },
});

export const {
  setConnected, setWorkspaceUsers, userCameOnline, userWentOffline,
  userStatusChanged, setBoardViewers, addBoardViewer, removeBoardViewer,
  userStartedTyping, userStoppedTyping, userStartedDragging, userStoppedDragging,
  addLiveNotification, markNotificationRead, markAllNotificationsRead, clearPresence,
} = presenceSlice.actions;

export const presenceReducer = presenceSlice.reducer;

export const selectIsConnected     = (s: { presence: PresenceState }) => s.presence.connected;
export const selectWorkspaceUsers  = (s: { presence: PresenceState }) => s.presence.workspaceUsers;
export const selectBoardViewers    = (boardId: string) => (s: { presence: PresenceState }) => s.presence.boardViewers[boardId] ?? [];
export const selectTypingInTask    = (taskId: string) => (s: { presence: PresenceState }) => s.presence.typingUsers.filter(t => t.taskId === taskId);
export const selectDraggingUsers   = (s: { presence: PresenceState }) => s.presence.draggingUsers;
export const selectLiveNotifications = (s: { presence: PresenceState }) => s.presence.notifications;
export const selectUnreadCount     = (s: { presence: PresenceState }) => s.presence.unreadCount;
export const selectOnlineCount     = (s: { presence: PresenceState }) => Object.keys(s.presence.workspaceUsers).length;
