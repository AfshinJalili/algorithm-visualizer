import React from 'react';
import styles from './ListItem.module.scss';
import { classes } from 'common/util';
import Button from 'components/Button';
import Ellipsis from 'components/Ellipsis';

class ListItem extends React.Component {
  render() {
    const { className, children, indent, label, ...props } = this.props;

    return (
      <Button className={classes(styles.list_item, indent && styles.indent, className)} {...props}>
        <Ellipsis className={styles.label}>{label}</Ellipsis>
        {children}
      </Button>
    );
  }
}

export default ListItem;

