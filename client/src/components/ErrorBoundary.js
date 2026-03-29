import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F9FAF7] text-center font-body">
          <h1 className="font-display text-xl text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-600 text-sm mb-4 max-w-md">
            The app hit an error while rendering. Check the browser console (F12) for details.
          </p>
          <pre className="text-left text-xs bg-white p-4 rounded-xl border border-gray-200 max-w-full overflow-auto text-red-700">
            {this.state.error && String(this.state.error.message || this.state.error)}
          </pre>
          <button
            type="button"
            className="mt-6 px-6 py-3 rounded-2xl bg-eco-primary text-white font-semibold"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
