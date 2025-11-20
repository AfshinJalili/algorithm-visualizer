import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { hideToast } from '../../reducers';
import { cn } from "@/lib/utils";

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

  const toastStyles = {
    error: 'bg-destructive text-destructive-foreground border-destructive',
    success: 'bg-green-600 text-white border-green-700',
    info: 'bg-blue-600 text-white border-blue-700',
    warning: 'bg-yellow-600 text-white border-yellow-700',
  };

  return (
    <div className={cn("flex flex-col gap-2 pointer-events-none", className)}>
      {toasts.map(toast => (
        <div 
          className={cn(
            "px-4 py-3 rounded-md border shadow-lg pointer-events-auto animate-in slide-in-from-right-5",
            toastStyles[toast.type as keyof typeof toastStyles] || toastStyles.info
          )} 
          key={toast.id}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
