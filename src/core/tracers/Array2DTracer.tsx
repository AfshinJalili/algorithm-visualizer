import Tracer from './Tracer';
import { Array2DRenderer } from 'core/renderers';

class Element {
  value: any;
  patched: boolean;
  selected: boolean;

  constructor(value: any) {
    this.value = value;
    this.patched = false;
    this.selected = false;
  }
}

class Array2DTracer extends Tracer {
  data: Element[][];

  getRendererClass() {
    return Array2DRenderer;
  }

  set(array2d: any[][] = []) {
    this.data = array2d.map(array1d => [...array1d].map(value => new Element(value)));
    super.set();
  }

  patch(x: number, y: number, v: any = this.data[x][y].value) {
    if (!this.data[x][y]) this.data[x][y] = new Element(v);
    this.data[x][y].value = v;
    this.data[x][y].patched = true;
  }

  depatch(x: number, y: number) {
    this.data[x][y].patched = false;
  }

  select(sx: number, sy: number, ex: number = sx, ey: number = sy) {
    for (let x = sx; x <= ex; x++) {
      for (let y = sy; y <= ey; y++) {
        this.data[x][y].selected = true;
      }
    }
  }

  selectRow(x: number, sy: number, ey: number) {
    this.select(x, sy, x, ey);
  }

  selectCol(y: number, sx: number, ex: number) {
    this.select(sx, y, ex, y);
  }

  deselect(sx: number, sy: number, ex: number = sx, ey: number = sy) {
    for (let x = sx; x <= ex; x++) {
      for (let y = sy; y <= ey; y++) {
        this.data[x][y].selected = false;
      }
    }
  }

  deselectRow(x: number, sy: number, ey: number) {
    this.deselect(x, sy, x, ey);
  }

  deselectCol(y: number, sx: number, ex: number) {
    this.deselect(sx, y, ex, y);
  }
}

export default Array2DTracer;
