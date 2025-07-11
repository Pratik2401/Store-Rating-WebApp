import React from 'react'
import { Spinner, Container } from 'react-bootstrap'

/**
 * Loading spinner component with customizable message and full-page option
 * Used throughout the application for loading states
 */
const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  /**
   * Renders the spinner content with message
   */
  const SpinnerContent = () => (
    <div className="LoadingSpinnerContent text-center">
      <Spinner 
        animation="border" 
        variant="primary" 
        className="LoadingSpinnerIcon mb-3"
        style={{ width: '3rem', height: '3rem' }}
      />
      <div className="LoadingSpinnerMessage">
        <p className="LoadingText mb-0">{message}</p>
      </div>
    </div>
  )

  if (fullPage) {
    return (
      <Container 
        fluid 
        className="LoadingContainer d-flex justify-content-center align-items-center min-vh-100 bg-light"
      >
        <SpinnerContent />
      </Container>
    )
  }

  return (
    <div className="LoadingWrapper d-flex justify-content-center align-items-center py-5">
      <SpinnerContent />
    </div>
  )
}

export default LoadingSpinner
