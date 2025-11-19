import { CODE_CPP, CODE_JAVA, CODE_JS } from 'files';
import { File } from '../types';

export interface Language {
  name: string;
  ext: string;
  mode: string;
  skeleton: File;
}

export const languages: Language[] = [{
  name: 'JavaScript',
  ext: 'js',
  mode: 'javascript',
  skeleton: CODE_JS,
}, {
  name: 'C++',
  ext: 'cpp',
  mode: 'c_cpp',
  skeleton: CODE_CPP,
}, {
  name: 'Java',
  ext: 'java',
  mode: 'java',
  skeleton: CODE_JAVA,
}];

export const exts = languages.map(language => language.ext);
