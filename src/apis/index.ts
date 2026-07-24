import Promise from 'bluebird';
import axios, { CancelToken } from 'axios';

axios.interceptors.response.use(response => response.data);

type RequestArgs =
  | [params?: unknown, cancelToken?: CancelToken]
  | [body?: unknown, params?: unknown, cancelToken?: CancelToken];

const request = <T = unknown>(
  url: string,
  process: (mappedURL: string, args: unknown[]) => PromiseLike<T>
) => {
  const tokens = url.split('/');
  const baseURL = /^https?:\/\//i.test(url) ? '' : '/api';
  return (...args: unknown[]) => {
    const mappedURL =
      baseURL + tokens.map(token => (token.startsWith(':') ? args.shift() : token)).join('/');
    return Promise.resolve(process(mappedURL, args));
  };
};

const GET = <T = unknown>(URL: string) => {
  return request<T>(URL, (mappedURL, args) => {
    const [params, cancelToken] = args as [unknown?, CancelToken?];
    return axios.get(mappedURL, { params, cancelToken }) as unknown as PromiseLike<T>;
  });
};

const DELETE = <T = unknown>(URL: string) => {
  return request<T>(URL, (mappedURL, args) => {
    const [params, cancelToken] = args as [unknown?, CancelToken?];
    return axios.delete(mappedURL, { params, cancelToken }) as unknown as PromiseLike<T>;
  });
};

const POST = <T = unknown>(URL: string) => {
  return request<T>(URL, (mappedURL, args) => {
    const [body, params, cancelToken] = args as [unknown?, unknown?, CancelToken?];
    return axios.post(mappedURL, body, { params, cancelToken }) as unknown as PromiseLike<T>;
  });
};

const PUT = <T = unknown>(URL: string) => {
  return request<T>(URL, (mappedURL, args) => {
    const [body, params, cancelToken] = args as [unknown?, unknown?, CancelToken?];
    return axios.put(mappedURL, body, { params, cancelToken }) as unknown as PromiseLike<T>;
  });
};

const PATCH = <T = unknown>(URL: string) => {
  return request<T>(URL, (mappedURL, args) => {
    const [body, params, cancelToken] = args as [unknown?, unknown?, CancelToken?];
    return axios.patch(mappedURL, body, { params, cancelToken }) as unknown as PromiseLike<T>;
  });
};

export const AlgorithmApi = {
  getCategories: GET<{ categories: unknown }>('/algorithms'),
  getAlgorithm: GET<{ algorithm: import('../types').AlgorithmDetail }>(
    '/algorithms/:categoryKey/:algorithmKey'
  ),
};

export const VisualizationApi = {
  getVisualization: GET<string>('/visualizations/:visualizationId'),
};

export const GitHubApi = {
  auth: (token?: string) =>
    Promise.resolve((axios.defaults.headers.common['Authorization'] = token && `token ${token}`)),
  getUser: GET<{ login: string; avatar_url: string }>('https://api.github.com/user'),
  listGists: GET<Array<{ id: string; description: string; files: Record<string, unknown> }>>(
    'https://api.github.com/gists'
  ),
  createGist: POST<import('common/util').Gist>('https://api.github.com/gists'),
  editGist: PATCH<import('common/util').Gist>('https://api.github.com/gists/:id'),
  getGist: GET<import('common/util').Gist>('https://api.github.com/gists/:id'),
  deleteGist: DELETE('https://api.github.com/gists/:id'),
  forkGist: POST<import('common/util').Gist>('https://api.github.com/gists/:id/forks'),
};

export const TracerApi = {
  md: ({ code }: { code: string }) =>
    Promise.resolve([
      {
        key: 'markdown',
        method: 'MarkdownTracer',
        args: ['Markdown'],
      },
      {
        key: 'markdown',
        method: 'set',
        args: [code],
      },
      {
        key: null,
        method: 'setRoot',
        args: ['markdown'],
      },
    ]),
  json: ({ code }: { code: string }) => new Promise(resolve => resolve(JSON.parse(code))),
  js: ({ code }: { code: string }, params?: Record<string, unknown>, cancelToken?: CancelToken) =>
    new Promise((resolve, reject) => {
      (async () => {
        try {
          const libResponse = await fetch('/api/tracers/js');
          const libText = await libResponse.text();

          const workerCode = `
const process = { env: { ALGORITHM_VISUALIZER: '1' } };
${libText}

const sandbox = code => {
  const require = name => ({ 'algorithm-visualizer': AlgorithmVisualizer }[name]);
  eval(code);
};

onmessage = e => {
  const lines = e.data.split('\\n').map((line, i) => line.replace(/(\\.\\s*delay\\s*)\\(\\s*\\)/g, \`\$1(\${i})\`));
  const code = lines.join('\\n');
  sandbox(code);
  postMessage(AlgorithmVisualizer.Commander.commands);
};
`;

          const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(workerBlob);
          const worker = new Worker(workerUrl);

          if (cancelToken) {
            cancelToken.promise.then(cancel => {
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
              reject(cancel);
            });
          }
          worker.onmessage = e => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve(e.data);
          };
          worker.onerror = error => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            reject(error);
          };
          worker.postMessage(code);
        } catch (error) {
          reject(error);
        }
      })();
    }),
  cpp: POST('/tracers/cpp'),
  java: POST('/tracers/java'),
};
