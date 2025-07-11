import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { validateForm } from '../../utils/validation'
import LoadingSpinner from './LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { adminAPI } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Clear register error
    if (registerError) {
      setRegisterError('')
    }
  }

  const validateFormData = () => {
    const validation = validateForm(formData, ['name', 'email', 'address', 'password'])
    const newErrors = { ...validation.errors }
    
    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateFormData()) {
      return
    }
    
    setLoading(true)
    setRegisterError('')
    
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
        role: 'normal_user'
      }
      
      const result = await adminAPI.createUser(userData)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setRegisterError(result.error)
      }
    } catch (error) {
      setRegisterError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Creating your account..." fullPage />
  }

  if (success) {
    return (
      <Container fluid className="RegisterSuccessContainer min-vh-100 bg-light">
        <Row className="RegisterSuccessRow justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={4} className="RegisterSuccessCol">
            <Card className="RegisterSuccessCard shadow-lg border-0">
              <Card.Body className="RegisterSuccessCardBody text-center p-5">
                <div className="RegisterSuccessIcon text-success mb-3">
                  <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="RegisterSuccessTitle text-success mb-3">Registration Successful!</h3>
                <p className="RegisterSuccessMessage text-muted">
                  Your account has been created successfully. You will be redirected to the login page shortly.
                </p>
                <div className="RegisterSuccessSpinner mt-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Redirecting...</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid className="RegisterContainer min-vh-100 bg-light">
      <Row className="RegisterRow justify-content-center align-items-center min-vh-100 py-5">
        <Col md={8} lg={6} className="RegisterCol">
          <Card className="RegisterCard shadow-lg border-0">
            <Card.Header className="RegisterCardHeader bg-success text-white text-center">
              <h3 className="RegisterTitle mb-0">Create Account</h3>
              <p className="RegisterSubtitle mb-0">Join our store rating platform</p>
            </Card.Header>
            <Card.Body className="RegisterCardBody p-4">
              {registerError && (
                <Alert variant="danger" className="RegisterAlert">
                  {registerError}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} className="RegisterForm">
                <Form.Group className="RegisterFormGroup mb-3">
                  <Form.Label className="RegisterFormLabel">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name (20-60 characters)"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    className="RegisterFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="RegisterFormError">
                    {errors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="RegisterFormHelp text-muted">
                    Name must be between 20-60 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="RegisterFormGroup mb-3">
                  <Form.Label className="RegisterFormLabel">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    className="RegisterFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="RegisterFormError">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="RegisterFormGroup mb-3">
                  <Form.Label className="RegisterFormLabel">Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    placeholder="Enter your address (max 400 characters)"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!errors.address}
                    className="RegisterFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="RegisterFormError">
                    {errors.address}
                  </Form.Control.Feedback>
                  <Form.Text className="RegisterFormHelp text-muted">
                    Maximum 400 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="RegisterFormGroup mb-3">
                  <Form.Label className="RegisterFormLabel">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                    className="RegisterFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="RegisterFormError">
                    {errors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="RegisterFormHelp text-muted">
                    8-16 characters, must include at least one uppercase letter and one special character
                  </Form.Text>
                </Form.Group>

                <Form.Group className="RegisterFormGroup mb-4">
                  <Form.Label className="RegisterFormLabel">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.confirmPassword}
                    className="RegisterFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="RegisterFormError">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="RegisterFormActions d-grid">
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    disabled={loading}
                    className="RegisterSubmitButton"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="RegisterCardFooter text-center bg-light">
              <div className="RegisterFooterContent">
                <p className="RegisterFooterText mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="RegisterFooterLink">
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Register
