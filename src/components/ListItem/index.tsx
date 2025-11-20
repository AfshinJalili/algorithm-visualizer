import React, { ReactNode } from 'react';
import styles from './ListItem.module.scss';
import { classes } from 'common/util';
import Button from 'components/Button';
import Ellipsis from 'components/Ellipsis';

interface ListItemProps extends React.ComponentProps<typeof Button> {
  className?: string;
  children?: ReactNode;
  indent?: boolean;
  label?: ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({ className, children, indent, label, ...props }) => {
  return (
    <Button className={classes(styles.list_item, indent && styles.indent, className)} {...props}>
      <Ellipsis className={styles.label}>{label}</Ellipsis>
      {children}
    </Button>
  );
};

export default ListItem;
