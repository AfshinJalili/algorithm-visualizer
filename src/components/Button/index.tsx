import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { classes } from 'common/util';
import Ellipsis from 'components/Ellipsis';
import styles from './Button.module.scss';

interface ButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  className?: string;
  children?: ReactNode;
  to?: string | null;
  href?: string | null;
  onClick?: () => void;
  icon?: IconDefinition | string;
  reverse?: boolean;
  selected?: boolean;
  disabled?: boolean;
  primary?: boolean;
  active?: boolean;
  confirmNeeded?: boolean;
  inProgress?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  to,
  href,
  onClick,
  icon: iconProp,
  reverse,
  selected,
  disabled,
  primary,
  active,
  confirmNeeded,
  inProgress,
  ...rest
}) => {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<number | undefined>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  let finalClassName = className;
  let finalChildren = children;
  let finalIcon = iconProp;
  let finalTo = to;
  let finalHref = href;
  let finalOnClick = onClick;

  if (confirmNeeded) {
    if (confirming) {
      finalClassName = classes(styles.confirming, className);
      finalIcon = faExclamationCircle;
      finalChildren = <Ellipsis key="text">Click to Confirm</Ellipsis>;
      const onClickOriginal = onClick;
      finalOnClick = () => {
        if (onClickOriginal) onClickOriginal();
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
          setConfirming(false);
        }
      };
    } else {
      finalTo = null;
      finalHref = null;
      finalOnClick = () => {
        setConfirming(true);
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = undefined;
          setConfirming(false);
        }, 2000);
      };
    }
  }

  const iconOnly = !finalChildren;
  const props = {
    className: classes(
      styles.button,
      reverse && styles.reverse,
      selected && styles.selected,
      disabled && styles.disabled,
      primary && styles.primary,
      active && styles.active,
      iconOnly && styles.icon_only,
      finalClassName
    ),
    to: disabled ? null : finalTo,
    href: disabled ? null : finalHref,
    onClick: disabled ? null : finalOnClick,
    children: [
      finalIcon &&
        (typeof finalIcon === 'string' ? (
          <div
            className={classes(styles.icon, styles.image)}
            key="icon"
            style={{ backgroundImage: `url(${finalIcon})` }}
          />
        ) : (
          <FontAwesomeIcon
            className={styles.icon}
            fixedWidth
            icon={inProgress ? faSpinner : finalIcon}
            spin={inProgress}
            key="icon"
          />
        )),
      finalChildren,
    ],
    ...rest,
  };

  return finalTo ? (
    <Link {...props} to={finalTo} />
  ) : finalHref ? (
    <a rel="noopener" target="_blank" {...props} href={finalHref} />
  ) : (
    <div {...props} />
  );
};

export default Button;
