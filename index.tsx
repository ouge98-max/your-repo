import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import toast from 'react-hot-toast';
import { ArrowUpCircle, AlertTriangle } from 'lucide-react';

// Error Boundary Component for production readiness
interface ErrorBoundaryProps {
  children?: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center" role="alert">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Something went wrong.</h1>
          <p className="text-muted-foreground mt-2">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children as ReactNode;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// typed custom event for service worker updates
interface SWUpdateEventDetail {
  // depending on your registration script, this might be a ServiceWorker instance
  installingWorker?: ServiceWorker;
}
interface SWUpdateEvent extends CustomEvent {
  detail: SWUpdateEventDetail;
}

window.addEventListener('swUpdate', (event: Event) => {
  const customEvent = event as SWUpdateEvent;
  const installingWorker = customEvent.detail?.installingWorker;
  if (installingWorker) {
    toast.custom(
      (t) => (
        <div
          className={`max-w-md w-full bg-card text-card-foreground shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-border animate-fade-in-up`}
          role="status"
          aria-live="polite"
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ArrowUpCircle className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  New version available!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please refresh to update the application.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-border">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Refresh
            </button>
          </div>
        </div>
      ),
      { id: 'sw-update', duration: Infinity }
    );
  }
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();

  const errorMessage = (event.reason as Error)?.message || 'An unknown error occurred.';

  toast.error(
    (t) => (
      <div className="flex items-start" role="alert" aria-live="assertive">
        <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive-foreground">Operation Failed</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    ),
    {
      id: `unhandled-${Date.now()}`,
      duration: 6000,
      style: {
        background: 'rgb(var(--destructive))',
        color: 'rgb(var(--destructive-foreground))'
      }
    }
  );
});

// Add global error listener for non-promise runtime errors
window.addEventListener('error', (event) => {
  console.error('Global error captured:', event.error || event.message);
  // optional: show a concise toast or forward to monitoring
});