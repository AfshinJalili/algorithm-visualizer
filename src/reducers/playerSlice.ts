import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerState } from '../types';

const initialState: PlayerState = {
  chunks: [],
  cursor: 0,
  lineIndicator: undefined,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setChunks: (state, action: PayloadAction<any[]>) => {
      state.chunks = action.payload;
    },
    setCursor: (state, action: PayloadAction<number>) => {
      state.cursor = action.payload;
    },
    setLineIndicator: (state, action: PayloadAction<any>) => {
      state.lineIndicator = action.payload;
    },
  },
});

export const { setChunks, setCursor, setLineIndicator } = playerSlice.actions;
export default playerSlice.reducer;
