import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chunk, PlayerState } from '../types';

const initialState: PlayerState = {
  chunks: [],
  cursor: 0,
  lineIndicator: undefined,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setChunks: (state, action: PayloadAction<Chunk[]>) => {
      state.chunks = action.payload;
    },
    setCursor: (state, action: PayloadAction<number>) => {
      state.cursor = action.payload;
    },
    setLineIndicator: (
      state,
      action: PayloadAction<{ lineNumber: number; cursor: number } | null | undefined>
    ) => {
      state.lineIndicator = action.payload;
    },
  },
});

export const { setChunks, setCursor, setLineIndicator } = playerSlice.actions;
export default playerSlice.reducer;
