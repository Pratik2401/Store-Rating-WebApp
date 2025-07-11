import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Table } from 'react-bootstrap'
import { FaArrowLeft, FaEdit, FaTrash, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaShieldAlt, FaClock } from 'react-icons/fa'
import { systemAdminAPI } from '../../../api/SystemAdmin'
import PageHeader from '../../Common/PageHeader'
import '../../../styles/SystemAdmin/userDetails.css'

const UserDetails = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await systemAdminAPI.getUserById(userId)
      if (response.success) {
        setUser(response.data)
      } else {
        setError(response.error || 'Failed to fetch user details')
      }
    } catch (err) {
      setError('Failed to load user details')
      console.error('User details error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeVariant = (role) => {
    switch(role) {
      case 'system_admin': return 'danger'
      case 'store_owner': return 'warning'
      case 'normal_user': return 'primary'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await systemAdminAPI.deleteUser(userId)
        if (response.success) {
          navigate('/admin/users', { 
            state: { message: 'User deleted successfully' }
          })
        } else {
          setError('Failed to delete user: ' + response.error)
        }
      } catch (error) {
        setError('Failed to delete user: ' + error.message)
      }
    }
  }

  if (loading) {
    return (
      <Container fluid className="UserDetailsPage">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p>Loading user details...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container fluid className="UserDetailsPage">
        <PageHeader 
          title="User Details" 
          subtitle="View and manage user information"
        />
        <Alert variant="danger">
          <Alert.Heading>Error Loading User</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={fetchUserDetails}>
              Try Again
            </Button>
            <Button variant="secondary" as={Link} to="/admin/users">
              Back to Users
            </Button>
          </div>
        </Alert>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container fluid className="UserDetailsPage">
        <PageHeader 
          title="User Details" 
          subtitle="View and manage user information"
        />
        <Alert variant="warning">
          <Alert.Heading>User Not Found</Alert.Heading>
          <p>The requested user could not be found.</p>
          <Button variant="secondary" as={Link} to="/admin/users">
            Back to Users
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="UserDetailsPage">
      <PageHeader 
        title="User Details" 
        subtitle="View and manage user information"
        actionButton={
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              as={Link} 
              to="/admin/users"
              className="d-flex align-items-center gap-2"
            >
              <FaArrowLeft />
              Back to Users
            </Button>
            <Button 
              variant="outline-warning"
              as={Link}
              to={`/admin/users/${user.id}/edit`}
              className="d-flex align-items-center gap-2"
            >
              <FaEdit />
              Edit User
            </Button>
            <Button 
              variant="outline-danger"
              onClick={handleDeleteUser}
              className="d-flex align-items-center gap-2"
            >
              <FaTrash />
              Delete User
            </Button>
          </div>
        }
      />

      <Row>
        <Col xl={8} lg={7}>
          {/* Main User Information */}
          <Card className="UserDetailsCard mb-4">
            <Card.Header>
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaUser className="text-primary" />
                User Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Full Name</label>
                    <div className="UserDetailValue">
                      {user.name}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Email Address</label>
                    <div className="UserDetailValue d-flex align-items-center gap-2">
                      <FaEnvelope className="text-muted" />
                      {user.email}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Role</label>
                    <div className="UserDetailValue">
                      <Badge bg={getRoleBadgeVariant(user.role)} className="UserRoleBadge">
                        <FaShieldAlt className="me-1" />
                        {user.role?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>User ID</label>
                    <div className="UserDetailValue">
                      #{user.id}
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={12}>
                  <div className="UserDetailItem">
                    <label>Address</label>
                    <div className="UserDetailValue d-flex align-items-start gap-2">
                      <FaMapMarkerAlt className="text-muted mt-1" />
                      <span>{user.address || 'Not provided'}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Account Activity */}
          <Card className="UserDetailsCard">
            <Card.Header>
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaClock className="text-info" />
                Account Activity
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Account Created</label>
                    <div className="UserDetailValue d-flex align-items-center gap-2">
                      <FaCalendarAlt className="text-muted" />
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Last Updated</label>
                    <div className="UserDetailValue d-flex align-items-center gap-2">
                      <FaCalendarAlt className="text-muted" />
                      {formatDate(user.updated_at)}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Last Login</label>
                    <div className="UserDetailValue">
                      {user.last_login ? formatDate(user.last_login) : 'Never logged in'}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="UserDetailItem">
                    <label>Failed Login Attempts</label>
                    <div className="UserDetailValue">
                      <Badge bg={user.failed_login_attempts > 0 ? 'warning' : 'success'}>
                        {user.failed_login_attempts || 0}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>

              {user.locked_until && (
                <Row className="mt-3">
                  <Col md={12}>
                    <div className="UserDetailItem">
                      <label>Account Locked Until</label>
                      <div className="UserDetailValue">
                        <Badge bg="danger">
                          {formatDate(user.locked_until)}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={5}>
          {/* Quick Actions */}
          <Card className="UserDetailsCard mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  as={Link} 
                  to={`/admin/users/${user.id}/edit`}
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <FaEdit />
                  Edit User Details
                </Button>
                <Button 
                  variant="outline-info" 
                  disabled
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <FaEnvelope />
                  Send Email (Coming Soon)
                </Button>
                <Button 
                  variant="outline-warning" 
                  disabled
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <FaShieldAlt />
                  Reset Password (Coming Soon)
                </Button>
                <hr />
                <Button 
                  variant="outline-danger"
                  onClick={handleDeleteUser}
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <FaTrash />
                  Delete User
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* User Statistics */}
          {user.role === 'store_owner' && (
            <Card className="UserDetailsCard">
              <Card.Header>
                <h5 className="mb-0">Store Owner Statistics</h5>
              </Card.Header>
              <Card.Body>
                <div className="UserStatItem">
                  <span className="StatLabel">Stores Owned</span>
                  <span className="StatValue">{user.stores_count || 0}</span>
                </div>
                <div className="UserStatItem">
                  <span className="StatLabel">Average Rating</span>
                  <span className="StatValue">
                    {user.average_rating ? `${user.average_rating}/5.0` : 'No ratings'}
                  </span>
                </div>
                <div className="UserStatItem">
                  <span className="StatLabel">Total Ratings Received</span>
                  <span className="StatValue">{user.total_ratings || 0}</span>
                </div>
              </Card.Body>
            </Card>
          )}

          {user.role === 'normal_user' && (
            <Card className="UserDetailsCard">
              <Card.Header>
                <h5 className="mb-0">User Statistics</h5>
              </Card.Header>
              <Card.Body>
                <div className="UserStatItem">
                  <span className="StatLabel">Ratings Given</span>
                  <span className="StatValue">{user.ratings_given || 0}</span>
                </div>
                <div className="UserStatItem">
                  <span className="StatLabel">Average Rating Given</span>
                  <span className="StatValue">
                    {user.average_rating_given ? `${user.average_rating_given}/5.0` : 'No ratings'}
                  </span>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default UserDetails
