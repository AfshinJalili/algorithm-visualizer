import React from 'react';
import { Renderer } from 'core/renderers';

class Tracer {
  key: string;
  getObject: (key: string) => Tracer | undefined;
  title: string;

  constructor(key: string, getObject: (key: string) => Tracer | undefined, title: string) {
    this.key = key;
    this.getObject = getObject;
    this.title = title;
    this.init();
    this.reset();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRendererClass(): any {
    return Renderer;
  }

  init() {}

  render() {
    const RendererClass = this.getRendererClass();
    return <RendererClass key={this.key} title={this.title} data={this} />;
  }

  set() {}

  reset() {
    this.set();
  }
}

export default Tracer;
