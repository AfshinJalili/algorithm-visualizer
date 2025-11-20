import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faUser, faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
import { extension } from 'common/util';
import { languages } from 'common/config';
import { useAppSelector, useAppDispatch } from '../../store';
import { modifyFile, deleteFile } from '../../reducers';
import { Button } from 'components/ui/button';
import Ellipsis from 'components/Ellipsis';
import FoldableAceEditor from 'components/FoldableAceEditor';
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  className?: string;
  onFileInfoRender?: (info: React.ReactNode) => void;
  onActionsRender?: (actions: React.ReactNode) => void;
}

const CodeEditor = forwardRef<any, CodeEditorProps>(({ className, onFileInfoRender, onActionsRender }, ref) => {
  const dispatch = useAppDispatch();
  const { editingFile, files } = useAppSelector(state => state.current);
  const { user } = useAppSelector(state => state.env);
  const { lineIndicator } = useAppSelector(state => state.player);
  const aceEditorRef = useRef<any>(null);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  useImperativeHandle(ref, () => ({
    handleResize: () => {
      aceEditorRef.current?.resize();
    },
  }));

  const fileExt = editingFile ? extension(editingFile.name) : '';
  const language = languages.find(language => language.ext === fileExt);
  const mode = language
    ? language.mode
    : fileExt === 'md'
      ? 'markdown'
      : fileExt === 'json'
        ? 'json'
        : 'plain_text';

  const lineCount = editingFile ? editingFile.content.split('\n').length : 0;

  const handleCopyCode = () => {
    if (editingFile) {
      navigator.clipboard.writeText(editingFile.content);
    }
  };

  const handleDownloadCode = () => {
    if (editingFile) {
      const blob = new Blob([editingFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = editingFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteFile = () => {
    if (!editingFile) return;
    if (confirmingDelete) {
      dispatch(deleteFile(editingFile));
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmingDelete(false), 3000);
    }
  };

  // Render file info and actions to parent TabContainer
  React.useEffect(() => {
    if (onFileInfoRender && editingFile) {
      onFileInfoRender(
        <span>{mode.toUpperCase()} • {lineCount} lines</span>
      );
    }
  }, [mode, lineCount, editingFile]);

  React.useEffect(() => {
    if (onActionsRender && editingFile) {
      onActionsRender(
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={handleCopyCode}
            title="Copy code"
          >
            <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={handleDownloadCode}
            title="Download file"
          >
            <FontAwesomeIcon icon={faDownload} className="h-3 w-3" />
          </Button>
        </>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingFile]);

  if (!editingFile) return null;

  return (
    <div className={cn("flex-1 flex flex-col h-full", className)}>

      <div className="flex-1 relative overflow-hidden">
        <FoldableAceEditor
          width="100%"
          height="100%"
          ref={aceEditorRef}
          mode={mode}
          theme="tomorrow_night_eighties"
          name="code_editor"
          editorProps={{ $blockScrolling: true }}
          onChange={(code: string) => dispatch(modifyFile({ file: editingFile, content: code }))}
          markers={
            lineIndicator
              ? [
                  {
                    startRow: lineIndicator.lineNumber,
                    startCol: 0,
                    endRow: lineIndicator.lineNumber,
                    endCol: Infinity,
                    className: "ace_active-line",
                    type: 'fullLine' as const,
                    inFront: true,
                  },
                ]
              : []
          }
          value={editingFile.content}
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t border-border">
        {/* Left side - Contributors */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Contributors:</span>
          <div className="flex items-center gap-1">
            {(editingFile.contributors || [user || { login: 'guest', avatar_url: faUser }]).map(
              (contributor: { login: string; avatar_url: string | typeof faUser }) => (
                <a
                  key={contributor.login}
                  href={`https://github.com/${contributor.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={contributor.login}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors text-xs"
                >
                  {typeof contributor.avatar_url === 'string' && (
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline">{contributor.login}</span>
                </a>
              )
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {files.length > 1 && (
            <Button
              variant={confirmingDelete ? "destructive" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs transition-all",
                !confirmingDelete && "text-destructive hover:text-destructive hover:bg-destructive/10"
              )}
              onClick={handleDeleteFile}
              title={confirmingDelete ? "Click again to confirm deletion" : "Delete file"}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="mr-1.5 h-3 w-3" />
              {confirmingDelete ? "Click to Confirm" : "Delete"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
