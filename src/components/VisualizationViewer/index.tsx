import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { setLineIndicator, showErrorToast } from '../../reducers';
import { cn } from "@/lib/utils";
import * as TracerClasses from 'core/tracers';
import * as LayoutClasses from 'core/layouts';

interface VisualizationViewerProps {
  className?: string;
}

interface Command {
  key: string | null;
  method: string;
  args: unknown[];
}

interface Chunk {
  commands: Command[];
}

interface Renderable {
  render: () => React.ReactNode;
  [key: string]: unknown;
}

const VisualizationViewer: React.FC<VisualizationViewerProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { chunks, cursor } = useAppSelector(state => state.player);
  const rootRef = useRef<Renderable | null>(null);
  const objectsRef = useRef<Record<string, Renderable>>({});
  const [, forceUpdate] = useState({});

  const handleError = (error: Error | unknown) => {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: { data?: unknown; statusText: string } }).response;
      const { data, statusText } = response;
      const message = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : statusText;
      console.error(message);
      dispatch(showErrorToast(message));
    } else {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      dispatch(showErrorToast(message));
    }
  };

  const reset = () => {
    rootRef.current = null;
    objectsRef.current = {};
  };

  const applyCommand = (command: Command) => {
    const { key, method, args } = command;
    try {
      if (key === null && method === 'setRoot') {
        const [root] = args;
        rootRef.current = objectsRef.current[root as string];
      } else if (method === 'destroy') {
        delete objectsRef.current[key!];
      } else if (method in LayoutClasses) {
        const [children] = args;
        const LayoutClass = (
          LayoutClasses as Record<string, new (...args: unknown[]) => Renderable>
        )[method];
        objectsRef.current[key!] = new LayoutClass(
          key!,
          (k: string) => objectsRef.current[k],
          children as string[]
        );
      } else if (method in TracerClasses) {
        const className = method;
        const [title = className] = args;
        const TracerClass = (
          TracerClasses as Record<string, new (...args: unknown[]) => Renderable>
        )[className];
        objectsRef.current[key!] = new TracerClass(
          key!,
          (k: string) => objectsRef.current[k],
          title as string
        );
      } else {
        const obj = objectsRef.current[key!];
        if (obj && typeof obj[method] === 'function') {
          (obj[method] as (...args: unknown[]) => unknown)(...args);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const applyChunk = (chunk: Chunk) => {
    chunk.commands.forEach((command: Command) => applyCommand(command));
  };

  const update = (
    chunks: Chunk[],
    cursor: number,
    oldChunks: Chunk[] = [],
    oldCursor: number = 0
  ) => {
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
    <div className={cn("flex-1 flex items-stretch justify-stretch overflow-auto bg-background p-4", className)}>
      {rootRef.current && rootRef.current.render()}
    </div>
  );
};

export default VisualizationViewer;
