import React from 'react';
import styles from './Renderer.module.scss';
import Ellipsis from 'components/Ellipsis';
import { classes } from 'common/util';

interface RendererProps<T = unknown> {
  className?: string;
  title: string;
  data: T;
}

class Renderer<T = unknown> extends React.Component<RendererProps<T>> {
  _handleMouseDown: ((e: React.MouseEvent) => void) | undefined;
  _handleWheel: ((e: React.WheelEvent) => void) | undefined;
  handleMouseDown: ((e: React.MouseEvent) => void) | undefined;
  handleWheel: ((e: React.WheelEvent) => void) | undefined;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
  lastX: number | null;
  lastY: number | null;
  centerX: number;
  centerY: number;
  zoom: number;
  zoomFactor: number;
  zoomMax: number;
  zoomMin: number;

  constructor(props: RendererProps) {
    super(props);

    this.handleMouseMove = this._handleMouseMove.bind(this);
    this.handleMouseUp = this._handleMouseUp.bind(this);

    this._handleMouseDown = this._internalHandleMouseDown.bind(this);
    this._handleWheel = this._internalHandleWheel.bind(this);
    this.togglePan(false);
    this.toggleZoom(false);

    this.lastX = null;
    this.lastY = null;
    this.centerX = 0;
    this.centerY = 0;
    this.zoom = 1;
    this.zoomFactor = 1.01;
    this.zoomMax = 20;
    this.zoomMin = 1 / 20;
  }

  componentDidUpdate(prevProps: RendererProps<T>, prevState: unknown, snapshot: unknown) {}

  togglePan(enable: boolean = !this.handleMouseDown) {
    this.handleMouseDown = enable ? this._handleMouseDown : undefined;
  }

  toggleZoom(enable: boolean = !this.handleWheel) {
    this.handleWheel = enable ? this._handleWheel : undefined;
  }

  _internalHandleMouseDown(e: React.MouseEvent) {
    const { clientX, clientY } = e;
    this.lastX = clientX;
    this.lastY = clientY;
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  _handleMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;
    const dx = clientX - this.lastX!;
    const dy = clientY - this.lastY!;
    this.centerX -= dx;
    this.centerY -= dy;
    this.refresh();
    this.lastX = clientX;
    this.lastY = clientY;
  }

  _handleMouseUp(e: MouseEvent) {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  _internalHandleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const { deltaY } = e;
    this.zoom *= Math.pow(this.zoomFactor, deltaY);
    this.zoom = Math.min(this.zoomMax, Math.max(this.zoomMin, this.zoom));
    this.refresh();
  }

  toString(value: unknown): string {
    switch (typeof value) {
      case 'number':
        return [Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER, 0x7fffffff].includes(value)
          ? '∞'
          : [Number.NEGATIVE_INFINITY, Number.MIN_SAFE_INTEGER, -0x80000000].includes(value)
            ? '-∞'
            : Number.isInteger(value)
              ? value.toString()
              : value.toFixed(3);
      case 'boolean':
        return value ? 'T' : 'F';
      default:
        return value;
    }
  }

  refresh() {
    this.forceUpdate();
  }

  renderData(): React.ReactNode {
    return null;
  }

  render() {
    const { className, title } = this.props;

    return (
      <div
        className={classes(styles.renderer, className)}
        onMouseDown={this.handleMouseDown}
        onWheel={this.handleWheel}
      >
        <Ellipsis className={styles.title}>{title}</Ellipsis>
        {this.renderData()}
      </div>
    );
  }
}

export default Renderer;
