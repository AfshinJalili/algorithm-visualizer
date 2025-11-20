import Tracer from './Tracer';
import { MarkdownRenderer } from 'core/renderers';

class MarkdownTracer extends Tracer {
  markdown: string;

  getRendererClass() {
    return MarkdownRenderer;
  }

  set(markdown: string = '') {
    this.markdown = markdown;
    super.set();
  }
}

export default MarkdownTracer;
