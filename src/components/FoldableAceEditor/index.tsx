import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';
import 'ace-builds/src-noconflict/ext-searchbox';
import { useAppSelector } from '../../store';

interface FoldableAceEditorProps {
  [key: string]: any;
}

const FoldableAceEditor = forwardRef<any, FoldableAceEditorProps>((props, ref) => {
  const { shouldBuild, editingFile } = useAppSelector(state => state.current);
  const aceEditorRef = useRef<any>(null);

  const foldTracers = () => {
    if (!aceEditorRef.current?.editor) return;
    const session = aceEditorRef.current.editor.getSession();
    for (let row = 0; row < session.getLength(); row++) {
      if (!/^\s*\/\/.+{\s*$/.test(session.getLine(row))) continue;
      const range = session.getFoldWidgetRange(row);
      if (range) {
        session.addFold('...', range);
        row = range.end.row;
      }
    }
  };

  useImperativeHandle(ref, () => ({
    resize: () => {
      aceEditorRef.current?.editor?.resize();
    },
  }));

  useEffect(() => {
    if (shouldBuild) foldTracers();
  }, [editingFile, shouldBuild]);

  return <AceEditor ref={aceEditorRef} {...props} />;
});

FoldableAceEditor.displayName = 'FoldableAceEditor';

export default FoldableAceEditor;
