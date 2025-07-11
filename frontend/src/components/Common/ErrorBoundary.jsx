import React, { Component } from 'react'
import { Container, Alert, Button, Card } from 'react-bootstrap'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // You can log the error to an error reporting service here
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService = (error, errorInfo) => {
    // This is where you would send the error to your logging service
    // For now, we'll just log it to console
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.error('Error logged:', errorData)
    
    // Example: Send to error tracking service
    // errorTrackingService.logError(errorData)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, minimal = false } = this.props

      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        )
      }

      // Minimal error display for smaller components
      if (minimal) {
        return (
          <div className="error-boundary-minimal p-3 text-center">
            <Alert variant="danger" className="mb-3">
              <FaExclamationTriangle className="me-2" />
              Something went wrong
            </Alert>
            <Button variant="outline-primary" size="sm" onClick={this.handleRetry}>
              <FaRedo className="me-1" />
              Try Again
            </Button>
          </div>
        )
      }

      // Default full error boundary UI
      return (
        <Container className="error-boundary-container my-5">
          <Card className="error-boundary-card shadow">
            <Card.Header className="bg-danger text-white text-center">
              <h4 className="mb-0">
                <FaExclamationTriangle className="me-2" />
                Oops! Something went wrong
              </h4>
            </Card.Header>
            <Card.Body className="text-center p-4">
              <div className="error-boundary-content">
                <p className="text-muted mb-4">
                  We're sorry for the inconvenience. An unexpected error has occurred.
                </p>
                
                <div className="error-boundary-actions d-flex gap-3 justify-content-center flex-wrap">
                  <Button 
                    variant="primary" 
                    onClick={this.handleRetry}
                    className="d-flex align-items-center"
                  >
                    <FaRedo className="me-2" />
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={this.handleReload}
                    className="d-flex align-items-center"
                  >
                    Reload Page
                  </Button>
                  
                  <Button 
                    variant="outline-info" 
                    onClick={() => window.history.back()}
                    className="d-flex align-items-center"
                  >
                    Go Back
                  </Button>
                </div>

                {/* Show error details in development */}
                {import.meta.env.MODE === 'development' && this.state.error && (
                  <details className="error-boundary-details mt-4 text-start">
                    <summary className="text-danger cursor-pointer">
                      Error Details (Development Only)
                    </summary>
                    <div className="error-boundary-error-info mt-3 p-3 bg-light rounded">
                      <h6>Error Message:</h6>
                      <pre className="text-danger small">
                        {this.state.error.message}
                      </pre>
                      
                      <h6 className="mt-3">Stack Trace:</h6>
                      <pre className="small text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error.stack}
                      </pre>
                      
                      {this.state.errorInfo && (
                        <>
                          <h6 className="mt-3">Component Stack:</h6>
                          <pre className="small text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </Card.Body>
            <Card.Footer className="text-center text-muted">
              <small>
                Error ID: {this.state.errorId} | 
                Time: {new Date().toLocaleString()}
              </small>
            </Card.Footer>
          </Card>
        </Container>
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary

// Higher-order component for easier usage
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const ComponentWithErrorBoundary = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return ComponentWithErrorBoundary
}

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo) => {
    console.error('Error handled by useErrorHandler:', error, errorInfo)
    
    // You can implement custom error handling logic here
    // such as sending to error tracking service
    
    throw error // Re-throw to trigger error boundary
  }, [])

  return handleError
}
