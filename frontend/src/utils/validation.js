// Validation utility functions for form validation

export const validateName = (name) => {
  if (!name || name.trim().length < 20) {
    return 'Name must be at least 20 characters long'
  }
  if (name.trim().length > 60) {
    return 'Name must not exceed 60 characters'
  }
  return null
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || email.trim().length === 0) {
    return 'Email is required'
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (password.length > 16) {
    return 'Password must not exceed 16 characters'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}

export const validateAddress = (address) => {
  if (!address || address.trim().length === 0) {
    return 'Address is required'
  }
  if (address.trim().length > 400) {
    return 'Address must not exceed 400 characters'
  }
  return null
}

export const validateRole = (role) => {
  const validRoles = ['system_admin', 'normal_user', 'store_owner']
  if (!role || !validRoles.includes(role)) {
    return 'Please select a valid role'
  }
  return null
}

export const validateRating = (rating) => {
  const numRating = Number(rating)
  if (!rating || isNaN(numRating)) {
    return 'Rating is required'
  }
  if (numRating < 1 || numRating > 5) {
    return 'Rating must be between 1 and 5'
  }
  return null
}

export const validateForm = (formData, fields) => {
  const errors = {}
  
  fields.forEach(field => {
    switch (field) {
      case 'name':
        const nameError = validateName(formData.name)
        if (nameError) errors.name = nameError
        break
      case 'email':
        const emailError = validateEmail(formData.email)
        if (emailError) errors.email = emailError
        break
      case 'password':
        const passwordError = validatePassword(formData.password)
        if (passwordError) errors.password = passwordError
        break
      case 'address':
        const addressError = validateAddress(formData.address)
        if (addressError) errors.address = addressError
        break
      case 'role':
        const roleError = validateRole(formData.role)
        if (roleError) errors.role = roleError
        break
      case 'rating':
        const ratingError = validateRating(formData.rating)
        if (ratingError) errors.rating = ratingError
        break
      default:
        break
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const formatRole = (role) => {
  switch (role) {
    case 'system_admin':
      return 'System Administrator'
    case 'normal_user':
      return 'Normal User'
    case 'store_owner':
      return 'Store Owner'
    default:
      return role
  }
}

export const getRoleColor = (role) => {
  switch (role) {
    case 'system_admin':
      return 'danger'
    case 'normal_user':
      return 'primary'
    case 'store_owner':
      return 'success'
    default:
      return 'secondary'
  }
}
