import Swal from 'sweetalert2'

// SweetAlert2 theme configuration
const swalTheme = {
  customClass: {
    container: 'SweetAlertContainer',
    popup: 'SweetAlertPopup',
    header: 'SweetAlertHeader',
    title: 'SweetAlertTitle',
    closeButton: 'SweetAlertCloseButton',
    icon: 'SweetAlertIcon',
    image: 'SweetAlertImage',
    content: 'SweetAlertContent',
    htmlContainer: 'SweetAlertHtmlContainer',
    input: 'SweetAlertInput',
    inputLabel: 'SweetAlertInputLabel',
    validationMessage: 'SweetAlertValidationMessage',
    actions: 'SweetAlertActions',
    confirmButton: 'SweetAlertConfirmButton',
    denyButton: 'SweetAlertDenyButton',
    cancelButton: 'SweetAlertCancelButton',
    loader: 'SweetAlertLoader',
    footer: 'SweetAlertFooter'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeInDown animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp animate__faster'
  }
}

// Success Alert
export const showSuccessAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonClass: 'btn btn-success',
    ...swalTheme,
    ...options
  })
}

// Error Alert
export const showErrorAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonClass: 'btn btn-danger',
    ...swalTheme,
    ...options
  })
}

// Warning Alert
export const showWarningAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonClass: 'btn btn-warning',
    ...swalTheme,
    ...options
  })
}

// Info Alert
export const showInfoAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonClass: 'btn btn-info',
    ...swalTheme,
    ...options
  })
}

// Confirmation Alert
export const showConfirmAlert = (title, text = '', confirmText = 'Yes', cancelText = 'No', options = {}) => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonClass: 'btn btn-primary me-2',
    cancelButtonClass: 'btn btn-secondary',
    reverseButtons: true,
    ...swalTheme,
    ...options
  })
}

// Delete Confirmation Alert
export const showDeleteConfirmAlert = (itemName, options = {}) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: `You won't be able to recover ${itemName}!`,
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonClass: 'btn btn-danger me-2',
    cancelButtonClass: 'btn btn-secondary',
    reverseButtons: true,
    ...swalTheme,
    ...options
  })
}

// Loading Alert
export const showLoadingAlert = (title = 'Loading...', text = 'Please wait', options = {}) => {
  return Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
    ...swalTheme,
    ...options
  })
}

// Toast notification (bottom-right corner)
export const showToast = (icon, title, text = '', options = {}) => {
  return Swal.fire({
    icon: icon,
    title: title,
    text: text,
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    customClass: {
      popup: 'SweetAlertToast',
      title: 'SweetAlertToastTitle',
      content: 'SweetAlertToastContent'
    },
    ...options
  })
}

// Input Alert
export const showInputAlert = (title, inputPlaceholder = '', inputType = 'text', options = {}) => {
  return Swal.fire({
    title: title,
    input: inputType,
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    confirmButtonClass: 'btn btn-primary me-2',
    cancelButtonClass: 'btn btn-secondary',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to enter something!'
      }
    },
    ...swalTheme,
    ...options
  })
}

// Custom HTML Alert
export const showCustomAlert = (html, options = {}) => {
  return Swal.fire({
    html: html,
    confirmButtonText: 'OK',
    confirmButtonClass: 'btn btn-primary',
    ...swalTheme,
    ...options
  })
}

// Network Error Alert
export const showNetworkErrorAlert = () => {
  return showErrorAlert(
    'Network Error',
    'Unable to connect to the server. Please check your internet connection and try again.',
    {
      footer: '<small>If the problem persists, please contact support.</small>'
    }
  )
}

// Validation Error Alert
export const showValidationErrorAlert = (errors) => {
  const errorList = Array.isArray(errors) 
    ? errors.map(error => `• ${error}`).join('<br>')
    : errors

  return Swal.fire({
    icon: 'error',
    title: 'Validation Error',
    html: `<div class="text-start">${errorList}</div>`,
    confirmButtonText: 'OK',
    confirmButtonClass: 'btn btn-danger',
    ...swalTheme
  })
}

export default Swal
