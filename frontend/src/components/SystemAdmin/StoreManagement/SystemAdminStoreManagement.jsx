import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Button, Badge, Modal, Alert, Form } from 'react-bootstrap'
import { FaEye, FaStar, FaMapMarkerAlt, FaStore, FaPlus } from 'react-icons/fa'
import PageHeader from '../../Common/PageHeader'
import DataTable from '../../Common/DataTable'
import LoadingSpinner from '../../Common/LoadingSpinner'
import ErrorAlert from '../../Common/ErrorAlert'
import SearchFilter from '../../Common/SearchFilter'
import { systemAdminAPI } from '../../../api/SystemAdmin'
import '../../../styles/SystemAdmin/systemAdminStoreManagement.css'

/**
 * System Admin Store Management Component
 * Manages store operations including viewing, creating, and monitoring store metrics
 */
const SystemAdminStoreManagement = () => {
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  })
  const [createErrors, setCreateErrors] = useState({})
  const [createLoading, setCreateLoading] = useState(false)
  const [storeOwners, setStoreOwners] = useState([])

  /**
   * Debounced search function to optimize API calls
   */
  const debounceSearch = useCallback((searchTerm) => {
    const timer = setTimeout(() => {
      filterStores(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [stores])

  useEffect(() => {
    fetchStores()
    fetchStoreOwners()
  }, [])

  useEffect(() => {
    const clearTimer = debounceSearch(searchValue)
    return clearTimer
  }, [searchValue, debounceSearch])

  /**
   * Fetches all stores from the API
   */
  const fetchStores = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await systemAdminAPI.getStores()
      if (response.success) {
        const storeData = response.data.stores || []
        setStores(storeData)
        setFilteredStores(storeData)
        setPagination(prev => ({
          ...prev,
          total: storeData.length
        }))
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to load stores')
      console.error('Stores fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetches store owners from the API for dropdown selection
   */
  const fetchStoreOwners = async () => {
    try {
      const response = await systemAdminAPI.getUsers()
      if (response.success) {
        const users = response.data.users || []
        const owners = users.filter(user => user.role === 'store_owner')
        setStoreOwners(owners)
      }
    } catch (err) {
      console.error('Store owners fetch error:', err)
    }
  }

  /**
   * Filters stores based on search criteria
   */
  const filterStores = (searchTerm) => {
    if (!searchTerm) {
      setFilteredStores(stores)
      setPagination(prev => ({ ...prev, total: stores.length, page: 1 }))
      return
    }

    const filtered = stores.filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    setFilteredStores(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length, page: 1 }))
  }

  /**
   * Handles search input changes
   */
  const handleSearchChange = (value) => {
    setSearchValue(value)
  }

  /**
   * Handles store creation form submission with validation
   */
  const handleCreateStore = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    
    // Store name validation (max 255 characters)
    if (!createFormData.name.trim()) {
      newErrors.name = 'Store name is required'
    } else if (createFormData.name.length > 255) {
      newErrors.name = 'Store name cannot exceed 255 characters'
    }
    
    if (!createFormData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (createFormData.email.length > 255) {
      newErrors.email = 'Email cannot exceed 255 characters'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      newErrors.email = 'Please provide a valid email address'
    }
    
    if (!createFormData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (createFormData.address.length > 400) {
      newErrors.address = 'Address cannot exceed 400 characters'
    }
    
    if (!createFormData.owner_id) {
      newErrors.owner_id = 'Store owner is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors)
      return
    }

    setCreateLoading(true)
    try {
      const response = await systemAdminAPI.createStore(createFormData)
      if (response.success) {
        setShowCreateModal(false)
        setCreateFormData({
          name: '',
          email: '',
          address: '',
          owner_id: ''
        })
        setCreateErrors({})
        fetchStores()
      } else {
        setCreateErrors({ general: response.error })
      }
    } catch (err) {
      setCreateErrors({ general: 'Failed to create store' })
    } finally {
      setCreateLoading(false)
    }
  }

  /**
   * Handles input changes in the create store form
   */
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target
    setCreateFormData(prev => ({ ...prev, [name]: value }))
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * Opens store details modal for viewing
   */
  const handleViewStore = (store) => {
    setSelectedStore(store)
    setShowViewModal(true)
  }

  /**
   * Returns appropriate Bootstrap badge variant based on store status
   */
  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'secondary',
      'suspended': 'danger',
      'pending': 'warning'
    }
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  /**
   * Renders rating display with stars and review count
   */
  const getRatingDisplay = (store) => {
    // Parse the average_rating from string to float
    const rating = parseFloat(store.average_rating) || 0
    const totalRatings = parseInt(store.total_ratings) || 0
    
    return (
      <div className="d-flex align-items-center">
        <FaStar className="text-warning me-1" />
        <span className="me-1">{rating.toFixed(1)}</span>
        <small className="text-muted">({totalRatings} reviews)</small>
      </div>
    )
  }

  /**
   * Table column configuration for DataTable component
   */
  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'owner_name', 
      label: 'Owner',
      render: (store) => store.owner_name || 'No Owner'
    },
    { 
      key: 'rating', 
      label: 'Rating',
      render: (store) => getRatingDisplay(store)
    },
    { key: 'created_at', label: 'Created', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (store) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleViewStore(store)}
            title="View Details"
          >
            <FaEye />
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return <LoadingSpinner message="Loading stores..." />
  }

  return (
    <div className="SystemAdminStoreManagement">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <div className="mb-3 mb-md-0">
            <h1>Store Management</h1>
            <p className="mb-0">
              Manage stores and their information efficiently with comprehensive tools.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="success" 
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus />
              <span className="d-none d-sm-inline">Create Store</span>
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
                  <FaStore size={32} />
                </div>
              </div>
              <div className="stats-number">{pagination.total}</div>
              <div className="stats-label">Total Stores</div>
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
              <div className="stats-number">{filteredStores.filter(s => parseFloat(s.average_rating || 0) >= 4).length}</div>
              <div className="stats-label">High Rated</div>
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
              <div className="stats-number">{filteredStores.filter(s => s.status === 'active').length}</div>
              <div className="stats-label">Active Stores</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaMapMarkerAlt size={32} />
                </div>
              </div>
              <div className="stats-number">{new Set(filteredStores.map(s => s.category)).size}</div>
              <div className="stats-label">Categories</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Stores</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Search Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Search Stores</h5>
        </Card.Header>
        <Card.Body>
          <SearchFilter
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            placeholder="Search stores by name, email, or address..."
          />
        </Card.Body>
      </Card>

      {/* Stores Management Card */}
      <Card className="h-100">
        <Card.Header>
          <h5 className="mb-0">All Stores ({pagination.total})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <DataTable
              data={filteredStores}
              columns={tableColumns}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              onSizeChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
              loading={loading}
              emptyMessage="No stores found"
            />
          </div>
        </Card.Body>
      </Card>

      {/* View Store Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Store Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStore && (
            <div className="StoreDetails">
              <Row>
                <Col md={6}>
                  <h5>{selectedStore.name}</h5>
                  <p className="text-muted">{selectedStore.category}</p>
                  <p>{selectedStore.description}</p>
                  <div className="mb-3">
                    <FaMapMarkerAlt className="text-muted me-2" />
                    <span>{selectedStore.address}</span>
                  </div>
                  <div className="mb-3">
                    {getRatingDisplay(selectedStore)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Phone:</strong> {selectedStore.phone}
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong> {selectedStore.email}
                  </div>
                  <div className="mb-3">
                    <strong>Website:</strong> 
                    {selectedStore.website ? (
                      <a href={selectedStore.website} target="_blank" rel="noopener noreferrer" className="ms-2">
                        {selectedStore.website}
                      </a>
                    ) : (
                      <span className="text-muted ms-2">Not provided</span>
                    )}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong> {getStatusBadge(selectedStore.status)}
                  </div>
                  <div className="mb-3">
                    <strong>Created:</strong> {new Date(selectedStore.created_at).toLocaleDateString()}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Store Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" className="StoreFormModal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Create New Store
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateStore}>
          <Modal.Body>
            {createErrors.general && (
              <Alert variant="danger" className="mb-3">
                {createErrors.general}
              </Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    placeholder="Enter store name (max 255 characters)"
                    isInvalid={!!createErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {createErrors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Store name is required (max 255 characters)
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
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Owner</Form.Label>
                  <Form.Select
                    name="owner_id"
                    value={createFormData.owner_id}
                    onChange={handleCreateInputChange}
                    isInvalid={!!createErrors.owner_id}
                  >
                    <option value="">Select store owner</option>
                    {storeOwners.map(owner => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {createErrors.owner_id}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Select a user with store_owner role
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
                placeholder="Enter store address (max 400 characters)"
                isInvalid={!!createErrors.address}
              />
              <Form.Control.Feedback type="invalid">
                {createErrors.address}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Store address is required (max 400 characters)
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
              {createLoading ? 'Creating...' : 'Create Store'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default SystemAdminStoreManagement
