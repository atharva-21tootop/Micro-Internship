// src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error tracking service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <AlertCircle size={64} />
            </div>
            
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry for the inconvenience. An unexpected error has occurred.</p>
            
            {import.meta.env.DEV && this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details (Development Only)</summary>
                <code>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </code>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.resetError} className="btn btn-primary">
                <RefreshCw size={18} />
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'} className="btn btn-outline">
                Go Home
              </button>
            </div>
            
            {this.state.errorCount > 3 && (
              <p className="error-persistent">
                Multiple errors detected. Please refresh the page or contact support if the problem persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
