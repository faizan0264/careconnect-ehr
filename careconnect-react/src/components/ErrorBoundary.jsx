import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareConnect Application Error:', error, errorInfo);
  }

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = window.location.origin;
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Application Recovery Console</h1>
              <p className="text-xs text-slate-500 mt-1">
                A browser storage conflict was detected. Click below to reload or reset to clean factory defaults.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs font-mono text-slate-600 max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleHardReset}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data & Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
