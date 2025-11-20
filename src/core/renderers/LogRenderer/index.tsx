import React from 'react';
import { Renderer } from 'core/renderers';
import styles from './LogRenderer.module.scss';
import type LogTracer from 'core/tracers/LogTracer';

class LogRenderer extends Renderer<LogTracer> {
  elementRef: React.RefObject<HTMLDivElement>;

  constructor(props: { className?: string; title: string; data: LogTracer }) {
    super(props);

    this.elementRef = React.createRef();
  }

  componentDidUpdate(
    prevProps: { className?: string; title: string; data: LogTracer },
    prevState: unknown,
    snapshot: unknown
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    const div = this.elementRef.current!;
    div.scrollTop = div.scrollHeight;
  }

  renderData() {
    const { log } = this.props.data;

    return (
      <div className={styles.log} ref={this.elementRef}>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: log }} />
      </div>
    );
  }
}

export default LogRenderer;
