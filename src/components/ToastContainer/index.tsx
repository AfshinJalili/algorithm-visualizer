import React, { useEffect, useRef } from 'react';
import { classes } from 'common/util';
import { useAppSelector, useAppDispatch } from '../../store';
import { hideToast } from '../../reducers';
import styles from './ToastContainer.module.scss';

interface ToastContainerProps {
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(state => state.toast.toasts);
  const prevToastsRef = useRef(toasts);

  useEffect(() => {
    const newToasts = toasts.filter(toast => !prevToastsRef.current.includes(toast));
    newToasts.forEach(toast => {
      window.setTimeout(() => dispatch(hideToast(toast.id)), 3000);
    });
    prevToastsRef.current = toasts;
  }, [toasts, dispatch]);

  return (
    <div className={classes(styles.toast_container, className)}>
      {toasts.map(toast => (
        <div className={classes(styles.toast, styles[toast.type])} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
