import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DirectoryState, Category, ScratchPaper } from '../types';

const initialState: DirectoryState = {
  categories: [],
  scratchPapers: [],
};

const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setScratchPapers: (state, action: PayloadAction<ScratchPaper[]>) => {
      state.scratchPapers = action.payload;
    },
  },
});

export const { setCategories, setScratchPapers } = directorySlice.actions;
export default directorySlice.reducer;
