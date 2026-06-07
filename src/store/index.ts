import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

import { authReducer }     from './authSlice';
import { uiReducer }       from './uiSlice';
import { workspaceReducer } from './workspaceSlice';
import { teamReducer }     from './teamSlice';
import { projectReducer }  from './projectSlice';
import { clientReducer }   from './clientSlice';
import { boardReducer, taskReducer } from './boardSlice';
import { presenceReducer } from './presenceSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    ui:         uiReducer,
    workspaces: workspaceReducer,
    teams:      teamReducer,
    projects:   projectReducer,
    clients:    clientReducer,
    boards:     boardReducer,
    tasks:      taskReducer,
    presence:   presenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST','persist/REHYDRATE'] } }),
  devTools: import.meta.env.DEV,
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
