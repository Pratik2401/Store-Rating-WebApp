import React from 'react'
import { Modal, Button } from 'react-bootstrap'

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      className="ConfirmModal"
    >
      <Modal.Header closeButton className="ConfirmModalHeader">
        <Modal.Title className="ConfirmModalTitle">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="ConfirmModalBody">
        <p className="ConfirmModalMessage mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer className="ConfirmModalFooter">
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={loading}
          className="ConfirmModalCancelBtn"
        >
          {cancelText}
        </Button>
        <Button 
          variant={confirmVariant} 
          onClick={onConfirm}
          disabled={loading}
          className="ConfirmModalConfirmBtn"
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal
