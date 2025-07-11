import React from 'react'
import { Alert } from 'react-bootstrap'

const ErrorAlert = ({ error, onClose, variant = 'danger', className = '' }) => {
  if (!error) return null

  return (
    <Alert 
      variant={variant} 
      dismissible={!!onClose} 
      onClose={onClose}
      className={`ErrorAlert ${className}`}
    >
      <div className="ErrorAlertContent">
        {typeof error === 'string' ? error : error.message || 'An error occurred'}
      </div>
    </Alert>
  )
}

export default ErrorAlert
