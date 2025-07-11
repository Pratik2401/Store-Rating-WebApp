import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaMobile, FaDesktop } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { showErrorAlert, showSuccessAlert, showLoadingAlert, showToast } from '../../utils/SweetAlert'
import '../../styles/pages/login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors)
      showErrorAlert('Validation Error', errorMessages.join('\n'))
      return
    }

    setLoading(true)
    const loadingAlert = showLoadingAlert('Signing In...', 'Please wait while we verify your credentials')

    try {
      const result = await login(formData.email, formData.password)
      
      loadingAlert.close()
      
      if (result.success) {
        showSuccessAlert('Welcome!', `Hello ${result.user.name}, you have successfully logged in.`).then(() => {
          // Redirect based on user role
          switch (result.user.role) {
            case 'system_admin':
              navigate('/admin/dashboard')
              break
            case 'normal_user':
              navigate('/user/dashboard')
              break
            case 'store_owner':
              navigate('/store/dashboard')
              break
            default:
              navigate('/unauthorized')
          }
        })
      } else {
        showErrorAlert('Login Failed', result.error || 'Please check your credentials and try again.')
      }
    } catch (error) {
      loadingAlert.close()
      showErrorAlert('Unexpected Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="LoginPageContainer min-vh-100 d-flex align-items-center">
      <Container fluid className="LoginPageContainerFluid">
        <Row className="LoginPageRow justify-content-center min-vh-100 align-items-center mx-0">
          <Col xs={12} sm={10} md={8} lg={6} xl={4} className="LoginPageCol">
            <Card className="LoginCard shadow-lg border-0">
              <Card.Body className="LoginCardBody p-3 p-sm-4 p-md-5">
                {/* Header */}
                <div className="LoginHeader text-center mb-4">
                  <div className="LoginIconContainer mb-3">
                    <div className="LoginIcon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center">
                      <FaUser size={24} />
                    </div>
                  </div>
                  <h2 className="LoginTitle fw-bold text-dark mb-1 fs-3 fs-md-2">User Login</h2>
                  <p className="LoginSubtitle text-muted mb-0 small">Store Rating Platform</p>
                  
                  {/* Device indicator */}
                  <div className="LoginDeviceIndicator mt-2 d-flex justify-content-center align-items-center">
                    <span className="LoginDeviceIcon me-2 text-muted">
                      <FaDesktop className="d-none d-md-inline" />
                      <FaMobile className="d-md-none" />
                    </span>
                    <small className="LoginDeviceText text-muted">
                      <span className="d-none d-md-inline">Desktop Experience</span>
                      <span className="d-md-none">Mobile Experience</span>
                    </small>
                  </div>
                </div>

                {/* Login Form */}
                <Form onSubmit={handleSubmit} className="LoginForm">
                  {/* Email Field */}
                  <Form.Group className="LoginEmailGroup mb-3">
                    <Form.Label className="LoginEmailLabel fw-medium small">Email Address</Form.Label>
                    <div className="LoginEmailInputContainer position-relative">
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={`LoginEmailInput ps-5 ${errors.email ? 'is-invalid' : ''}`}
                        size="lg"
                      />
                      <FaUser className="LoginEmailIcon position-absolute text-muted" />
                      {errors.email && (
                        <Form.Control.Feedback type="invalid" className="LoginEmailError">
                          {errors.email}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="LoginPasswordGroup mb-4">
                    <Form.Label className="LoginPasswordLabel fw-medium small">Password</Form.Label>
                    <div className="LoginPasswordInputContainer position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className={`LoginPasswordInput ps-5 pe-5 ${errors.password ? 'is-invalid' : ''}`}
                        size="lg"
                      />
                      <FaLock className="LoginPasswordIcon position-absolute text-muted" />
                      <Button
                        variant="link"
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="LoginPasswordToggle position-absolute border-0 p-0 text-muted"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                      {errors.password && (
                        <Form.Control.Feedback type="invalid" className="LoginPasswordError">
                          {errors.password}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="LoginButton w-100 fw-medium"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="LoginSubmitSpinner me-2"
                        />
                        <span className="d-none d-sm-inline">Signing In...</span>
                        <span className="d-sm-none">Please wait...</span>
                      </>
                    ) : (
                      <>
                        <span className="d-none d-sm-inline">Sign In</span>
                        <span className="d-sm-none">Login</span>
                      </>
                    )}
                  </Button>
                </Form>

                {/* Demo Credentials */}
                <div className="LoginDemoSection mt-4 pt-3 border-top">
                  <p className="LoginDemoTitle text-center text-muted small mb-2">Demo Credentials:</p>
                  <div className="LoginDemoCredentials">
                    <Row className="text-center g-2">
                      <Col xs={12} sm={4}>
                        <div className="LoginDemoCard border rounded p-2">
                          <small className="LoginDemoRoleTitle fw-bold text-primary d-block">Admin</small>
                          <small className="LoginDemoText text-muted d-block">admin@storeplatform.com</small>
                          <small className="LoginDemoText text-muted d-block">Admin@123</small>
                        </div>
                      </Col>
                      <Col xs={12} sm={4}>
                        <div className="LoginDemoCard border rounded p-2">
                          <small className="LoginDemoRoleTitle fw-bold text-success d-block">User</small>
                          <small className="LoginDemoText text-muted d-block">john.smith@email.com</small>
                          <small className="LoginDemoText text-muted d-block">User@123</small>
                        </div>
                      </Col>
                      <Col xs={12} sm={4}>
                        <div className="LoginDemoCard border rounded p-2">
                          <small className="LoginDemoRoleTitle fw-bold text-warning d-block">Owner</small>
                          <small className="LoginDemoText text-muted d-block">robert.lee@businessemail.com</small>
                          <small className="LoginDemoText text-muted d-block">Owner@123</small>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Footer */}
                <div className="LoginFooter text-center mt-3">
                  <small className="LoginFooterText text-muted">
                    <span className="d-none d-sm-inline">Don't have an account? </span>
                    <a href="/register" className="LoginRegisterLink text-decoration-none">
                      <span className="d-none d-sm-inline">Register here</span>
                      <span className="d-sm-none">Register</span>
                    </a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
