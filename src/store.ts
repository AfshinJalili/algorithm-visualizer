import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { currentReducer } from './reducers';
import { directoryReducer } from './reducers';
import { envReducer } from './reducers';
import { playerReducer } from './reducers';
import { toastReducer } from './reducers';

export const store = configureStore({
  reducer: {
    current: currentReducer,
    directory: directoryReducer,
    env: envReducer,
    player: playerReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in serialization check
        ignoredActions: ['current/setAlgorithm', 'current/setScratchPaper'],
        ignoredPaths: ['current.files', 'current.editingFile'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
