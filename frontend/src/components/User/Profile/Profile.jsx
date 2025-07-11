import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap'
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContext'
import { showSuccessAlert, showErrorAlert } from '../../../utils/SweetAlert'
import LoadingSpinner from '../../Common/LoadingSpinner'
import { userAPI } from '../../../api/User'
import { validatePassword } from '../../../utils/validation'
import '../../../styles/User/userProfile.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    address: ''
  })
  const [originalProfile, setOriginalProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordLoading, setPasswordLoading] = useState(false)
  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  useEffect(() => {
    if (user) {
      console.log('User from context:', user); // Debug log
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Call the real API to load user profile
      const profileData = await userAPI.getProfile()
      
      if (profileData && profileData.data) {
        console.log('Profile data from API:', profileData.data); // Debug log
        const userProfile = {
          name: profileData.data.name || user?.name || '',
          email: profileData.data.email || user?.email || '',
          address: profileData.data.address || ''
        }

        console.log('User profile after mapping:', userProfile); // Debug log
        setProfile(userProfile)
        setOriginalProfile(userProfile)
      } else {
        // Fallback to user data from auth context
        const userProfile = {
          name: user?.name || '',
          email: user?.email || '',
          address: user?.address || ''
        }

        setProfile(userProfile)
        setOriginalProfile(userProfile)
      }
    } catch (err) {
      console.error('Profile loading error:', err)
      // Fallback to user data from auth context on error
      const userProfile = {
        name: user?.name || '',
        email: user?.email || '',
        address: user?.address || ''
      }

      setProfile(userProfile)
      setOriginalProfile(userProfile)
      
      const errorMessage = err.response?.data?.message || 'Failed to load profile data. Using cached data.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - restore original values
      setProfile(originalProfile)
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')
      
      // Call the real API to update profile
      await userAPI.updateProfile({
        name: profile.name,
        email: profile.email,
        address: profile.address
      })
      
      // Update original profile with saved values
      setOriginalProfile(profile)
      setIsEditing(false)
      
      // Update auth context if needed
      if (updateUser) {
        updateUser({
          ...user,
          name: profile.name,
          email: profile.email
        })
      }
      
      showSuccessAlert('Success', 'Profile updated successfully!')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save profile. Please try again.'
      setError(errorMessage)
      showErrorAlert('Error', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRating = async (ratingId) => {
    try {
      // Call the real API to delete the rating
      await userAPI.deleteRating(ratingId)
      
      setUserRatings(userRatings.filter(rating => rating.id !== ratingId))
      setShowDeleteModal(false)
      setRatingToDelete(null)
      
      showSuccessAlert('Success', 'Rating deleted successfully!')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete rating. Please try again.'
      showErrorAlert('Error', errorMessage)
    }
  }

  const renderStarRating = (rating) => {
    const numRating = Number(rating) || 0;
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= numRating ? 'text-warning' : 'text-muted'}
          style={{ marginRight: '0.125rem' }}
        />
      )
    }
    return <div className="d-flex align-items-center rating-stars">{stars}</div>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Password validation helper function for real-time feedback
  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 8 && password.length <= 16,
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  }
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validatePasswordChange = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else {
      // Use the same validation as login
      const passwordError = validatePassword(passwordData.newPassword)
      if (passwordError) {
        newErrors.newPassword = passwordError
      }
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }
    
    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordChange()) {
      return
    }
    
    try {
      setPasswordLoading(true)
      
      // Call the real API to change password
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
      
      showSuccessAlert('Success', 'Password changed successfully!')
    } catch (err) {
      // Handle specific error messages from the API
      let errorMessage = 'Failed to change password. Please try again.'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Handle validation errors from backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.join(', ')
      }
      
      showErrorAlert('Error', errorMessage)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner"></div>
        <p className="text-muted">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {/* Profile Header Card */}
      
      {/* Error Alert */}
      {error && (
        <div className="profile-error-alert">
          <p className="profile-error-text">{error}</p>
        </div>
      )}

      {/* Profile Information Card */}
      <div className="profile-form-card slide-up">
        <div className="profile-form-header">
          <h5>
            <FaUser />
            Personal Information
          </h5>
        </div>
        <div className="profile-form-body">
          <Form onSubmit={handleSaveProfile}>
            <Row>
              <Col md={6}>
                <div className="profile-form-group">
                  <Form.Label className="profile-form-label">
                    <FaUser className="text-primary" />
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="profile-form-control"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="profile-form-group">
                  <Form.Label className="profile-form-label">
                    <FaEnvelope className="text-primary" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="profile-form-control"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <div className="profile-form-group">
                  <Form.Label className="profile-form-label">
                    <FaMapMarkerAlt className="text-primary" />
                    Address
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={profile.address || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="profile-form-control"
                    placeholder="Enter your address"
                  />
                </div>
              </Col>
            </Row>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="btn-profile-outline"
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-profile-primary"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleEditToggle}
                  className="btn-profile-primary"
                >
                  <FaEdit className="me-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="profile-form-card slide-up">
        <div className="profile-form-header">
          <h5>
            <FaEdit />
            Change Password
          </h5>
        </div>
        <div className="profile-form-body">
          <Form onSubmit={handlePasswordSubmit}>
            <Row>
              <Col md={8}>
                <div className="profile-form-group">
                  <Form.Label className="profile-form-label">
                    Current Password
                  </Form.Label>
                  <div className="password-input-container position-relative">
                    <Form.Control
                      type={showPasswords.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="profile-form-control"
                      placeholder="Enter your current password"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <span 
                      className="password-toggle-icon" 
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      style={{ 
                        position: 'absolute', 
                        right: '15px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer',
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '0 5px'
                      }}
                    >
                      {showPasswords.currentPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {passwordErrors.currentPassword && (
                    <div className="form-error-text">{passwordErrors.currentPassword}</div>
                  )}
                </div>

                <div className="profile-form-group">
                  <Form.Label className="profile-form-label">
                    New Password
                  </Form.Label>
                  <div className="password-input-container position-relative">
                    <Form.Control
                      type={showPasswords.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="profile-form-control"
                      placeholder="Enter your new password"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <span 
                      className="password-toggle-icon" 
                      onClick={() => togglePasswordVisibility('newPassword')}
                      style={{ 
                        position: 'absolute', 
                        right: '15px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer',
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '0 5px'
                      }}
                    >
                      {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {passwordErrors.newPassword && (
                    <div className="form-error-text">{passwordErrors.newPassword}</div>
                  )}
                  
                  {passwordData.newPassword && (
                    <div className="password-requirements">
                      <h6>Password Requirements:</h6>
                      <div className={`password-requirement ${getPasswordRequirements(passwordData.newPassword).length ? 'valid' : 'invalid'}`}>
                        <span>{getPasswordRequirements(passwordData.newPassword).length ? '✓' : '✗'}</span>
                        8-16 characters long
                      </div>
                      <div className={`password-requirement ${getPasswordRequirements(passwordData.newPassword).uppercase ? 'valid' : 'invalid'}`}>
                        <span>{getPasswordRequirements(passwordData.newPassword).uppercase ? '✓' : '✗'}</span>
                        At least one uppercase letter
                      </div>
                      <div className={`password-requirement ${getPasswordRequirements(passwordData.newPassword).special ? 'valid' : 'invalid'}`}>
                        <span>{getPasswordRequirements(passwordData.newPassword).special ? '✓' : '✗'}</span>
                        At least one special character
                      </div>
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <Form.Label className="profile-form-label">
                    Confirm New Password
                  </Form.Label>
                  <div className="password-input-container position-relative">
                    <Form.Control
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="profile-form-control"
                      placeholder="Confirm your new password"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <span 
                      className="password-toggle-icon" 
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      style={{ 
                        position: 'absolute', 
                        right: '15px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer',
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '0 5px'
                      }}
                    >
                      {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <div className="form-error-text">{passwordErrors.confirmPassword}</div>
                  )}
                </div>

                <div className="profile-actions">
                 
                  
                  <Button 
                    type="submit" 
                    disabled={passwordLoading}
                    className="btn-profile-primary"
                  >
                    {passwordLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Profile
