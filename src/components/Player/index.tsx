import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  faPlay,
  faChevronLeft,
  faChevronRight,
  faPause,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { extension } from 'common/util';
import { TracerApi } from 'apis';
import { useAppSelector, useAppDispatch } from '../../store';
import { setChunks, setCursor, setLineIndicator, showErrorToast } from '../../reducers';
import { Button } from "components/ui/button";
import { Slider } from "components/ui/slider";
import { cn } from "@/lib/utils";
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
        const { key, method, args } = command as any;
        if (key === null && method === 'delay') {
          const [lineNumber] = args;
          newChunks[newChunks.length - 1].lineNumber = lineNumber;
          newChunks.push({
            commands: [],
            lineNumber: undefined,
          });
        } else {
          (newChunks[newChunks.length - 1].commands as any[]).push(command);
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
            reset(commands as any[]);
            dispatch(setCursor(1));
          })
          .catch((error: unknown) => {
            if (axios.isCancel(error)) return;
            tracerApiSourceRef.current = null;
            setBuilding(false);
            handleError(error as Error);
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

  const play = useCallback((): void => {
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
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        variant="default"
        size="sm"
        className="h-7 px-2 gap-1 text-xs"
        disabled={building}
        onClick={() => build(editingFile)}
        icon={faWrench}
      >
        {building ? 'Building' : 'Build'}
      </Button>
      
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={!isValidCursor(cursor - 1)} onClick={prev}>
          <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
        </Button>
        
        {playing ? (
          <Button variant="default" size="sm" className="h-7 w-7 p-0" onClick={pause}>
            <FontAwesomeIcon icon={faPause} className="h-3 w-3" />
          </Button>
        ) : (
          <Button variant="default" size="sm" className="h-7 w-7 p-0" onClick={play}>
            <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
          </Button>
        )}

        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={!isValidCursor(cursor + 1)} onClick={next}>
          <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 min-w-[180px]">
        <Slider
          defaultValue={[0]}
          max={chunks.length || 1}
          step={1}
          value={[cursor]}
          onValueChange={(vals) => handleChangeProgress(vals[0] / (chunks.length || 1))}
          className="w-32"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">{cursor} / {chunks.length}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 min-w-[140px]">
        <span className="text-xs text-muted-foreground">Speed</span>
        <Slider
          min={0}
          max={4}
          step={0.5}
          value={[speed]}
          onValueChange={(vals) => setSpeed(vals[0])}
          className="w-24"
        />
      </div>
    </div>
  );
};

export default Player;
