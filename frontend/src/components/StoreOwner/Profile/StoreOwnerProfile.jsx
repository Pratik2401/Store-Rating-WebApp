import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSave } from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContext'
import { showSuccessAlert, showErrorAlert, showLoadingAlert } from '../../../utils/SweetAlert'
import LoadingSpinner from '../../Common/LoadingSpinner'
import PageHeader from '../../Common/PageHeader'
import '../../../styles/components/UserProfile.css'

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const { user, storeOwnerAPI } = useAuth()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Demo data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProfile = {
        name: user?.name || 'Demo Store Owner',
        email: user?.email || 'store.owner@example.com',
        address: '123 Business District, Commerce City, NY 10001',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }

      setProfileData(mockProfile)
    } catch (err) {
      showErrorAlert('Error', 'Failed to load profile data.')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
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
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (profileData.name.trim().length < 20) {
      newErrors.name = 'Name must be at least 20 characters long'
    } else if (profileData.name.trim().length > 60) {
      newErrors.name = 'Name must not exceed 60 characters'
    }

    // Email validation
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Address validation
    if (!profileData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (profileData.address.trim().length > 400) {
      newErrors.address = 'Address must not exceed 400 characters'
    }

    // Password validation (only if changing password)
    if (profileData.newPassword || profileData.confirmPassword || profileData.currentPassword) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password'
      }

      if (!profileData.newPassword) {
        newErrors.newPassword = 'New password is required'
      } else if (profileData.newPassword.length < 8 || profileData.newPassword.length > 16) {
        newErrors.newPassword = 'Password must be 8-16 characters long'
      } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(profileData.newPassword)) {
        newErrors.newPassword = 'Password must include at least one uppercase letter and one special character'
      }

      if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setUpdating(true)
      showLoadingAlert('Updating Profile', 'Please wait while we update your profile...')

      // Demo API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate API response
      const success = Math.random() > 0.1 // 90% success rate for demo

      if (success) {
        showSuccessAlert('Profile Updated', 'Your profile has been updated successfully!')
        
        // Clear password fields after successful update
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        throw new Error('Update failed')
      }
    } catch (err) {
      showErrorAlert('Update Failed', 'Failed to update profile. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setUpdating(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword)
        break
      case 'new':
        setShowNewPassword(!showNewPassword)
        break
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword)
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="StoreOwnerProfileLoading d-flex justify-content-center align-items-center">
        <div className="StoreOwnerProfileLoadingContent text-center">
          <Spinner animation="border" variant="primary" className="StoreOwnerProfileLoadingSpinner mb-3" />
          <p className="StoreOwnerProfileLoadingText text-muted">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="StoreOwnerProfileContainer">
      {/* Page Header */}
      <div className="StoreOwnerProfileHeader mb-4">
        <h1 className="StoreOwnerProfileTitle fw-bold mb-2">Profile Settings</h1>
        <p className="StoreOwnerProfileSubtitle text-muted">
          Manage your account information and security settings.
        </p>
      </div>

      <Row>
        <Col xs={12} lg={8}>
          <Card className="StoreOwnerProfileCard shadow-sm">
            <Card.Header className="StoreOwnerProfileCardHeader bg-light border-0">
              <h5 className="StoreOwnerProfileCardTitle mb-0 fw-bold">
                <FaUser className="me-2" />
                Account Information
              </h5>
            </Card.Header>
            <Card.Body className="StoreOwnerProfileCardBody">
              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Row>
                  <Col xs={12}>
                    <h6 className="StoreOwnerProfileSectionTitle fw-bold text-primary mb-3">Basic Information</h6>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="StoreOwnerProfileFormGroup mb-3">
                      <Form.Label className="StoreOwnerProfileFormLabel fw-medium">Store Owner Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`StoreOwnerProfileFormControl ${errors.name ? 'is-invalid' : ''}`}
                        disabled={updating}
                      />
                      {errors.name && (
                        <Form.Control.Feedback type="invalid" className="StoreOwnerProfileFormError">
                          {errors.name}
                        </Form.Control.Feedback>
                      )}
                      <Form.Text className="StoreOwnerProfileFormText text-muted">
                        20-60 characters required
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group className="StoreOwnerProfileFormGroup mb-3">
                      <Form.Label className="StoreOwnerProfileFormLabel fw-medium">Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className={`StoreOwnerProfileFormControl ${errors.email ? 'is-invalid' : ''}`}
                        disabled={updating}
                      />
                      {errors.email && (
                        <Form.Control.Feedback type="invalid" className="StoreOwnerProfileFormError">
                          {errors.email}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12}>
                    <Form.Group className="StoreOwnerProfileFormGroup mb-4">
                      <Form.Label className="StoreOwnerProfileFormLabel fw-medium">Address *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your store address"
                        className={`StoreOwnerProfileFormControl ${errors.address ? 'is-invalid' : ''}`}
                        disabled={updating}
                      />
                      {errors.address && (
                        <Form.Control.Feedback type="invalid" className="StoreOwnerProfileFormError">
                          {errors.address}
                        </Form.Control.Feedback>
                      )}
                      <Form.Text className="StoreOwnerProfileFormText text-muted">
                        Maximum 400 characters
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Password Change Section */}
                <Row>
                  <Col xs={12}>
                    <h6 className="StoreOwnerProfileSectionTitle fw-bold text-primary mb-3">
                      <FaLock className="me-2" />
                      Change Password
                    </h6>
                    <p className="StoreOwnerProfileSectionDescription text-muted small mb-3">
                      Leave password fields empty if you don't want to change your password.
                    </p>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={4}>
                    <Form.Group className="StoreOwnerProfileFormGroup mb-3">
                      <Form.Label className="StoreOwnerProfileFormLabel fw-medium">Current Password</Form.Label>
                      <div className="StoreOwnerProfilePasswordContainer position-relative">
                        <Form.Control
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={profileData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Enter current password"
                          className={`StoreOwnerProfileFormControl pe-5 ${errors.currentPassword ? 'is-invalid' : ''}`}
                          disabled={updating}
                        />
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="StoreOwnerProfilePasswordToggle position-absolute border-0 p-0 text-muted"
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        {errors.currentPassword && (
                          <Form.Control.Feedback type="invalid" className="StoreOwnerProfileFormError">
                            {errors.currentPassword}
                          </Form.Control.Feedback>
                        )}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={4}>
                    <Form.Group className="StoreOwnerProfileFormGroup mb-3">
                      <Form.Label className="StoreOwnerProfileFormLabel fw-medium">New Password</Form.Label>
                      <div className="StoreOwnerProfilePasswordContainer position-relative">
                        <Form.Control
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={profileData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                          className={`StoreOwnerProfileFormControl pe-5 ${errors.newPassword ? 'is-invalid' : ''}`}
                          disabled={updating}
                        />
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="StoreOwnerProfilePasswordToggle position-absolute border-0 p-0 text-muted"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        {errors.newPassword && (
                          <Form.Control.Feedback type="invalid" className="StoreOwnerProfileFormError">
                            {errors.newPassword}
                          </Form.Control.Feedback>
                        )}
                      </div>
                      <Form.Text className="StoreOwnerProfileFormText text-muted">
                        8-16 chars, 1 uppercase, 1 special character
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={4}>
                    <Form.Group className="StoreOwnerProfileFormGroup mb-3">
                      <Form.Label className="StoreOwnerProfileFormLabel fw-medium">Confirm New Password</Form.Label>
                      <div className="StoreOwnerProfilePasswordContainer position-relative">
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={profileData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          className={`StoreOwnerProfileFormControl pe-5 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          disabled={updating}
                        />
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="StoreOwnerProfilePasswordToggle position-absolute border-0 p-0 text-muted"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        {errors.confirmPassword && (
                          <Form.Control.Feedback type="invalid" className="StoreOwnerProfileFormError">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Submit Button */}
                <Row>
                  <Col xs={12}>
                    <div className="StoreOwnerProfileActions d-flex justify-content-end mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={updating}
                        className="StoreOwnerProfileSubmitButton"
                      >
                        {updating ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Summary Sidebar */}
        <Col xs={12} lg={4}>
          <Card className="StoreOwnerProfileSummaryCard shadow-sm">
            <Card.Header className="StoreOwnerProfileSummaryHeader bg-primary text-white border-0">
              <h6 className="StoreOwnerProfileSummaryTitle mb-0 fw-bold">
                Profile Summary
              </h6>
            </Card.Header>
            <Card.Body className="StoreOwnerProfileSummaryBody text-center">
              <div className="StoreOwnerProfileSummaryAvatar bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <h5 className="StoreOwnerProfileSummaryName fw-bold mb-2">{profileData.name}</h5>
              <p className="StoreOwnerProfileSummaryEmail text-muted mb-2">{profileData.email}</p>
              <Badge bg="success" className="StoreOwnerProfileSummaryBadge mb-3">Store Owner</Badge>
              <hr className="StoreOwnerProfileSummaryDivider" />
              <div className="StoreOwnerProfileSummaryInfo text-start">
                <h6 className="StoreOwnerProfileSummaryInfoTitle fw-bold mb-2">Account Information</h6>
                <div className="StoreOwnerProfileSummaryInfoItem mb-2">
                  <strong>Role:</strong> Store Owner
                </div>
                <div className="StoreOwnerProfileSummaryInfoItem mb-2">
                  <strong>Status:</strong> <span className="text-success">Active</span>
                </div>
                <div className="StoreOwnerProfileSummaryInfoItem">
                  <strong>Member Since:</strong> January 2024
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
