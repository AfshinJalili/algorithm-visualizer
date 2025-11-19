import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { faTrashAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { classes, extension } from 'common/util';
import { languages } from 'common/config';
import { useAppSelector, useAppDispatch } from '../../store';
import { modifyFile, deleteFile } from '../../reducers';
import Button from 'components/Button';
import Ellipsis from 'components/Ellipsis';
import FoldableAceEditor from 'components/FoldableAceEditor';
import styles from './CodeEditor.module.scss';

interface CodeEditorProps {
  className?: string;
}

const CodeEditor = forwardRef<any, CodeEditorProps>(({ className }, ref) => {
  const dispatch = useAppDispatch();
  const { editingFile } = useAppSelector(state => state.current);
  const { user } = useAppSelector(state => state.env);
  const { lineIndicator } = useAppSelector(state => state.player);
  const aceEditorRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    handleResize: () => {
      aceEditorRef.current?.resize();
    },
  }));

  if (!editingFile) return null;

  const fileExt = extension(editingFile.name);
  const language = languages.find(language => language.ext === fileExt);
  const mode = language ? language.mode :
    fileExt === 'md' ? 'markdown' :
      fileExt === 'json' ? 'json' :
        'plain_text';

  return (
    <div className={classes(styles.code_editor, className)}>
      <FoldableAceEditor
        className={styles.ace_editor}
        ref={aceEditorRef}
        mode={mode}
        theme="tomorrow_night_eighties"
        name="code_editor"
        editorProps={{ $blockScrolling: true }}
        onChange={(code: string) => dispatch(modifyFile({ file: editingFile, content: code }))}
        markers={lineIndicator ? [{
          startRow: lineIndicator.lineNumber,
          startCol: 0,
          endRow: lineIndicator.lineNumber,
          endCol: Infinity,
          className: styles.current_line_marker,
          type: 'line',
          inFront: true,
          _key: lineIndicator.cursor,
        }] : []}
        value={editingFile.content}/>
      <div className={classes(styles.contributors_viewer, className)}>
        <span className={classes(styles.contributor, styles.label)}>Contributed by</span>
        {(editingFile.contributors || [user || { login: 'guest', avatar_url: faUser }]).map((contributor: any) => (
          <Button 
            className={styles.contributor} 
            icon={contributor.avatar_url} 
            key={contributor.login}
            href={`https://github.com/${contributor.login}`}
          >
            {contributor.login}
          </Button>
        ))}
        <div className={styles.empty}>
          <div className={styles.empty}/>
          <Button 
            className={styles.delete} 
            icon={faTrashAlt} 
            primary 
            confirmNeeded
            onClick={() => dispatch(deleteFile(editingFile))}
          >
            <Ellipsis>Delete File</Ellipsis>
          </Button>
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
