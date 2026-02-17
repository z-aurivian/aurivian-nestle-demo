import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#FF4400' }}>Something went wrong</h1>
          <pre style={{ background: '#2D2C2C', padding: 16, borderRadius: 8, overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <p style={{ color: '#8D8C8C', marginTop: 16 }}>Check the browser console for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
