import Array2DTracer from './Array2DTracer';
import { Array1DRenderer } from 'core/renderers';

class Array1DTracer extends Array2DTracer {
  chartTracer: any;

  getRendererClass() {
    return Array1DRenderer;
  }

  init() {
    super.init();
    this.chartTracer = null;
  }

  set(array1d: any[] = []) {
    const array2d = [array1d];
    super.set(array2d);
    this.syncChartTracer();
  }

  patch(x: number, v: any) {
    super.patch(0, x, v);
  }

  depatch(x: number) {
    super.depatch(0, x);
  }

  select(sx: number, ex: number = sx) {
    super.select(0, sx, 0, ex);
  }

  deselect(sx: number, ex: number = sx) {
    super.deselect(0, sx, 0, ex);
  }

  chart(key: string) {
    this.chartTracer = key ? this.getObject(key) : null;
    this.syncChartTracer();
  }

  syncChartTracer() {
    if (this.chartTracer) this.chartTracer.data = this.data;
  }
}

export default Array1DTracer;
