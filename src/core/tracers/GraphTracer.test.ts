import { describe, it, expect } from 'vitest';
import GraphTracer from './GraphTracer';

describe('GraphTracer', () => {
  it('should instantiate correctly', () => {
    const tracer = new GraphTracer('test', () => null, 'Test Graph');
    expect(tracer).toBeDefined();
    expect(tracer.nodes).toEqual([]);
    expect(tracer.edges).toEqual([]);
  });

  it('should add nodes', () => {
    const tracer = new GraphTracer('test', () => null, 'Test Graph');
    tracer.addNode(0);
    tracer.addNode(1);
    expect(tracer.nodes.length).toBe(2);
    expect(tracer.findNode(0)).toBeDefined();
  });

  it('should add edges', () => {
    const tracer = new GraphTracer('test', () => null, 'Test Graph');
    tracer.addNode(0);
    tracer.addNode(1);
    tracer.addEdge(0, 1);
    expect(tracer.edges.length).toBe(1);
    expect(tracer.findEdge(0, 1)).toBeDefined();
  });
});
