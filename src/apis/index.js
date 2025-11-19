import Promise from 'bluebird';
import axios from 'axios';

axios.interceptors.response.use(response => response.data);

const request = (url, process) => {
  const tokens = url.split('/');
  const baseURL = /^https?:\/\//i.test(url) ? '' : '/api';
  return (...args) => {
    const mappedURL = baseURL + tokens.map((token, i) => token.startsWith(':') ? args.shift() : token).join('/');
    return Promise.resolve(process(mappedURL, args));
  };
};

const GET = URL => {
  return request(URL, (mappedURL, args) => {
    const [params, cancelToken] = args;
    return axios.get(mappedURL, { params, cancelToken });
  });
};

const DELETE = URL => {
  return request(URL, (mappedURL, args) => {
    const [params, cancelToken] = args;
    return axios.delete(mappedURL, { params, cancelToken });
  });
};

const POST = URL => {
  return request(URL, (mappedURL, args) => {
    const [body, params, cancelToken] = args;
    return axios.post(mappedURL, body, { params, cancelToken });
  });
};

const PUT = URL => {
  return request(URL, (mappedURL, args) => {
    const [body, params, cancelToken] = args;
    return axios.put(mappedURL, body, { params, cancelToken });
  });
};

const PATCH = URL => {
  return request(URL, (mappedURL, args) => {
    const [body, params, cancelToken] = args;
    return axios.patch(mappedURL, body, { params, cancelToken });
  });
};

const AlgorithmApi = {
  getCategories: GET('/algorithms'),
  getAlgorithm: GET('/algorithms/:categoryKey/:algorithmKey'),
};

const VisualizationApi = {
  getVisualization: GET('/visualizations/:visualizationId'),
};

const GitHubApi = {
  auth: token => Promise.resolve(axios.defaults.headers.common['Authorization'] = token && `token ${token}`),
  getUser: GET('https://api.github.com/user'),
  listGists: GET('https://api.github.com/gists'),
  createGist: POST('https://api.github.com/gists'),
  editGist: PATCH('https://api.github.com/gists/:id'),
  getGist: GET('https://api.github.com/gists/:id'),
  deleteGist: DELETE('https://api.github.com/gists/:id'),
  forkGist: POST('https://api.github.com/gists/:id/forks'),
};

const TracerApi = {
  md: ({ code }) => Promise.resolve([{
    key: 'markdown',
    method: 'MarkdownTracer',
    args: ['Markdown'],
  }, {
    key: 'markdown',
    method: 'set',
    args: [code],
  }, {
    key: null,
    method: 'setRoot',
    args: ['markdown'],
  }]),
  json: ({ code }) => new Promise(resolve => resolve(JSON.parse(code))),
  js: ({ code }, params, cancelToken) => new Promise(async (resolve, reject) => {
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
  }),
  cpp: POST('/tracers/cpp'),
  java: POST('/tracers/java'),
};

export {
  AlgorithmApi,
  VisualizationApi,
  GitHubApi,
  TracerApi,
};
