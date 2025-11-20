import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  faPlay,
  faChevronLeft,
  faChevronRight,
  faPause,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { classes, extension } from 'common/util';
import { TracerApi } from 'apis';
import { useAppSelector, useAppDispatch } from '../../store';
import { setChunks, setCursor, setLineIndicator, showErrorToast } from '../../reducers';
import Button from 'components/Button';
import ProgressBar from 'components/ProgressBar';
import styles from './Player.module.scss';
import { File } from '../../types';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { editingFile, shouldBuild, algorithm, scratchPaper } = useAppSelector(
    state => state.current
  );
  const { chunks, cursor } = useAppSelector(state => state.player);

  const [speed, setSpeed] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [building, setBuilding] = useState(false);

  const timerRef = useRef<number | undefined>();
  const tracerApiSourceRef = useRef<any>(null);
  const playingRef = useRef(false);
  const algorithmKeyRef = useRef<string>('');
  const gistIdRef = useRef<string>('');

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

  const reset = useCallback(
    (commands: unknown[] = []) => {
      const newChunks = [
        {
          commands: [],
          lineNumber: undefined,
        },
      ];
      const commandsCopy = [...commands];
      while (commandsCopy.length) {
        const command = commandsCopy.shift()!;
        const { key, method, args } = command;
        if (key === null && method === 'delay') {
          const [lineNumber] = args;
          newChunks[newChunks.length - 1].lineNumber = lineNumber;
          newChunks.push({
            commands: [],
            lineNumber: undefined,
          });
        } else {
          newChunks[newChunks.length - 1].commands.push(command);
        }
      }
      dispatch(setChunks(newChunks));
      dispatch(setCursor(0));
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
        setPlaying(false);
      }
      dispatch(setLineIndicator(undefined));
    },
    [dispatch]
  );

  const build = useCallback(
    (file: File | undefined) => {
      reset();
      if (!file) return;

      if (tracerApiSourceRef.current) tracerApiSourceRef.current.cancel();
      tracerApiSourceRef.current = axios.CancelToken.source();
      setBuilding(true);

      const ext = extension(file.name);
      if (ext && ext in TracerApi) {
        (TracerApi as any)
          [ext]({ code: file.content }, undefined, tracerApiSourceRef.current.token)
          .then((commands: unknown) => {
            tracerApiSourceRef.current = null;
            setBuilding(false);
            reset(commands);
            dispatch(setCursor(1));
          })
          .catch((error: unknown) => {
            if (axios.isCancel(error)) return;
            tracerApiSourceRef.current = null;
            setBuilding(false);
            handleError(error);
          });
      } else {
        setBuilding(false);
        handleError(new Error('Language Not Supported'));
      }
    },
    [reset, dispatch, handleError]
  );

  const isValidCursor = useCallback(
    (c: number) => {
      return 1 <= c && c <= chunks.length;
    },
    [chunks]
  );

  const pause = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    playingRef.current = false;
    setPlaying(false);
  }, []);

  const prev = useCallback(() => {
    pause();
    const newCursor = cursor - 1;
    if (!isValidCursor(newCursor)) return false;
    dispatch(setCursor(newCursor));
    return true;
  }, [cursor, isValidCursor, pause, dispatch]);

  const next = useCallback(() => {
    pause();
    const newCursor = cursor + 1;
    if (!isValidCursor(newCursor)) return false;
    dispatch(setCursor(newCursor));
    return true;
  }, [cursor, isValidCursor, pause, dispatch]);

  const play = useCallback(() => {
    if (cursor >= chunks.length) {
      dispatch(setCursor(1));
    }
    playingRef.current = true;
    setPlaying(true);
  }, [cursor, chunks.length, dispatch]);

  useEffect(() => {
    if (!playing) return;

    const interval = 4000 / Math.pow(Math.E, speed);
    timerRef.current = window.setTimeout(() => {
      const nextCursor = cursor + 1;
      if (isValidCursor(nextCursor)) {
        dispatch(setCursor(nextCursor));
      } else {
        pause();
      }
    }, interval);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [playing, cursor, chunks.length, speed, dispatch, isValidCursor, pause]);

  const handleChangeProgress = (progress: number) => {
    const newCursor = Math.max(1, Math.min(chunks.length, Math.round(progress * chunks.length)));
    pause();
    dispatch(setCursor(newCursor));
  };

  useEffect(() => {
    const currentAlgorithmKey = algorithm?.algorithmKey || '';
    const currentGistId = scratchPaper?.gistId || '';

    if (algorithmKeyRef.current !== currentAlgorithmKey || gistIdRef.current !== currentGistId) {
      pause();
      reset();
      algorithmKeyRef.current = currentAlgorithmKey;
      gistIdRef.current = currentGistId;
    }

    if (shouldBuild) build(editingFile);
  }, [editingFile?.name, algorithm?.algorithmKey, scratchPaper?.gistId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={classes(styles.player, className)}>
      <Button
        icon={faWrench}
        primary
        disabled={building}
        inProgress={building}
        onClick={() => build(editingFile)}
      >
        {building ? 'Building' : 'Build'}
      </Button>
      {playing ? (
        <Button icon={faPause} primary active onClick={pause}>
          Pause
        </Button>
      ) : (
        <Button icon={faPlay} primary onClick={play}>
          Play
        </Button>
      )}
      <Button icon={faChevronLeft} primary disabled={!isValidCursor(cursor - 1)} onClick={prev} />
      <ProgressBar
        className={styles.progress_bar}
        current={cursor}
        total={chunks.length}
        onChangeProgress={handleChangeProgress}
      />
      <Button
        icon={faChevronRight}
        reverse
        primary
        disabled={!isValidCursor(cursor + 1)}
        onClick={next}
      />
      <div className={styles.speed}>
        Speed
        <input
          className={styles.range}
          type="range"
          min={0}
          max={4}
          step={0.5}
          value={speed}
          onChange={e => setSpeed(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Player;
