import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // For now: log to console (later: Sentry / LogRocket)
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#070d1a] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">
            The app hit an unexpected error. You can try reloading, or reset the
            UI.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={this.handleReset}
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Try again
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="h-11 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Reload
            </button>
          </div>

          {import.meta.env.DEV && this.state.error ? (
            <pre className="mt-5 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-rose-200">
              {String(this.state.error)}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }
}
