import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import Promise from 'bluebird';
import { Helmet } from 'react-helmet';
import queryString from 'query-string';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import CodeEditor from 'components/CodeEditor';
import ErrorBoundary from 'components/ErrorBoundary';
import Header from 'components/Header';
import Navigator from 'components/Navigator';
import ResizableContainer from 'components/ResizableContainer';
import TabContainer from 'components/TabContainer';
import ToastContainer from 'components/ToastContainer';
import VisualizationViewer from 'components/VisualizationViewer';
import { AlgorithmApi, GitHubApi, VisualizationApi } from 'apis';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  setHome,
  setAlgorithm,
  setScratchPaper,
  setEditingFile,
  setCategories,
  setScratchPapers,
  setUser,
  showErrorToast,
} from '../../reducers';
import { createUserFile, extension, refineGist } from 'common/util';
import { exts, languages } from 'common/config';
import { SCRATCH_PAPER_README_MD } from 'files';

declare global {
  interface Window {
    signIn?: (token: string) => void;
    signOut?: () => void;
    __PRELOADED_ALGORITHM__?: unknown;
  }
}

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ categoryKey?: string; algorithmKey?: string; gistId?: string }>();

  const [fileInfo, setFileInfo] = useState<React.ReactNode>(null);
  const [fileActions, setFileActions] = useState<React.ReactNode>(null);

  const {
    titles,
    description,
    saved,
    files,
    ext: currentExt,
  } = useAppSelector(state => ({
    ...state.current,
    ext: state.env.ext,
  }));

  const [workspaceVisibles, setWorkspaceVisibles] = useState([true, true, true]);
  const [workspaceWeights, setWorkspaceWeights] = useState([1, 2, 2]);

  const codeEditorRef = useRef<any>(null);
  const unblockRef = useRef<any>(null);

  const handleError = useCallback(
    (error: Error) => {
      if ((error as any).response) {
        const { data, statusText } = (error as any).response;
        const message = data
          ? typeof data === 'string'
            ? data
            : JSON.stringify(data)
          : statusText;
        console.error(message);
        dispatch(showErrorToast(message));
      } else {
        console.error(error.message);
        dispatch(showErrorToast(error.message));
      }
    },
    [dispatch]
  );

  const toggleHistoryBlock = useCallback(
    (enable: boolean) => {
      if (enable) {
        const warningMessage = 'Are you sure you want to discard changes?';
        window.onbeforeunload = () => {
          if (!saved) return warningMessage;
        };
        unblockRef.current = (
          navigate as {
            block?: (callback: (nextLocation: { pathname: string }) => void | false) => () => void;
          }
        ).block?.((nextLocation: { pathname: string }) => {
          if (nextLocation.pathname === location.pathname) return;
          if (!saved) return false as never;
        });
      } else {
        window.onbeforeunload = undefined;
        if (unblockRef.current) {
          unblockRef.current();
          unblockRef.current = undefined;
        }
      }
    },
    [saved, location.pathname]
  );

  const ignoreHistoryBlock = useCallback(
    (process: () => void) => {
      toggleHistoryBlock(false);
      process();
      toggleHistoryBlock(true);
    },
    [toggleHistoryBlock]
  );

  const loadScratchPapers = useCallback(() => {
    const per_page = 100;
    const paginateGists = (page = 1, scratchPapers: unknown[] = []): Promise<unknown[]> =>
      GitHubApi.listGists({
        per_page,
        page,
        timestamp: Date.now(),
      }).then(
        (gists: Array<{ id: string; description: string; files: Record<string, unknown> }>) => {
          scratchPapers.push(
            ...gists
              .filter(
                (gist: { files: Record<string, unknown> }) => 'algorithm-visualizer' in gist.files
              )
              .map((gist: { id: string; description: string; files: Record<string, unknown> }) => ({
                key: gist.id,
                name: gist.description,
                files: Object.keys(gist.files),
              }))
          );
          if (gists.length < per_page) {
            return scratchPapers;
          } else {
            return paginateGists(page + 1, scratchPapers);
          }
        }
      );
    return paginateGists()
      .then((scratchPapers: unknown[]) => dispatch(setScratchPapers(scratchPapers as never)))
      .catch(handleError);
  }, [dispatch, handleError]);

  const signIn = useCallback(
    (accessToken: string) => {
      Cookies.set('access_token', accessToken);
      GitHubApi.auth(accessToken)
        .then(() => GitHubApi.getUser())
        .then((user: { login: string; avatar_url: string }) => {
          const { login, avatar_url } = user;
          dispatch(setUser({ login, avatar_url }));
        })
        .then(() => loadScratchPapers())
        .catch(() => signOut());
    },
    [dispatch, loadScratchPapers]
  );

  const signOut = useCallback(() => {
    Cookies.remove('access_token');
    GitHubApi.auth(undefined)
      .then(() => {
        dispatch(setUser(undefined));
      })
      .then(() => dispatch(setScratchPapers([])));
  }, [dispatch]);

  const selectDefaultTab = useCallback(() => {
    const editingFile =
      files.find(file => extension(file.name) === 'json') ||
      files.find(file => extension(file.name) === currentExt) ||
      files.find(file => exts.includes(extension(file.name) || '')) ||
      files[files.length - 1];
    dispatch(setEditingFile(editingFile));
  }, [files, currentExt, dispatch]);

  const loadAlgorithm = useCallback(
    (
      params: { categoryKey?: string; algorithmKey?: string; gistId?: string },
      query: { visualizationId?: string }
    ) => {
      const { categoryKey, algorithmKey, gistId } = params;
      const { visualizationId } = query;
      const fetch = () => {
        if (window.__PRELOADED_ALGORITHM__) {
          dispatch(setAlgorithm(window.__PRELOADED_ALGORITHM__));
          delete window.__PRELOADED_ALGORITHM__;
        } else if (window.__PRELOADED_ALGORITHM__ === null) {
          delete window.__PRELOADED_ALGORITHM__;
          return Promise.reject(new Error('Algorithm Not Found'));
        } else if (categoryKey && algorithmKey) {
          return AlgorithmApi.getAlgorithm(categoryKey, algorithmKey).then(
            ({ algorithm }: { algorithm: unknown }) => dispatch(setAlgorithm(algorithm as never))
          );
        } else if (gistId === 'new' && visualizationId) {
          return VisualizationApi.getVisualization(visualizationId).then((content: string) => {
            dispatch(
              setScratchPaper({
                login: '',
                gistId,
                title: 'Untitled',
                files: [
                  SCRATCH_PAPER_README_MD,
                  createUserFile('visualization.json', JSON.stringify(content)),
                ],
              })
            );
          });
        } else if (gistId === 'new') {
          const language = languages.find(language => language.ext === currentExt);
          if (language) {
            dispatch(
              setScratchPaper({
                login: '',
                gistId,
                title: 'Untitled',
                files: [SCRATCH_PAPER_README_MD, language.skeleton],
              })
            );
          }
        } else if (gistId) {
          return GitHubApi.getGist(gistId, { timestamp: Date.now() })
            .then(refineGist)
            .then((sp: unknown) => dispatch(setScratchPaper(sp as never)));
        } else {
          dispatch(setHome());
        }
        return Promise.resolve();
      };
      fetch()
        .then(() => {
          selectDefaultTab();
          return null;
        })
        .catch((error: Error) => {
          handleError(error);
          navigate('/');
        });
    },
    [dispatch, currentExt, selectDefaultTab, handleError, navigate]
  );

  const handleChangeWorkspaceWeights = (weights: number[]) => {
    setWorkspaceWeights(weights);
    codeEditorRef.current?.handleResize();
  };

  const toggleNavigatorOpened = (navigatorOpened?: boolean) => {
    const newVisibles = [...workspaceVisibles];
    newVisibles[0] = navigatorOpened ?? !workspaceVisibles[0];
    setWorkspaceVisibles(newVisibles);
  };

  const handleClickTitleBar = () => {
    toggleNavigatorOpened();
  };

  useEffect(() => {
    window.signIn = signIn;
    window.signOut = signOut;

    loadAlgorithm(params, queryString.parse(location.search));

    const accessToken = Cookies.get('access_token');
    if (accessToken) signIn(accessToken);

    AlgorithmApi.getCategories()
      .then(({ categories }: { categories: unknown }) =>
        dispatch(setCategories(categories as never))
      )
      .catch(handleError);

    toggleHistoryBlock(true);

    return () => {
      delete window.signIn;
      delete window.signOut;
      toggleHistoryBlock(false);
    };
  }, []);

  useEffect(() => {
    loadAlgorithm(params, queryString.parse(location.search));
  }, [params.categoryKey, params.algorithmKey, params.gistId, location.search]);

  const title = `${saved ? '' : '(Unsaved) '}${titles.join(' - ')}`;
  const [navigatorOpened] = workspaceVisibles;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Header
        className="flex-shrink-0"
        onClickTitleBar={handleClickTitleBar}
        navigatorOpened={navigatorOpened}
        loadScratchPapers={loadScratchPapers}
        ignoreHistoryBlock={ignoreHistoryBlock}
      />
      <ResizableContainer
        className="flex-1 min-h-0"
        horizontal
        weights={workspaceWeights}
        visibles={workspaceVisibles}
        onChangeWeights={handleChangeWorkspaceWeights}
      >
        <ErrorBoundary level="component">
          <Navigator />
        </ErrorBoundary>
        <ErrorBoundary
          level="feature"
          resetKeys={[params.algorithmKey, params.gistId]}
          onError={error => dispatch(showErrorToast(error.message))}
        >
          <VisualizationViewer className="flex-1 flex flex-col min-h-0 min-w-0" />
        </ErrorBoundary>
        <ErrorBoundary level="component">
          <TabContainer
            className="flex-1 flex flex-col min-h-0 min-w-0"
            fileInfo={fileInfo}
            actions={fileActions}
          >
            <CodeEditor
              ref={codeEditorRef}
              onFileInfoRender={setFileInfo}
              onActionsRender={setFileActions}
            />
          </TabContainer>
        </ErrorBoundary>
      </ResizableContainer>
      <ToastContainer className="fixed bottom-4 right-4 z-50" />
    </div>
  );
};

export default App;
