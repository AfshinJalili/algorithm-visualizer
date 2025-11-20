import { combineReducers, createStore } from 'redux';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import * as reducers from 'reducers';

export const store = createStore(combineReducers(reducers));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
