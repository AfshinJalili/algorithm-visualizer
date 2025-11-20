import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { classes } from 'common/util';
import Ellipsis from 'components/Ellipsis';
import { Button as ShadcnButton } from "components/ui/button";
import { cn } from "@/lib/utils";

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

  let finalOnClick = onClick;
  let finalIcon = iconProp;
  let finalChildren = children;

  if (confirmNeeded) {
    if (confirming) {
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
      finalOnClick = () => {
        setConfirming(true);
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = undefined;
          setConfirming(false);
        }, 2000);
      };
    }
  }

  const variant = primary ? "default" : "ghost";
  
  // Determine active/selected state styles manually since Shadcn variant might not cover all custom states perfectly without creating new variants
  // But we can mix classes.
  
  return (
    <ShadcnButton
      variant={variant}
      className={cn(
        className,
        selected && "bg-accent text-accent-foreground",
        reverse && "flex-row-reverse",
        active && "bg-accent text-accent-foreground font-bold",
        !finalChildren && "px-2" // Icon only adjustment
      )}
      disabled={disabled}
      asChild={!!(to || href)}
      onClick={disabled ? undefined : finalOnClick}
      {...rest}
    >
      {to ? (
        <Link to={to}>
           {finalIcon && (
            typeof finalIcon === 'string' ? (
              <div
                className="w-4 h-4 bg-cover bg-center rounded-sm mr-2"
                style={{ backgroundImage: `url(${finalIcon})` }}
              />
            ) : (
              <FontAwesomeIcon
                icon={inProgress ? faSpinner : finalIcon}
                spin={inProgress}
                className={cn("mr-2 h-4 w-4", reverse && "mr-0 ml-2")}
              />
            )
          )}
          {finalChildren}
        </Link>
      ) : href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
           {finalIcon && (
            typeof finalIcon === 'string' ? (
              <div
                className="w-4 h-4 bg-cover bg-center rounded-sm mr-2"
                style={{ backgroundImage: `url(${finalIcon})` }}
              />
            ) : (
              <FontAwesomeIcon
                icon={inProgress ? faSpinner : finalIcon}
                spin={inProgress}
                className={cn("mr-2 h-4 w-4", reverse && "mr-0 ml-2")}
              />
            )
          )}
          {finalChildren}
        </a>
      ) : (
        <>
          {finalIcon && (
            typeof finalIcon === 'string' ? (
              <div
                className="w-4 h-4 bg-cover bg-center rounded-sm mr-2"
                style={{ backgroundImage: `url(${finalIcon})` }}
              />
            ) : (
              <FontAwesomeIcon
                icon={inProgress ? faSpinner : finalIcon}
                spin={inProgress}
                className={cn("mr-2 h-4 w-4", reverse && "mr-0 ml-2")}
              />
            )
          )}
          {finalChildren}
        </>
      )}
    </ShadcnButton>
  );
};

export default Button;
