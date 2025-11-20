import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Renderer from './index';

describe('Renderer', () => {
  it('should instantiate and render correctly', () => {
    const props = {
      title: 'Test Renderer',
      data: {},
    };
    const { container } = render(<Renderer {...props} />);
    expect(container.querySelector('.title')).toBeDefined();
  });

  it('should convert numbers to strings correctly', () => {
    const props = {
      title: 'Test',
      data: {},
    };
    const { container } = render(<Renderer {...props} />);
    const renderer = new Renderer(props);
    expect(renderer.toString(42)).toBe('42');
    expect(renderer.toString(3.14159)).toBe('3.142');
    expect(renderer.toString(true)).toBe('T');
    expect(renderer.toString(false)).toBe('F');
  });
});

