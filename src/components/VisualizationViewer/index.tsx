import React, { useEffect, useRef, useState } from 'react';
import { classes } from 'common/util';
import { useAppSelector, useAppDispatch } from '../../store';
import { setLineIndicator, showErrorToast } from '../../reducers';
import styles from './VisualizationViewer.module.scss';
import * as TracerClasses from 'core/tracers';
import * as LayoutClasses from 'core/layouts';

interface VisualizationViewerProps {
  className?: string;
}

const VisualizationViewer: React.FC<VisualizationViewerProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { chunks, cursor } = useAppSelector(state => state.player);
  const rootRef = useRef<any>(null);
  const objectsRef = useRef<Record<string, any>>({});
  const [, forceUpdate] = useState({});

  const handleError = (error: Error) => {
    if ((error as any).response) {
      const { data, statusText } = (error as any).response;
      const message = data ? typeof data === 'string' ? data : JSON.stringify(data) : statusText;
      console.error(message);
      dispatch(showErrorToast(message));
    } else {
      console.error(error.message);
      dispatch(showErrorToast(error.message));
    }
  };

  const reset = () => {
    rootRef.current = null;
    objectsRef.current = {};
  };

  const applyCommand = (command: any) => {
    const { key, method, args } = command;
    try {
      if (key === null && method === 'setRoot') {
        const [root] = args;
        rootRef.current = objectsRef.current[root];
      } else if (method === 'destroy') {
        delete objectsRef.current[key];
      } else if (method in LayoutClasses) {
        const [children] = args;
        const LayoutClass = (LayoutClasses as any)[method];
        objectsRef.current[key] = new LayoutClass(key, (k: string) => objectsRef.current[k], children);
      } else if (method in TracerClasses) {
        const className = method;
        const [title = className] = args;
        const TracerClass = (TracerClasses as any)[className];
        objectsRef.current[key] = new TracerClass(key, (k: string) => objectsRef.current[k], title);
      } else {
        objectsRef.current[key][method](...args);
      }
    } catch (error) {
      handleError(error as Error);
    }
  };

  const applyChunk = (chunk: any) => {
    chunk.commands.forEach((command: any) => applyCommand(command));
  };

  const update = (chunks: any[], cursor: number, oldChunks: any[] = [], oldCursor: number = 0) => {
    let applyingChunks;
    if (cursor > oldCursor) {
      applyingChunks = chunks.slice(oldCursor, cursor);
    } else {
      reset();
      applyingChunks = chunks.slice(0, cursor);
    }
    applyingChunks.forEach(chunk => applyChunk(chunk));

    const lastChunk = applyingChunks[applyingChunks.length - 1];
    if (lastChunk && lastChunk.lineNumber !== undefined) {
      dispatch(setLineIndicator({ lineNumber: lastChunk.lineNumber, cursor }));
    } else {
      dispatch(setLineIndicator(undefined));
    }
    
    forceUpdate({});
  };

  useEffect(() => {
    update(chunks, cursor);
  }, [chunks, cursor]);

  return (
    <div className={classes(styles.visualization_viewer, className)}>
      {rootRef.current && rootRef.current.render()}
    </div>
  );
};

export default VisualizationViewer;
