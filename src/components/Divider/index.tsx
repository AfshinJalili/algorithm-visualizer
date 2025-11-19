import React, { useRef } from 'react';
import { classes } from 'common/util';
import styles from './Divider.module.scss';

interface DividerProps {
  className?: string;
  horizontal?: boolean;
  onResize?: (element: HTMLElement, clientX: number, clientY: number) => void;
}

const Divider: React.FC<DividerProps> = ({ className, horizontal, onResize }) => {
  const targetRef = useRef<HTMLElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    targetRef.current = e.currentTarget;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (onResize && targetRef.current?.parentElement) {
      onResize(targetRef.current.parentElement, e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={classes(styles.divider, horizontal ? styles.horizontal : styles.vertical, className)}
      onMouseDown={handleMouseDown} 
    />
  );
};

export default Divider;
