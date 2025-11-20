import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import screenfull from 'screenfull';
import Promise from 'bluebird';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faCaretDown,
  faCaretRight,
  faCodeBranch,
  faExpandArrowsAlt,
  faTrashAlt,
  faSave,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { GitHubApi } from 'apis';
import { classes, refineGist } from 'common/util';
import { languages } from 'common/config';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  modifyTitle,
  setScratchPaper,
  setEditingFile,
  setExt,
  showErrorToast,
} from '../../reducers';
import Button from 'components/Button';
import Ellipsis from 'components/Ellipsis';
import ListItem from 'components/ListItem';
import Player from 'components/Player';
import styles from './Header.module.scss';

interface HeaderProps {
  className?: string;
  onClickTitleBar: () => void;
  navigatorOpened: boolean;
  loadScratchPapers: () => void;
  ignoreHistoryBlock: (process: () => void) => void;
}

const Header: React.FC<HeaderProps> = ({
  className,
  onClickTitleBar,
  navigatorOpened,
  loadScratchPapers,
  ignoreHistoryBlock,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { scratchPaper, titles, files, lastFiles, editingFile, saved } = useAppSelector(
    state => state.current
  );
  const { ext, user } = useAppSelector(state => state.env);

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

  const handleClickFullScreen = () => {
    if (screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.exit();
      } else {
        screenfull.request();
      }
    }
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    dispatch(modifyTitle(value));
  };

  const saveGist = () => {
    const gist: any = {
      description: titles[titles.length - 1],
      files: {},
    };
    files.forEach(file => {
      gist.files[file.name] = {
        content: file.content,
      };
    });
    lastFiles.forEach(lastFile => {
      if (!(lastFile.name in gist.files)) {
        gist.files[lastFile.name] = null;
      }
    });
    gist.files['algorithm-visualizer'] = {
      content: 'https://algorithm-visualizer.org/',
    };
    const save = (g: any) => {
      if (!user) return Promise.reject(new Error('Sign In Required'));
      if (scratchPaper && scratchPaper.login) {
        if (scratchPaper.login === user.login) {
          return GitHubApi.editGist(scratchPaper.gistId, g);
        } else {
          return GitHubApi.forkGist(scratchPaper.gistId).then((forkedGist: any) =>
            GitHubApi.editGist(forkedGist.id, g)
          );
        }
      }
      return GitHubApi.createGist(g);
    };
    save(gist)
      .then(refineGist)
      .then((newScratchPaper: any) => {
        dispatch(setScratchPaper(newScratchPaper));
        dispatch(
          setEditingFile(newScratchPaper.files.find((file: any) => file.name === editingFile?.name))
        );
        if (!(scratchPaper && scratchPaper.gistId === newScratchPaper.gistId)) {
          navigate(`/scratch-paper/${newScratchPaper.gistId}`);
        }
      })
      .then(loadScratchPapers)
      .catch(handleError);
  };

  const hasPermission = () => {
    if (!scratchPaper) return false;
    if (scratchPaper.gistId !== 'new') {
      if (!user) return false;
      if (scratchPaper.login !== user.login) return false;
    }
    return true;
  };

  const deleteGist = () => {
    if (!scratchPaper) return;
    const { gistId } = scratchPaper;
    if (gistId === 'new') {
      ignoreHistoryBlock(() => navigate('/'));
    } else {
      GitHubApi.deleteGist(gistId)
        .then(() => {
          ignoreHistoryBlock(() => navigate('/'));
        })
        .then(loadScratchPapers)
        .catch(handleError);
    }
  };

  const permitted = hasPermission();

  return (
    <header className={classes(styles.header, className)}>
      <div className={styles.row}>
        <div className={styles.section}>
          <Button className={styles.title_bar} onClick={onClickTitleBar}>
            {titles.map((title, i) => [
              scratchPaper && i === 1 ? (
                <input
                  className={styles.input_title}
                  key={`title-${i}`}
                  value={title}
                  onClick={e => e.stopPropagation()}
                  onChange={handleChangeTitle}
                />
              ) : (
                <Ellipsis key={`title-${i}`}>{title}</Ellipsis>
              ),
              i < titles.length - 1 && (
                <FontAwesomeIcon
                  className={styles.nav_arrow}
                  fixedWidth
                  icon={faAngleRight}
                  key={`arrow-${i}`}
                />
              ),
            ])}
            <FontAwesomeIcon
              className={styles.nav_caret}
              fixedWidth
              icon={navigatorOpened ? faCaretDown : faCaretRight}
            />
          </Button>
        </div>
        <div className={styles.section}>
          <Button
            icon={permitted ? faSave : faCodeBranch}
            primary
            disabled={permitted && saved}
            onClick={saveGist}
          >
            {permitted ? 'Save' : 'Fork'}
          </Button>
          {permitted && (
            <Button icon={faTrashAlt} primary onClick={deleteGist} confirmNeeded>
              Delete
            </Button>
          )}
          <Button
            icon={faFacebook}
            primary
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
          >
            Share
          </Button>
          <Button icon={faExpandArrowsAlt} primary onClick={handleClickFullScreen}>
            Fullscreen
          </Button>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.section}>
          {user ? (
            <Button className={styles.btn_dropdown} icon={user.avatar_url}>
              {user.login}
              <div className={styles.dropdown}>
                <ListItem label="Sign Out" href="/api/auth/destroy" rel="opener" />
              </div>
            </Button>
          ) : (
            <Button icon={faGithub} primary href="/api/auth/request" rel="opener">
              <Ellipsis>Sign In</Ellipsis>
            </Button>
          )}
          <Button className={styles.btn_dropdown} icon={faStar}>
            {languages.find(language => language.ext === ext)?.name}
            <div className={styles.dropdown}>
              {languages.map(language =>
                language.ext === ext ? null : (
                  <ListItem
                    key={language.ext}
                    onClick={() => dispatch(setExt(language.ext))}
                    label={language.name}
                  />
                )
              )}
            </div>
          </Button>
        </div>
        <Player className={styles.section} />
      </div>
    </header>
  );
};

export default Header;
