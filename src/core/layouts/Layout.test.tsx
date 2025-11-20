import { describe, it, expect } from 'vitest';
import Layout from './Layout';
import HorizontalLayout from './HorizontalLayout';
import VerticalLayout from './VerticalLayout';

describe('Layout', () => {
  it('should instantiate correctly', () => {
    const mockGetObject = (key: string) => ({ key, render: () => null });
    const layout = new Layout('test', mockGetObject, ['child1', 'child2']);
    expect(layout.key).toBe('test');
    expect(layout.children.length).toBe(2);
    expect(layout.weights).toEqual([1, 1]);
  });

  it('should add children', () => {
    const mockGetObject = (key: string) => ({ key, render: () => null });
    const layout = new Layout('test', mockGetObject, []);
    layout.add('child1');
    expect(layout.children.length).toBe(1);
    expect(layout.weights.length).toBe(1);
  });

  it('should remove children', () => {
    const children: Record<string, any> = {
      child1: { key: 'child1', render: () => null },
      child2: { key: 'child2', render: () => null },
    };
    const mockGetObject = (key: string) => children[key];
    const layout = new Layout('test', mockGetObject, ['child1', 'child2']);
    layout.remove('child1');
    expect(layout.children.length).toBe(1);
  });
});

describe('HorizontalLayout', () => {
  it('should extend Layout', () => {
    const mockGetObject = (key: string) => ({ key, render: () => null });
    const layout = new HorizontalLayout('test', mockGetObject, []);
    expect(layout).toBeInstanceOf(Layout);
  });
});

describe('VerticalLayout', () => {
  it('should extend Layout', () => {
    const mockGetObject = (key: string) => ({ key, render: () => null });
    const layout = new VerticalLayout('test', mockGetObject, []);
    expect(layout).toBeInstanceOf(Layout);
  });
});

