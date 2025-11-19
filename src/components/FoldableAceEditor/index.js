import { connect } from 'react-redux';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';
import 'ace-builds/src-noconflict/ext-searchbox';
import { actions } from 'reducers';

class FoldableAceEditor extends AceEditor {
  componentDidMount() {
    super.componentDidMount();

    const { shouldBuild } = this.props.current;
    if (shouldBuild) this.foldTracers();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    super.componentDidUpdate(prevProps, prevState, snapshot);

    const { editingFile, shouldBuild } = this.props.current;
    if (editingFile !== prevProps.current.editingFile) {
      if (shouldBuild) this.foldTracers();
    }
  }

  foldTracers() {
    const session = this.editor.getSession();
    for (let row = 0; row < session.getLength(); row++) {
      if (!/^\s*\/\/.+{\s*$/.test(session.getLine(row))) continue;
      const range = session.getFoldWidgetRange(row);
      if (range) {
        session.addFold('...', range);
        row = range.end.row;
      }
    }
  }

  resize() {
    this.editor.resize();
  }
}

export default connect(({ current }) => ({ current }), actions, null, { forwardRef: true })(
  FoldableAceEditor,
);
