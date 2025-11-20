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
  faShareAlt, // Using a generic share icon instead of Facebook specific if preferred, or keep faFacebook
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { GitHubApi } from 'apis';
import { refineGist } from 'common/util';
import { languages } from 'common/config';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  modifyTitle,
  setScratchPaper,
  setEditingFile,
  setExt,
  showErrorToast,
} from '../../reducers';
import { Button } from 'components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Input } from "components/ui/input";
import Ellipsis from 'components/Ellipsis';
import Player from 'components/Player';
import { cn } from "@/lib/utils";

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
    // ... (Gist logic remains identical)
    interface GistFile {
      content?: string;
    }
    interface Gist {
      description: string;
      files: Record<string, GistFile | null>;
    }
    interface GistResponse {
      id: string;
      [key: string]: unknown;
    }
    interface ScratchPaper {
      gistId: string;
      files: { name: string; [key: string]: unknown }[];
      [key: string]: unknown;
    }

    const gist: Gist = {
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
    const save = (g: Gist): Promise<GistResponse> => {
      if (!user) return Promise.reject(new Error('Sign In Required'));
      if (scratchPaper && scratchPaper.login) {
        if (scratchPaper.login === user.login) {
          return GitHubApi.editGist(scratchPaper.gistId, g) as Promise<GistResponse>;
        } else {
          return GitHubApi.forkGist(scratchPaper.gistId).then((forkedGist: GistResponse) =>
            GitHubApi.editGist(forkedGist.id, g)
          ) as Promise<GistResponse>;
        }
      }
      return GitHubApi.createGist(g) as Promise<GistResponse>;
    };
    save(gist)
      .then(refineGist)
      .then((newScratchPaper: ScratchPaper) => {
        dispatch(setScratchPaper(newScratchPaper));
        dispatch(
          setEditingFile(
            newScratchPaper.files.find((file: { name: string }) => file.name === editingFile?.name)
          )
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
    <header className={cn("flex flex-col min-w-0 bg-background text-foreground", className)}>
      <div className="flex justify-between px-3 py-1.5 border-b border-border gap-3 items-center h-10">
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <Button 
            variant="ghost"
            size="sm"
            className="font-semibold text-sm px-2 h-7 hover:bg-accent hover:text-accent-foreground min-w-0"
            onClick={onClickTitleBar}
          >
            <div className="flex items-center overflow-hidden">
              {titles.map((title, i) => (
                <React.Fragment key={i}>
                  {scratchPaper && i === 1 ? (
                    <Input
                      className="h-5 py-0 px-1 mx-1 w-28 text-xs bg-muted border-none focus-visible:ring-1"
                      value={title}
                      onClick={e => e.stopPropagation()}
                      onChange={handleChangeTitle}
                    />
                  ) : (
                    <span className="truncate text-xs">{title}</span>
                  )}
                  {i < titles.length - 1 && (
                    <FontAwesomeIcon
                      className="mx-0.5 text-muted-foreground text-xs"
                      fixedWidth
                      icon={faAngleRight}
                    />
                  )}
                </React.Fragment>
              ))}
              <FontAwesomeIcon
                className="ml-1 text-muted-foreground text-xs"
                fixedWidth
                icon={navigatorOpened ? faCaretDown : faCaretRight}
              />
            </div>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 text-xs">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-3.5 h-3.5 rounded-sm"
                  />
                  <span className="font-medium">{user.login}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <a href="/api/auth/destroy" rel="opener">Sign Out</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" className="h-7 px-2 gap-1 text-xs" href="/api/auth/request">
              <FontAwesomeIcon icon={faGithub} className="h-3 w-3" />
              <span>Sign In</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 text-xs">
                <FontAwesomeIcon icon={faStar} className="text-yellow-500 h-3 w-3" />
                <span className="font-medium">{languages.find(language => language.ext === ext)?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {languages.map(language =>
                language.ext === ext ? null : (
                  <DropdownMenuItem 
                    key={language.ext}
                    onClick={() => dispatch(setExt(language.ext))}
                  >
                    {language.name}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Player className="flex-1 max-w-xl" />

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={permitted && saved}
            onClick={saveGist}
            title={permitted ? 'Save' : 'Fork'}
          >
            <FontAwesomeIcon icon={permitted ? faSave : faCodeBranch} className="h-3.5 w-3.5" />
          </Button>
          {permitted && (
            <Button 
              variant="destructive"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={deleteGist}
              confirmNeeded
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrashAlt} className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleClickFullScreen}
            title="Toggle Fullscreen"
          >
            <FontAwesomeIcon icon={faExpandArrowsAlt} className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
