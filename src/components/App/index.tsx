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
import styles from './App.module.scss';

declare global {
  interface Window {
    signIn?: (token: string) => void;
    signOut?: () => void;
    __PRELOADED_ALGORITHM__?: any;
  }
}

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ categoryKey?: string; algorithmKey?: string; gistId?: string }>();

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
        unblockRef.current = (navigate as any).block?.((nextLocation: any) => {
          if (nextLocation.pathname === location.pathname) return;
          if (!saved) return warningMessage;
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
    const paginateGists = (page = 1, scratchPapers: any[] = []): any =>
      GitHubApi.listGists({
        per_page,
        page,
        timestamp: Date.now(),
      }).then((gists: any) => {
        scratchPapers.push(
          ...gists
            .filter((gist: any) => 'algorithm-visualizer' in gist.files)
            .map((gist: any) => ({
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
      });
    return paginateGists()
      .then((scratchPapers: any) => dispatch(setScratchPapers(scratchPapers)))
      .catch(handleError);
  }, [dispatch, handleError]);

  const signIn = useCallback(
    (accessToken: string) => {
      Cookies.set('access_token', accessToken);
      GitHubApi.auth(accessToken)
        .then(() => GitHubApi.getUser())
        .then((user: any) => {
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
    (params: any, query: any) => {
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
          return AlgorithmApi.getAlgorithm(categoryKey, algorithmKey).then(({ algorithm }: any) =>
            dispatch(setAlgorithm(algorithm))
          );
        } else if (gistId === 'new' && visualizationId) {
          return VisualizationApi.getVisualization(visualizationId).then((content: any) => {
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
            .then((sp: any) => dispatch(setScratchPaper(sp)));
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
      .then(({ categories }: any) => dispatch(setCategories(categories)))
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
    <div className={styles.app}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Header
        className={styles.header}
        onClickTitleBar={handleClickTitleBar}
        navigatorOpened={navigatorOpened}
        loadScratchPapers={loadScratchPapers}
        ignoreHistoryBlock={ignoreHistoryBlock}
      />
      <ResizableContainer
        className={styles.workspace}
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
          <VisualizationViewer className={styles.visualization_viewer} />
        </ErrorBoundary>
        <ErrorBoundary level="component">
          <TabContainer className={styles.editor_tab_container}>
            <CodeEditor ref={codeEditorRef} />
          </TabContainer>
        </ErrorBoundary>
      </ResizableContainer>
      <ToastContainer className={styles.toast_container} />
    </div>
  );
};

export default App;
