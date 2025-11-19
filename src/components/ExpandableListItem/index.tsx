import React, { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import styles from './ExpandableListItem.module.scss';
import ListItem from 'components/ListItem';
import { classes } from 'common/util';

interface ExpandableListItemProps {
  className?: string;
  children?: ReactNode;
  opened: boolean;
  [key: string]: any;
}

const ExpandableListItem: React.FC<ExpandableListItemProps> = ({ className, children, opened, ...props }) => {
  return opened ? (
    <div className={classes(styles.expandable_list_item, className)}>
      <ListItem className={styles.category} {...props}>
        <FontAwesomeIcon className={styles.icon} fixedWidth icon={faCaretDown} />
      </ListItem>
      {children}
    </div>
  ) : (
    <ListItem className={classes(styles.category, className)} {...props}>
      <FontAwesomeIcon className={styles.icon} fixedWidth icon={faCaretRight} />
    </ListItem>
  );
};

export default ExpandableListItem;
