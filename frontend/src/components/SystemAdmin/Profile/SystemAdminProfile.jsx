import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Table, Modal, Spinner } from 'react-bootstrap'
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaShieldAlt, FaKey, FaHistory } from 'react-icons/fa'
import PageHeader from '../../Common/PageHeader'
import LoadingSpinner from '../../Common/LoadingSpinner'
import ErrorAlert from '../../Common/ErrorAlert'
import { useAuth } from '../../../contexts/AuthContext'
import { systemAdminAPI } from '../../../api/SystemAdmin'
import '../../../styles/SystemAdmin/systemAdminProfile.css'

const SystemAdminProfile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [activityLog, setActivityLog] = useState([])

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await systemAdminAPI.getProfile()
      if (response.success) {
        setProfileData(response.data)
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          bio: response.data.bio || ''
        })
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to load profile data')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityLog = async () => {
    try {
      const response = await systemAdminAPI.getActivityLog()
      if (response.success) {
        setActivityLog(response.data.activities || [])
      }
    } catch (err) {
      console.error('Activity log fetch error:', err)
    }
  }

  const handleEditProfile = () => {
    setShowEditModal(true)
    setFormErrors({})
    setError(null)
    setSuccess(null)
  }

  const handleChangePassword = () => {
    setShowPasswordModal(true)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setFormErrors({})
    setError(null)
    setSuccess(null)
  }

  const validateProfileForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateProfileForm()) return
    
    try {
      setSubmitting(true)
      setError(null)
      
      const response = await systemAdminAPI.updateProfile(formData)
      if (response.success) {
        setSuccess('Profile updated successfully')
        setShowEditModal(false)
        await fetchProfileData()
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to update profile')
      console.error('Profile update error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) return
    
    try {
      setSubmitting(true)
      setError(null)
      
      const response = await systemAdminAPI.changePassword(passwordData)
      if (response.success) {
        setSuccess('Password changed successfully')
        setShowPasswordModal(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to change password')
      console.error('Password change error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleBadge = (role) => {
    const variants = {
      'system_admin': 'danger',
      'store_owner': 'warning',
      'normal_user': 'primary'
    }
    return (
      <Badge bg={variants[role] || 'secondary'} className="fs-6">
        <FaShieldAlt className="me-1" />
        {role?.replace('_', ' ')}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'secondary',
      'suspended': 'danger'
    }
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  if (error && !profileData) {
    return <ErrorAlert message={error} />
  }

  return (
    <div className="SystemAdminProfile">
      <PageHeader
        title="System Admin Profile"
        subtitle="Manage your profile and account settings"
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Profile', active: true }
        ]}
      />

      <Container fluid>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Row>
          <Col lg={4} className="mb-4">
            <Card className="SystemAdminProfileCard">
              <Card.Body className="text-center">
                <div className="profile-avatar mb-3">
                  <div className="avatar-circle bg-primary text-white">
                    <FaUser size={40} />
                  </div>
                </div>
                <h4 className="mb-1">{profileData?.name || 'System Admin'}</h4>
                <p className="text-muted mb-2">{profileData?.email}</p>
                <div className="mb-3">
                  {getRoleBadge(profileData?.role)}
                </div>
                <div className="mb-3">
                  {getStatusBadge(profileData?.status)}
                </div>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={handleEditProfile}>
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline-secondary" onClick={handleChangePassword}>
                    <FaKey className="me-2" />
                    Change Password
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="SystemAdminProfileDetails mb-4">
              <Card.Header>
                <Card.Title className="mb-0">Profile Information</Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="profile-info-item mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-muted me-2" />
                        <strong>Full Name</strong>
                      </div>
                      <p className="ms-4">{profileData?.name || 'Not provided'}</p>
                    </div>
                    <div className="profile-info-item mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaEnvelope className="text-muted me-2" />
                        <strong>Email</strong>
                      </div>
                      <p className="ms-4">{profileData?.email || 'Not provided'}</p>
                    </div>
                    <div className="profile-info-item mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaPhone className="text-muted me-2" />
                        <strong>Phone</strong>
                      </div>
                      <p className="ms-4">{profileData?.phone || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="profile-info-item mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaMapMarkerAlt className="text-muted me-2" />
                        <strong>Address</strong>
                      </div>
                      <p className="ms-4">{profileData?.address || 'Not provided'}</p>
                    </div>
                    <div className="profile-info-item mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendarAlt className="text-muted me-2" />
                        <strong>Member Since</strong>
                      </div>
                      <p className="ms-4">
                        {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                    <div className="profile-info-item mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendarAlt className="text-muted me-2" />
                        <strong>Last Login</strong>
                      </div>
                      <p className="ms-4">
                        {profileData?.last_login ? new Date(profileData.last_login).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </Col>
                </Row>
                {profileData?.bio && (
                  <div className="profile-info-item">
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-muted me-2" />
                      <strong>Bio</strong>
                    </div>
                    <p className="ms-4">{profileData.bio}</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="SystemAdminActivityLog">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Recent Activity</Card.Title>
                <Button variant="outline-primary" size="sm" onClick={fetchActivityLog}>
                  <FaHistory className="me-1" />
                  Refresh
                </Button>
              </Card.Header>
              <Card.Body>
                {activityLog.length > 0 ? (
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Date</th>
                        <th>IP Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((activity, index) => (
                        <tr key={index}>
                          <td>{activity.description}</td>
                          <td>{new Date(activity.date).toLocaleString()}</td>
                          <td>{activity.ip_address}</td>
                          <td>
                            <Badge bg={activity.status === 'success' ? 'success' : 'warning'}>
                              {activity.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center text-muted">
                    No recent activity found
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProfileSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    isInvalid={!!formErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    isInvalid={!!formErrors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleProfileSubmit}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                isInvalid={!!formErrors.currentPassword}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.currentPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                isInvalid={!!formErrors.newPassword}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                isInvalid={!!formErrors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePasswordSubmit}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default SystemAdminProfile
