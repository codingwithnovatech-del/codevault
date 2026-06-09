import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center space-y-4">
          <div className="text-3xl">&#9888;</div>
          <p className="text-sm text-on-surface-variant">Failed to load this view.</p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
