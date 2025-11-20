import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  level?: 'root' | 'feature' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKeys) {
      const hasReset = prevProps.resetKeys.some(
        (key, index) => key !== this.props.resetKeys?.[index]
      );
      if (hasReset) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const { level = 'component' } = this.props;

      return (
        <div className={styles.errorBoundary} data-level={level}>
          <div className={styles.content}>
            <div className={styles.icon}>⚠️</div>
            <h2 className={styles.title}>
              {level === 'root' ? 'Application Error' : 'Something went wrong'}
            </h2>
            <p className={styles.message}>
              {level === 'root' 
                ? 'The application encountered an unexpected error.'
                : 'This component failed to render.'}
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className={styles.details}>
                <summary>Error Details (Development Only)</summary>
                <pre className={styles.errorStack}>
                  {error.toString()}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className={styles.actions}>
              <button onClick={this.reset} className={styles.primaryButton}>
                Try Again
              </button>
              {level === 'root' && (
                <button 
                  onClick={() => window.location.href = '/'} 
                  className={styles.secondaryButton}
                >
                  Go Home
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

