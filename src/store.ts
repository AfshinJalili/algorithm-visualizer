import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import currentReducer from './reducers/currentSlice';
import directoryReducer from './reducers/directorySlice';
import envReducer from './reducers/envSlice';
import playerReducer from './reducers/playerSlice';
import toastReducer from './reducers/toastSlice';

export const store = configureStore({
  reducer: {
    current: currentReducer,
    directory: directoryReducer,
    env: envReducer,
    player: playerReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
