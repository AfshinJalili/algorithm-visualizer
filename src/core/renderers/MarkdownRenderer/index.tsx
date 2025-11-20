import React from 'react';
import { Renderer } from 'core/renderers';
import styles from './MarkdownRenderer.module.scss';
import ReactMarkdown from 'react-markdown';

class MarkdownRenderer extends Renderer {
  renderData() {
    const { markdown } = this.props.data;

    const heading = ({ level, children, ...rest }: any) => {
      const HeadingComponent = [
        (props: any) => <h1 {...props} />,
        (props: any) => <h2 {...props} />,
        (props: any) => <h3 {...props} />,
        (props: any) => <h4 {...props} />,
        (props: any) => <h5 {...props} />,
        (props: any) => <h6 {...props} />,
      ][level - 1];

      const idfy = (text: string) => text.toLowerCase().trim().replace(/[^\w \-]/g, '').replace(/ /g, '-');

      const getText = (children: any): string => {
        return React.Children.map(children, child => {
          if (!child) return '';
          if (typeof child === 'string') return child;
          if ('props' in child) return getText(child.props.children);
          return '';
        }).join('');
      };

      const id = idfy(getText(children));

      return (
        <HeadingComponent id={id} {...rest}>
          {children}
        </HeadingComponent>
      );
    };

    const link = ({ href, ...rest }: any) => {
      return /^#/.test(href) ? (
        <a href={href} {...rest} />
      ) : (
        <a href={href} rel="noopener" target="_blank" {...rest} />
      );
    };

    const image = ({ src, ...rest }: any) => {
      let newSrc = src;
      let style: React.CSSProperties = { maxWidth: '100%' };
      const CODECOGS = 'https://latex.codecogs.com/svg.latex?';
      const WIKIMEDIA_IMAGE = 'https://upload.wikimedia.org/wikipedia/';
      const WIKIMEDIA_MATH = 'https://wikimedia.org/api/rest_v1/media/math/render/svg/';
      if (src.startsWith(CODECOGS)) {
        const latex = src.substring(CODECOGS.length);
        newSrc = `${CODECOGS}\\color{White}${latex}`;
      } else if (src.startsWith(WIKIMEDIA_IMAGE)) {
        style.backgroundColor = 'white';
      } else if (src.startsWith(WIKIMEDIA_MATH)) {
        style.filter = 'invert(100%)';
      }
      return <img src={newSrc} style={style} {...rest} />;
    };

    return (
      <div className={styles.markdown}>
        <ReactMarkdown className={styles.content} components={{ heading, link, image }}>
          {markdown}
        </ReactMarkdown>
      </div>
    );
  }
}

export default MarkdownRenderer;

