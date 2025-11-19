import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { EnvState, User } from '../types';

const initialState: EnvState = {
  ext: Cookies.get('ext') || 'js',
  user: undefined,
};

const envSlice = createSlice({
  name: 'env',
  initialState,
  reducers: {
    setExt: (state, action: PayloadAction<string>) => {
      state.ext = action.payload;
      Cookies.set('ext', action.payload);
    },
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload;
    },
  },
});

export const { setExt, setUser } = envSlice.actions;
export default envSlice.reducer;
