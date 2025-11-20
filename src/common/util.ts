import { File } from '../types';

export const classes = (...arr: (string | boolean | undefined | null)[]): string =>
  arr.filter(v => v).join(' ');

export const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const extension = (fileName: string): string | undefined =>
  /(?:\.([^.]+))?$/.exec(fileName)?.[1];

interface Contributor {
  login: string;
  avatar_url: string;
}

interface GistFile {
  filename: string;
  content: string;
}

interface Gist {
  id: string;
  description: string;
  files: { [key: string]: GistFile };
  owner: Contributor;
}

export const refineGist = (gist: Gist) => {
  const gistId = gist.id;
  const title = gist.description;
  delete gist.files['algorithm-visualizer'];
  const { login, avatar_url } = gist.owner;
  const files = Object.values(gist.files).map(file => ({
    name: file.filename,
    content: file.content,
    contributors: [{ login, avatar_url }],
  }));
  return { login, gistId, title, files };
};

export const createFile = (name: string, content: string, contributors?: Contributor[]): File =>
  ({ name, content, contributors }) as File;

export const createProjectFile = (name: string, content: string): File =>
  createFile(name, content, [
    {
      login: 'algorithm-visualizer',
      avatar_url: 'https://github.com/algorithm-visualizer.png',
    },
  ]);

export const createUserFile = (name: string, content: string): File =>
  createFile(name, content, undefined);

export const isSaved = ({
  titles,
  files,
  lastTitles,
  lastFiles,
}: {
  titles: string[];
  files: File[];
  lastTitles: string[];
  lastFiles: File[];
}): boolean => {
  const serialize = (titles: string[], files: File[]) =>
    JSON.stringify({
      titles,
      files: files.map(({ name, content }) => ({ name, content })),
    });
  return serialize(titles, files) === serialize(lastTitles, lastFiles);
};
