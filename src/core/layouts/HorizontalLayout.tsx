import Layout from './Layout';

class HorizontalLayout extends Layout {
  constructor(key: string, getObject: (key: string) => any, children: string[]) {
    super(key, getObject, children);
    this.horizontal = true;
  }
}

export default HorizontalLayout;
