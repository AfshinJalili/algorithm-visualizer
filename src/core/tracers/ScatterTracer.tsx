import Array2DTracer from './Array2DTracer';
import { ScatterRenderer } from 'core/renderers';

class ScatterTracer extends Array2DTracer {
  getRendererClass() {
    return ScatterRenderer;
  }
}

export default ScatterTracer;

