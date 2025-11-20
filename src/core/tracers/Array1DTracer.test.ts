import { describe, it, expect } from 'vitest';
import Array1DTracer from './Array1DTracer';

describe('Array1DTracer', () => {
  it('should instantiate correctly', () => {
    const tracer = new Array1DTracer('test', () => null, 'Test Tracer');
    expect(tracer).toBeDefined();
    expect(tracer.key).toBe('test');
    expect(tracer.title).toBe('Test Tracer');
  });

  it('should set array data', () => {
    const tracer = new Array1DTracer('test', () => null, 'Test Tracer');
    tracer.set([1, 2, 3]);
    expect(tracer.data).toBeDefined();
    expect(tracer.data.length).toBe(1);
    expect(tracer.data[0].length).toBe(3);
  });

  it('should patch values', () => {
    const tracer = new Array1DTracer('test', () => null, 'Test Tracer');
    tracer.set([1, 2, 3]);
    tracer.patch(1, 99);
    expect(tracer.data[0][1].value).toBe(99);
    expect(tracer.data[0][1].patched).toBe(true);
  });

  it('should select elements', () => {
    const tracer = new Array1DTracer('test', () => null, 'Test Tracer');
    tracer.set([1, 2, 3]);
    tracer.select(0, 2);
    expect(tracer.data[0][0].selected).toBe(true);
    expect(tracer.data[0][1].selected).toBe(true);
    expect(tracer.data[0][2].selected).toBe(true);
  });
});

