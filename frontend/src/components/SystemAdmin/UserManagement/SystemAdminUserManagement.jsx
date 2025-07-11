import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaStar, FaPlus, FaUser } from 'react-icons/fa'
import PageHeader from '../../Common/PageHeader'
import DataTable from '../../Common/DataTable'
import LoadingSpinner from '../../Common/LoadingSpinner'
import ErrorAlert from '../../Common/ErrorAlert'
import SearchFilter from '../../Common/SearchFilter'
import { systemAdminAPI } from '../../../api/SystemAdmin'
import '../../../styles/SystemAdmin/systemAdminUserManagement.css'

/**
 * System Admin User Management Component
 * Manages user operations including viewing, creating, and filtering users
 */
const SystemAdminUserManagement = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'normal_user',
    address: ''
  })
  const [createErrors, setCreateErrors] = useState({})
  const [createLoading, setCreateLoading] = useState(false)
  const [storeRatings, setStoreRatings] = useState({})
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  /**
   * Debounced search function to optimize API calls
   */
  const debounceSearch = useCallback((searchTerm, filters) => {
    const timer = setTimeout(() => {
      filterUsers(searchTerm, filters)
    }, 300)
    return () => clearTimeout(timer)
  }, [users])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const clearTimer = debounceSearch(searchValue, activeFilters)
    return clearTimer
  }, [searchValue, activeFilters, debounceSearch])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await systemAdminAPI.getUsers()
      if (response.success) {
        const userData = response.data.users || []
        setUsers(userData)
        setFilteredUsers(userData)
        setPagination(prev => ({
          ...prev,
          total: userData.length
        }))
        
        // Fetch store ratings for store owners
        await fetchStoreRatings(userData)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to load users')
      console.error('Users fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStoreRatings = async (users) => {
    try {
      const storeOwners = users.filter(user => user.role === 'store_owner')
      const storesResponse = await systemAdminAPI.getStores()
      
      if (storesResponse.success) {
        const stores = storesResponse.data.stores || []
        const ratingsMap = {}
        
        storeOwners.forEach(owner => {
          const ownerStores = stores.filter(store => store.owner_id === owner.id)
          if (ownerStores.length > 0) {
            const totalRating = ownerStores.reduce((sum, store) => sum + (parseFloat(store.average_rating) || 0), 0)
            const avgRating = totalRating / ownerStores.length
            const totalReviews = ownerStores.reduce((sum, store) => sum + (parseInt(store.total_ratings) || 0), 0)
            ratingsMap[owner.id] = {
              averageRating: avgRating.toFixed(1),
              totalRatings: totalReviews,
              storeCount: ownerStores.length
            }
          }
        })
        
        setStoreRatings(ratingsMap)
      }
    } catch (err) {
      console.error('Store ratings fetch error:', err)
    }
  }

  const filterUsers = (searchTerm, filters) => {
    let filtered = [...users]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role)
    }
    
    setFilteredUsers(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length, page: 1 }))
  }

  const handleSearchChange = (value) => {
    setSearchValue(value)
  }

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: value }))
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    // Validate form based on database constraints
    const newErrors = {}
    
    // Name validation (20-60 characters, letters and spaces only)
    if (!createFormData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (createFormData.name.trim().length < 20 || createFormData.name.trim().length > 60) {
      newErrors.name = 'Name must be between 20 and 60 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(createFormData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces'
    }
    
    // Email validation (max 255 characters)
    if (!createFormData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (createFormData.email.length > 255) {
      newErrors.email = 'Email cannot exceed 255 characters'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      newErrors.email = 'Please provide a valid email address'
    }
    
    // Password validation (8-16 characters, uppercase, special char)
    if (!createFormData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (createFormData.password.length < 8 || createFormData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters'
    } else if (!/(?=.*[A-Z])/.test(createFormData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(createFormData.password)) {
      newErrors.password = 'Password must contain at least one special character'
    } else if (!/^[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/.test(createFormData.password)) {
      newErrors.password = 'Password contains invalid characters'
    }
    
    // Role validation
    if (!createFormData.role) {
      newErrors.role = 'Role is required'
    } else if (!['system_admin', 'normal_user', 'store_owner'].includes(createFormData.role)) {
      newErrors.role = 'Invalid role specified'
    }
    
    // Address validation (required, max 400 characters)
    if (!createFormData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (createFormData.address.length > 400) {
      newErrors.address = 'Address cannot exceed 400 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors)
      return
    }

    setCreateLoading(true)
    try {
      const response = await systemAdminAPI.createUser(createFormData)
      if (response.success) {
        setShowCreateModal(false)
        setCreateFormData({
          name: '',
          email: '',
          password: '',
          role: 'normal_user',
          address: ''
        })
        setCreateErrors({})
        fetchUsers() // Refresh the list
      } else {
        setCreateErrors({ general: response.error })
      }
    } catch (err) {
      setCreateErrors({ general: 'Failed to create user' })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target
    setCreateFormData(prev => ({ ...prev, [name]: value }))
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const getRoleBadge = (role) => {
    const variants = {
      'system_admin': 'danger',
      'store_owner': 'warning',
      'normal_user': 'primary'
    }
    return (
      <Badge bg={variants[role] || 'secondary'}>
        {role?.replace('_', ' ')}
      </Badge>
    )
  }

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'role', 
      label: 'Role',
      render: (user) => getRoleBadge(user.role)
    },
    { 
      key: 'rating', 
      label: 'Rating',
      render: (user) => {
        if (user.role === 'store_owner') {
          const userRating = storeRatings[user.id]
          if (userRating) {
            return (
              <div className="d-flex align-items-center">
                <FaStar className="text-warning me-1" />
                <span>{userRating.averageRating}</span>
                <small className="text-muted ms-1">({userRating.totalRatings})</small>
              </div>
            )
          } else {
            return (
              <div className="d-flex align-items-center">
                <FaStar className="text-muted me-1" />
                <span className="text-muted">No store</span>
              </div>
            )
          }
        }
        return '-'
      }
    },
    { key: 'created_at', label: 'Created', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleViewUser(user)}
            title="View Details"
          >
            <FaEye />
          </Button>
        </div>
      )
    }
  ]

  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      placeholder: 'All Roles',
      options: [
        { value: 'system_admin', label: 'System Admin' },
        { value: 'store_owner', label: 'Store Owner' },
        { value: 'normal_user', label: 'Normal User' }
      ]
    }
  ]

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  if (loading) {
    return <LoadingSpinner message="Loading users..." />
  }

  return (
    <div className="SystemAdminUserManagement">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <div className="mb-3 mb-md-0">
            <h1>User Management</h1>
            <p className="mb-0">
              Manage system users and their roles efficiently with comprehensive tools.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="success" 
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus />
              <span className="d-none d-sm-inline">Create User</span>
              <span className="d-sm-none">Create</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-5">
        <Col xs={12} sm={6} lg={3} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaEye size={32} />
                </div>
              </div>
              <div className="stats-number">{pagination.total}</div>
              <div className="stats-label">Total Users</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaEye size={32} />
                </div>
              </div>
              <div className="stats-number">{filteredUsers.filter(u => u.role === 'system_admin').length}</div>
              <div className="stats-label">System Admins</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaStar size={32} />
                </div>
              </div>
              <div className="stats-number">{filteredUsers.filter(u => u.role === 'store_owner').length}</div>
              <div className="stats-label">Store Owners</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaEye size={32} />
                </div>
              </div>
              <div className="stats-number">{filteredUsers.filter(u => u.role === 'normal_user').length}</div>
              <div className="stats-label">Normal Users</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Users</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Search and Filter Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Search & Filter Users</h5>
        </Card.Header>
        <Card.Body>
          <SearchFilter
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            activeFilters={activeFilters}
            filters={filterOptions}
            placeholder="Search users by name, email, or address..."
          />
        </Card.Body>
      </Card>

      {/* Users Management Card */}
      <Card className="h-100">
        <Card.Header>
          <h5 className="mb-0">All Users ({pagination.total})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <DataTable
              data={filteredUsers}
              columns={tableColumns}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              onSizeChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
              loading={loading}
              emptyMessage="No users found"
              className="UserManagementDataTable"
              tableClassName="table table-hover mb-0"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" className="UserManagementCreateModal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Create New User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            {createErrors.general && (
              <Alert variant="danger" className="mb-3">
                {createErrors.general}
              </Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    placeholder="Enter full name (20-60 characters)"
                    isInvalid={!!createErrors.name}
                    className="UserManagementFormControl"
                  />
                  <Form.Control.Feedback type="invalid">
                    {createErrors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Must be 20-60 characters, letters and spaces only
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={createFormData.email}
                    onChange={handleCreateInputChange}
                    placeholder="Enter email address"
                    isInvalid={!!createErrors.email}
                    className="UserManagementFormControl"
                  />
                  <Form.Control.Feedback type="invalid">
                    {createErrors.email}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Must be a valid email address (max 255 characters)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={createFormData.password}
                    onChange={handleCreateInputChange}
                    placeholder="Enter password (8-16 characters)"
                    isInvalid={!!createErrors.password}
                    className="UserManagementFormControl"
                  />
                  <Form.Control.Feedback type="invalid">
                    {createErrors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    8-16 characters, must include uppercase and special character
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={createFormData.role}
                    onChange={handleCreateInputChange}
                    isInvalid={!!createErrors.role}
                    className="UserManagementFormControl"
                  >
                    <option value="normal_user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="system_admin">System Admin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {createErrors.role}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Select the appropriate role for the user
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={createFormData.address}
                onChange={handleCreateInputChange}
                placeholder="Enter address (max 400 characters)"
                isInvalid={!!createErrors.address}
                className="UserManagementFormControl"
              />
              <Form.Control.Feedback type="invalid">
                {createErrors.address}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Required field, maximum 400 characters
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowCreateModal(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={createLoading}
            >
              {createLoading ? 'Creating...' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View User Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" className="UserViewModal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            User Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="user-details">
              <Row>
                <Col md={6}>
                  <div className="detail-item mb-3">
                    <label className="detail-label">Name</label>
                    <div className="detail-value">{selectedUser.name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item mb-3">
                    <label className="detail-label">Email</label>
                    <div className="detail-value">{selectedUser.email}</div>
                  </div>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <div className="detail-item mb-3">
                    <label className="detail-label">Role</label>
                    <div className="detail-value">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                </Col>
                {selectedUser.role === 'store_owner' && (
                  <Col md={6}>
                    <div className="detail-item mb-3">
                      <label className="detail-label">Rating</label>
                      <div className="detail-value">
                        {storeRatings[selectedUser.id] ? (
                          <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-1" />
                            <span className="me-1">{storeRatings[selectedUser.id].averageRating}</span>
                            <small className="text-muted">({storeRatings[selectedUser.id].totalRatings} reviews)</small>
                          </div>
                        ) : (
                          <span className="text-muted">No ratings yet</span>
                        )}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
              
              <div className="detail-item mb-3">
                <label className="detail-label">Address</label>
                <div className="detail-value">{selectedUser.address || 'No address provided'}</div>
              </div>
              
              <div className="detail-item mb-3">
                <label className="detail-label">Created</label>
                <div className="detail-value">{new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Last Updated</label>
                <div className="detail-value">{new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default SystemAdminUserManagement
