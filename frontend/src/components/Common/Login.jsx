import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail, validatePassword } from '../../utils/validation'
import { handleLoginSuccess, preventDefaultAndNavigate } from '../../utils/authNavigation'
import LoadingSpinner from './LoadingSpinner'

/**
 * Login component with form validation and authentication
 * Handles user authentication and redirects based on user role
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  /**
   * Handles form input changes and clears validation errors
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    if (loginError) {
      setLoginError('')
    }
  }

  /**
   * Validates form fields before submission
   */
  const validateForm = () => {
    const newErrors = {}
    
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    // Prevent default form submission
    preventDefaultAndNavigate(e)
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setLoginError('')
    
    try {
      const result = await login(formData.email, formData.password, formData.rememberMe)
      
      if (result.success) {
        // Use the new navigation helper for smooth navigation
        handleLoginSuccess(result.user)
      } else {
        setLoginError(result.error)
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Signing you in..." fullPage />
  }

  return (
    <Container fluid className="LoginContainer min-vh-100 bg-light">
      <Row className="LoginRow justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4} className="LoginCol">
          <Card className="LoginCard shadow-lg border-0">
            <Card.Header className="LoginCardHeader bg-primary text-white text-center">
              <h3 className="LoginTitle mb-0">Store Rating Platform</h3>
              <p className="LoginSubtitle mb-0">Sign in to your account</p>
            </Card.Header>
            <Card.Body className="LoginCardBody p-4">
              {loginError && (
                <Alert variant="danger" className="LoginAlert">
                  {loginError}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} className="LoginForm">
                <Form.Group className="LoginFormGroup mb-3">
                  <Form.Label className="LoginFormLabel">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    className="LoginFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="LoginFormError">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="LoginFormGroup mb-4">
                  <Form.Label className="LoginFormLabel">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                    className="LoginFormInput"
                  />
                  <Form.Control.Feedback type="invalid" className="LoginFormError">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="LoginFormGroup mb-4">
                  <Form.Check
                    type="checkbox"
                    name="rememberMe"
                    label="Remember me for 24 hours"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="LoginRememberMe"
                  />
                </Form.Group>

                <div className="LoginFormActions d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="LoginSubmitButton"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="LoginCardFooter text-center bg-light">
              <div className="LoginFooterContent">
                <p className="LoginFooterText mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="LoginFooterLink">
                    Sign up here
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

export default Login
