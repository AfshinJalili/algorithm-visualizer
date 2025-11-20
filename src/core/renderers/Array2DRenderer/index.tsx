import React from 'react';
import { Array1DRenderer, Renderer } from 'core/renderers';
import styles from './Array2DRenderer.module.scss';
import { classes } from 'common/util';
import type Array2DTracer from 'core/tracers/Array2DTracer';

interface Element {
  value: unknown;
  selected: boolean;
  patched: boolean;
}

class Array2DRenderer extends Renderer<Array2DTracer> {
  constructor(props: { className?: string; title: string; data: Array2DTracer }) {
    super(props);

    this.togglePan(true);
    this.toggleZoom(true);
  }

  renderData() {
    const { data } = this.props.data;

    if (!data || data.length === 0) {
      return null;
    }

    const isArray1D = this instanceof Array1DRenderer;
    const longestRow = data.reduce(
      (longestRow: Element[], row: Element[]) =>
        longestRow.length < row.length ? row : longestRow,
      []
    );

    return (
      <table
        className={styles.array_2d}
        style={{
          marginLeft: -this.centerX * 2,
          marginTop: -this.centerY * 2,
          transform: `scale(${this.zoom})`,
        }}
      >
        <tbody>
          <tr className={styles.row}>
            {!isArray1D && <td className={classes(styles.col, styles.index)} />}
            {longestRow.map((_, i: number) => (
              <td className={classes(styles.col, styles.index)} key={i}>
                <span className={styles.value}>{i}</span>
              </td>
            ))}
          </tr>
          {data.map((row: Element[], i: number) => (
            <tr className={styles.row} key={i}>
              {!isArray1D && (
                <td className={classes(styles.col, styles.index)}>
                  <span className={styles.value}>{i}</span>
                </td>
              )}
              {row.map((col: Element, j: number) => (
                <td
                  className={classes(
                    styles.col,
                    col.selected && styles.selected,
                    col.patched && styles.patched
                  )}
                  key={j}
                >
                  <span className={styles.value}>{this.toString(col.value)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Array2DRenderer;
