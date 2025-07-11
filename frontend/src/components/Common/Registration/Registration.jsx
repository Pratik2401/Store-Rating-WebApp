import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap'
import { FaUser, FaEnvelope, FaLock, FaMapMarker, FaEye, FaEyeSlash, FaUserPlus, FaArrowRight } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { showSuccessAlert, showErrorAlert, showValidationErrorAlert } from '../../../utils/SweetAlert'
import '../../../styles/components/Registration.css'

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 20) {
      newErrors.name = 'Name must be at least 20 characters long'
    } else if (formData.name.trim().length > 60) {
      newErrors.name = 'Name must not exceed 60 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters'
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must include at least one uppercase letter and one special character'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.trim().length > 400) {
      newErrors.address = 'Address must not exceed 400 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors)
      showValidationErrorAlert(errorMessages)
      return
    }

    try {
      setLoading(true)
      
      // Demo registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate registration
      const userData = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        role: 'normal_user',
        created_at: new Date().toISOString()
      }

      // Call register function from auth context
      if (register) {
        await register(userData)
      }

      showSuccessAlert(
        'Registration Successful!', 
        'Your account has been created successfully. Welcome to Store Rating Platform!'
      )

      // Navigate to user dashboard
      navigate('/user/dashboard')
      
    } catch (err) {
      console.error('Registration error:', err)
      showErrorAlert(
        'Registration Failed',
        'Unable to create your account. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.password
    let strength = 0
    let feedback = []

    if (password.length >= 8) strength += 1
    else feedback.push('At least 8 characters')

    if (password.length <= 16) strength += 1
    else feedback.push('Maximum 16 characters')

    if (/[A-Z]/.test(password)) strength += 1
    else feedback.push('One uppercase letter')

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1
    else feedback.push('One special character')

    return { strength, feedback }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="RegistrationContainer">
      <Container>
        <Row className="justify-content-center min-vh-100 align-items-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="RegistrationCard shadow">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="RegistrationHeader text-center mb-4">
                  <div className="RegistrationIcon mb-3">
                    <FaUserPlus className="text-primary" size={48} />
                  </div>
                  <h2 className="RegistrationTitle h3 mb-2">Create Your Account</h2>
                  <p className="RegistrationSubtitle text-muted">
                    Join our platform to discover and rate amazing stores
                  </p>
                </div>

                {/* Registration Form */}
                <Form onSubmit={handleSubmit} noValidate>
                  {/* Name Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <FaUser className="me-2 text-muted" />
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name (20-60 characters)"
                      isInvalid={!!errors.name}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {formData.name.length}/60 characters
                    </Form.Text>
                  </Form.Group>

                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <FaEnvelope className="me-2 text-muted" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      isInvalid={!!errors.email}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <FaLock className="me-2 text-muted" />
                      Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a strong password (8-16 characters)"
                        isInvalid={!!errors.password}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="PasswordToggle"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="PasswordStrength mt-2">
                        <div className="PasswordStrengthBar">
                          <div 
                            className={`PasswordStrengthFill strength-${passwordStrength.strength}`}
                            style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                          ></div>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <small className="text-muted d-block mt-1">
                            Missing: {passwordStrength.feedback.join(', ')}
                          </small>
                        )}
                      </div>
                    )}
                  </Form.Group>

                  {/* Confirm Password Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <FaLock className="me-2 text-muted" />
                      Confirm Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        isInvalid={!!errors.confirmPassword}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="PasswordToggle"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Address Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <FaMapMarker className="me-2 text-muted" />
                      Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your full address (max 400 characters)"
                      isInvalid={!!errors.address}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.address}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {formData.address.length}/400 characters
                    </Form.Text>
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="RegistrationSubmitBtn"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="me-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Login Link */}
                  <div className="RegistrationFooter text-center">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="RegistrationLoginLink">
                        <FaArrowRight className="me-1" />
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Registration
