import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button.jsx';

/**
 * ErrorBoundary Component
 * 
 * Global error boundary that catches runtime errors in the React component tree
 * and displays a user-friendly fallback UI instead of crashing the entire app.
 * 
 * @component
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error-${Date.now()}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('❌ Error caught by ErrorBoundary:', error);
    console.error('Error details:', errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Store error information in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you could send error to error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    this.handleReset();
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                  Error Details (Development Only)
                </h2>
                <div className="text-sm text-red-800 dark:text-red-300 font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      <br /><br />
                      <strong>Component Stack:</strong>
                      <br />
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto"
              >
                Go to Home
              </Button>
            </div>

            {/* Error ID for support */}
            {this.state.errorId && (
              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                Error ID: {this.state.errorId}
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

