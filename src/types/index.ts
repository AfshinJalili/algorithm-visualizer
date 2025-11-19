// Base Redux state types
export interface CurrentState {
  algorithm: {
    categoryKey: string;
    algorithmKey: string;
  };
  scratchPaper?: {
    login: string;
    gistId: string;
  };
  titles: string[];
  files: File[];
  lastTitles: string[];
  lastFiles: File[];
  description: string;
  editingFile?: File;
  shouldBuild: boolean;
  saved: boolean;
}

export interface DirectoryState {
  categories: Category[];
  scratchPapers: ScratchPaper[];
}

export interface EnvState {
  user?: User;
  ext: string;
}

export interface PlayerState {
  chunks: any[];
  cursor: number;
  lineIndicator?: any;
}

export interface ToastState {
  toasts: Toast[];
}

// File types
export interface File {
  name: string;
  content: string;
  contributors?: Array<{
    login: string;
    avatar_url: string;
  }>;
}

// Directory types
export interface Category {
  key: string;
  name: string;
  algorithms: Algorithm[];
}

export interface Algorithm {
  key: string;
  name: string;
}

export interface ScratchPaper {
  key: string;
  name: string;
  files: string[];
}

// User types
export interface User {
  login: string;
  avatar_url: string;
}

// Toast types
export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
