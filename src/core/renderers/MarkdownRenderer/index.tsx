import React from 'react';
import { Renderer } from 'core/renderers';
import styles from './MarkdownRenderer.module.scss';
import ReactMarkdown from 'react-markdown';
import type MarkdownTracer from 'core/tracers/MarkdownTracer';

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level: number;
  children: React.ReactNode;
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string;
};

class MarkdownRenderer extends Renderer<MarkdownTracer> {
  renderData() {
    const { markdown } = this.props.data;

    const heading = ({ level, children, ...rest }: HeadingProps) => {
      const HeadingComponent = [
        (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />,
        (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
        (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
        (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 {...props} />,
        (props: React.HTMLAttributes<HTMLHeadingElement>) => <h5 {...props} />,
        (props: React.HTMLAttributes<HTMLHeadingElement>) => <h6 {...props} />,
      ][level - 1];

      const idfy = (text: string) =>
        text
          .toLowerCase()
          .trim()
          .replace(/[^\w \-]/g, '')
          .replace(/ /g, '-');

      const getText = (children: React.ReactNode): string => {
        return (
          React.Children.map(children, child => {
            if (!child) return '';
            if (typeof child === 'string') return child;
            if (typeof child === 'object' && 'props' in child)
              return getText((child as React.ReactElement).props.children);
            return '';
          })?.join('') || ''
        );
      };

      const id = idfy(getText(children));

      return (
        <HeadingComponent id={id} {...rest}>
          {children}
        </HeadingComponent>
      );
    };

    const link = ({ href, ...rest }: LinkProps) => {
      return /^#/.test(href || '') ? (
        <a href={href} {...rest} />
      ) : (
        <a href={href} rel="noopener" target="_blank" {...rest} />
      );
    };

    const image = ({ src, ...rest }: ImageProps) => {
      let newSrc = src;
      const style: React.CSSProperties = { maxWidth: '100%' };
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
