import React, { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { languages } from 'common/config';
import { useAppSelector, useAppDispatch } from '../../store';
import { setEditingFile, addFile, renameFile, deleteFile } from '../../reducers';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { cn } from '@/lib/utils';

interface TabContainerProps {
  className?: string;
  children?: ReactNode;
  fileInfo?: ReactNode;
  actions?: ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = ({ className, children, fileInfo, actions }) => {
  const dispatch = useAppDispatch();
  const { editingFile, files } = useAppSelector(state => state.current);
  const { ext } = useAppSelector(state => state.env);
  const [confirmingDelete, setConfirmingDelete] = React.useState<string | null>(null);

  const handleAddFile = () => {
    const language = languages.find(language => language.ext === ext);
    if (!language) return;

    const newFile = { ...language.skeleton };
    let count = 0;
    while (files.some(file => file.name === newFile.name)) {
      newFile.name = `code-${++count}.${ext}`;
    }
    dispatch(addFile(newFile));
  };

  const handleDeleteFile = (file: any) => {
    if (confirmingDelete === file.name) {
      dispatch(deleteFile(file));
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(file.name);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmingDelete(null), 3000);
    }
  };

  // Shadcn Tabs expects a string value for selected tab.
  // We can use the file name or index, but file names might change.
  // Using index as value might be safer if names are editable, but TabsTrigger `value` must be unique.
  // We'll stick to using the file name for now, assuming unique names are enforced or handled by reducer logic.
  // Actually, since we render children directly inside the "content" area rather than mapping TabsContent for each file
  // (because the editor content changes based on Redux state, not the Tab component mounting/unmounting),
  // we might just use the visual part of Tabs (TabsList) and control the content manually below it.

  // However, Shadcn Tabs controls `value` state.
  // If we want fully controlled tabs, we use `value` prop on Tabs root.

  const currentTabValue = editingFile ? editingFile.name : '';

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex flex-wrap items-center justify-between bg-muted/50 border-b border-border h-8">
        <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center">
            {files.map((file, i) => {
              const isSelected = file === editingFile;
              return (
                <div
                  key={i}
                  className={cn(
                    'group relative cursor-pointer border-r border-border min-w-[100px] max-w-[180px] text-xs flex items-center justify-center transition-colors flex-shrink-0',
                    'border-t-4', // Always have 4px top border to prevent shifting
                    isSelected
                      ? 'bg-background font-medium border-t-primary h-8'
                      : 'hover:bg-background/50 text-muted-foreground border-t-transparent h-8'
                  )}
                  onClick={() => dispatch(setEditingFile(file))}
                >
                  <div className="w-full px-2 flex items-center justify-center">
                    {isSelected ? (
                      <Input
                        className="h-5 py-0 px-1 text-center bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-xs"
                        value={file.name}
                        onClick={e => e.stopPropagation()}
                        onChange={e => dispatch(renameFile({ file, name: e.target.value }))}
                      />
                    ) : (
                      <span className="truncate text-center block w-full">{file.name}</span>
                    )}
                  </div>

                  {files.length > 1 && (
                    <button
                      className={cn(
                        'absolute right-1 opacity-0 group-hover:opacity-100 rounded p-0.5 transition-all',
                        isSelected && 'opacity-100',
                        confirmingDelete === file.name
                          ? 'bg-destructive text-destructive-foreground'
                          : 'hover:bg-destructive/20'
                      )}
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteFile(file);
                      }}
                      title={
                        confirmingDelete === file.name ? 'Click again to confirm' : 'Close file'
                      }
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              );
            })}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 min-w-8 rounded-none border-r border-border"
              onClick={handleAddFile}
            >
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {(fileInfo || actions) && (
          <div className="flex items-center gap-2 px-3 border-l border-border flex-shrink-0">
            {fileInfo && (
              <div className="text-xs text-muted-foreground whitespace-nowrap">{fileInfo}</div>
            )}
            {actions && <div className="flex items-center gap-1">{actions}</div>}
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-background">{children}</div>
    </div>
  );
};

export default TabContainer;
