import React from 'react';
import ResizableContainer from 'components/ResizableContainer';

class Layout {
  key: string;
  getObject: (key: string) => any;
  children: any[];
  weights: number[];
  ref: React.RefObject<any>;
  horizontal: boolean;

  constructor(key: string, getObject: (key: string) => any, children: string[]) {
    this.key = key;
    this.getObject = getObject;
    this.children = children.map(key => this.getObject(key));
    this.weights = children.map(() => 1);
    this.ref = React.createRef();
    this.horizontal = false;

    this.handleChangeWeights = this.handleChangeWeights.bind(this);
  }

  add(key: string, index: number = this.children.length) {
    const child = this.getObject(key);
    this.children.splice(index, 0, child);
    this.weights.splice(index, 0, 1);
  }

  remove(key: string) {
    const child = this.getObject(key);
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.weights.splice(index, 1);
    }
  }

  removeAll() {
    this.children = [];
    this.weights = [];
  }

  handleChangeWeights(weights: number[]) {
    this.weights.splice(0, this.weights.length, ...weights);
    this.ref.current?.forceUpdate();
  }

  render() {
    const horizontal = this.horizontal;

    return (
      <ResizableContainer
        key={this.key}
        ref={this.ref}
        weights={this.weights}
        horizontal={horizontal}
        onChangeWeights={this.handleChangeWeights}
      >
        {this.children.map(tracer => tracer && tracer.render())}
      </ResizableContainer>
    );
  }
}

export default Layout;
