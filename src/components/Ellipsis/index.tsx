import React, { ReactNode } from 'react';
import styles from './Ellipsis.module.scss';
import { classes } from 'common/util';

interface EllipsisProps {
  className?: string;
  children: ReactNode;
}

const Ellipsis: React.FC<EllipsisProps> = ({ className, children }) => {
  return <span className={classes(styles.ellipsis, className)}>{children}</span>;
};

export default Ellipsis;
