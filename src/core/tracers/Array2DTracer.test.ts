import { describe, it, expect } from 'vitest';
import Array2DTracer from './Array2DTracer';

describe('Array2DTracer', () => {
  it('should instantiate correctly', () => {
    const tracer = new Array2DTracer('test', () => null, 'Test Tracer');
    expect(tracer).toBeDefined();
  });

  it('should set 2D array data', () => {
    const tracer = new Array2DTracer('test', () => null, 'Test Tracer');
    tracer.set([
      [1, 2],
      [3, 4],
    ]);
    expect(tracer.data.length).toBe(2);
    expect(tracer.data[0].length).toBe(2);
    expect(tracer.data[0][0].value).toBe(1);
  });

  it('should patch values', () => {
    const tracer = new Array2DTracer('test', () => null, 'Test Tracer');
    tracer.set([
      [1, 2],
      [3, 4],
    ]);
    tracer.patch(0, 1, 99);
    expect(tracer.data[0][1].value).toBe(99);
    expect(tracer.data[0][1].patched).toBe(true);
  });
});
