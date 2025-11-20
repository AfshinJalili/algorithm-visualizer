import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ROOT_README_MD } from 'files';
import { extension, isSaved } from 'common/util';
import { CurrentState, File } from '../types';

const homeTitles = ['Algorithm Visualizer'];
const homeFiles = [ROOT_README_MD];
const homeDescription =
  'Algorithm Visualizer is an interactive online platform that visualizes algorithms from code.';

const initialState: CurrentState = {
  algorithm: {
    categoryKey: 'algorithm-visualizer',
    algorithmKey: 'home',
  },
  scratchPaper: undefined,
  titles: homeTitles,
  files: homeFiles,
  lastTitles: homeTitles,
  lastFiles: homeFiles,
  description: homeDescription,
  editingFile: undefined,
  shouldBuild: true,
  saved: true,
};

const currentSlice = createSlice({
  name: 'current',
  initialState,
  reducers: {
    setHome: () => initialState,
    setAlgorithm: (
      state,
      action: PayloadAction<{
        categoryKey: string;
        categoryName: string;
        algorithmKey: string;
        algorithmName: string;
        files: File[];
        description: string;
      }>
    ) => {
      const { categoryKey, categoryName, algorithmKey, algorithmName, files, description } =
        action.payload;
      state.algorithm = { categoryKey, algorithmKey };
      state.scratchPaper = undefined;
      state.titles = [categoryName, algorithmName];
      state.files = files;
      state.lastTitles = [categoryName, algorithmName];
      state.lastFiles = files;
      state.description = description;
      state.editingFile = undefined;
      state.shouldBuild = true;
      state.saved = true;
    },
    setScratchPaper: (
      state,
      action: PayloadAction<{
        login: string;
        gistId: string;
        title: string;
        files: File[];
      }>
    ) => {
      const { login, gistId, title, files } = action.payload;
      state.algorithm = { categoryKey: '', algorithmKey: '' };
      state.scratchPaper = { login, gistId };
      state.titles = ['Scratch Paper', title];
      state.files = files;
      state.lastTitles = ['Scratch Paper', title];
      state.lastFiles = files;
      state.description = homeDescription;
      state.editingFile = undefined;
      state.shouldBuild = true;
      state.saved = true;
    },
    setEditingFile: (state, action: PayloadAction<File | undefined>) => {
      state.editingFile = action.payload;
      state.shouldBuild = true;
    },
    modifyTitle: (state, action: PayloadAction<string>) => {
      state.titles = [state.titles[0], action.payload];
      state.saved = isSaved(state);
    },
    addFile: (state, action: PayloadAction<File>) => {
      state.files.push(action.payload);
      state.editingFile = action.payload;
      state.shouldBuild = true;
      state.saved = isSaved(state);
    },
    renameFile: (state, action: PayloadAction<{ file: File; name: string }>) => {
      const { file, name } = action.payload;
      const index = state.files.indexOf(file);
      if (index !== -1) {
        const editingFile = { ...file, name };
        state.files[index] = editingFile;
        state.editingFile = editingFile;
        state.shouldBuild = extension(editingFile.name) === 'md';
        state.saved = isSaved(state);
      }
    },
    modifyFile: (state, action: PayloadAction<{ file: File; content: string }>) => {
      const { file, content } = action.payload;
      const index = state.files.indexOf(file);
      if (index !== -1) {
        const editingFile = { ...file, content };
        state.files[index] = editingFile;
        state.editingFile = editingFile;
        state.shouldBuild = extension(editingFile.name) === 'md';
        state.saved = isSaved(state);
      }
    },
    deleteFile: (state, action: PayloadAction<File>) => {
      const file = action.payload;
      const index = state.files.indexOf(file);
      state.files = state.files.filter(f => f !== file);
      state.editingFile = state.files[Math.min(index, state.files.length - 1)];
      state.shouldBuild = true;
      state.saved = isSaved(state);
    },
  },
});

export const {
  setHome,
  setAlgorithm,
  setScratchPaper,
  setEditingFile,
  modifyTitle,
  addFile,
  renameFile,
  modifyFile,
  deleteFile,
} = currentSlice.actions;

export default currentSlice.reducer;
