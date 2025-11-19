import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { ToastState, Toast } from '../types';

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showSuccessToast: (state, action: PayloadAction<string>) => {
      const toast: Toast = {
        id: uuidv4(),
        type: 'success',
        message: action.payload,
      };
      state.toasts.push(toast);
    },
    showErrorToast: (state, action: PayloadAction<string>) => {
      const toast: Toast = {
        id: uuidv4(),
        type: 'error',
        message: action.payload,
      };
      state.toasts.push(toast);
    },
    hideToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
  },
});

export const { showSuccessToast, showErrorToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
