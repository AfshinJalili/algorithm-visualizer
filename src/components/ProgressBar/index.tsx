import React, { useRef } from 'react';
import { classes } from 'common/util';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  className?: string;
  total: number;
  current: number;
  onChangeProgress?: (progress: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  total,
  current,
  onChangeProgress,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    targetRef.current = e.currentTarget;
    handleMouseMove(e as any);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!targetRef.current) return;
    const { left } = targetRef.current.getBoundingClientRect();
    const { offsetWidth } = targetRef.current;
    const progress = ((e as MouseEvent).clientX - left) / offsetWidth;
    if (onChangeProgress) onChangeProgress(progress);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={classes(styles.progress_bar, className)} onMouseDown={handleMouseDown}>
      <div className={styles.active} style={{ width: `${(current / total) * 100}%` }} />
      <div className={styles.label}>
        <span className={styles.current}>{current}</span> / {total}
      </div>
    </div>
  );
};

export default ProgressBar;
