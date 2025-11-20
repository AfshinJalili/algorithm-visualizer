import { describe, it, expect } from 'vitest';
import LogTracer from './LogTracer';

describe('LogTracer', () => {
  it('should instantiate correctly', () => {
    const tracer = new LogTracer('test', () => null, 'Test Log');
    expect(tracer).toBeDefined();
  });

  it('should set log content', () => {
    const tracer = new LogTracer('test', () => null, 'Test Log');
    tracer.set('Initial log');
    expect(tracer.log).toBe('Initial log');
  });

  it('should print messages', () => {
    const tracer = new LogTracer('test', () => null, 'Test Log');
    tracer.set('');
    tracer.print('Hello');
    tracer.print(' World');
    expect(tracer.log).toBe('Hello World');
  });

  it('should println messages', () => {
    const tracer = new LogTracer('test', () => null, 'Test Log');
    tracer.set('');
    tracer.println('Line 1');
    tracer.println('Line 2');
    expect(tracer.log).toBe('Line 1\nLine 2\n');
  });
});

