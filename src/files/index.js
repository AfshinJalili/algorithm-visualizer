import { createProjectFile, createUserFile } from 'common/util';

// Vite import.meta.glob for raw file imports
const fileModules = import.meta.glob('./**/*.{md,cpp,java,js}', { 
  as: 'raw',
  eager: true 
});

const getName = filePath => filePath.split('/').pop();
const getContent = filePath => fileModules[`./${filePath}`];
const readProjectFile = filePath => createProjectFile(getName(filePath), getContent(filePath));
const readUserFile = filePath => createUserFile(getName(filePath), getContent(filePath));

export const CODE_CPP = readUserFile('skeletons/code.cpp');
export const CODE_JAVA = readUserFile('skeletons/code.java');
export const CODE_JS = readUserFile('skeletons/code.js');
export const ROOT_README_MD = readProjectFile('algorithm-visualizer/README.md');
export const SCRATCH_PAPER_README_MD = readProjectFile('scratch-paper/README.md');
