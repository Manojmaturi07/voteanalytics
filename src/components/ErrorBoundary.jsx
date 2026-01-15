import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', background: '#fff', minHeight: '100vh' }}>
          <h1 style={{ color: 'red', fontSize: '24px' }}>⚠️ Something went wrong.</h1>
          <div style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <strong>Error:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            {this.state.errorInfo && (
              <>
                <strong style={{ display: 'block', marginTop: '15px' }}>Component Stack:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

