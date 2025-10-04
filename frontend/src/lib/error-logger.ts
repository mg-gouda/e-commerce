interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

interface LoggedError {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  userAgent: string;
  url: string;
}

class ErrorLogger {
  private errors: LoggedError[] = [];
  private maxErrors = 50; // Keep last 50 errors in memory

  log(error: Error, context?: ErrorContext) {
    const loggedError: LoggedError = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Store in memory
    this.errors.push(loggedError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', {
        message: error.message,
        context,
        stack: error.stack,
      });
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToTrackingService(loggedError);
    }
  }

  private async sendToTrackingService(error: LoggedError) {
    try {
      // TODO: Integrate with error tracking service
      // Examples:
      // - Sentry.captureException(error)
      // - LogRocket.captureException(error)
      // - Custom backend endpoint

      // For now, we'll send to a custom endpoint if available
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_URL) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error),
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      }
    } catch {
      // Silently fail - we don't want error logging to break the app
    }
  }

  getRecentErrors(): LoggedError[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorLogger = new ErrorLogger();

// Helper function for logging errors with context
export function logError(error: Error, context?: ErrorContext) {
  errorLogger.log(error, context);
}

// Helper for API errors
export function logApiError(
  error: any,
  endpoint: string,
  method: string = 'GET'
) {
  logError(error, {
    component: 'API',
    action: `${method} ${endpoint}`,
    statusCode: error.statusCode || error.status,
  });
}
