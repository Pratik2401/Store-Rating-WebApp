import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaDownload, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import PageHeader from '../../Common/PageHeader'
import DataTable from '../../Common/DataTable'
import LoadingSpinner from '../../Common/LoadingSpinner'
import ErrorAlert from '../../Common/ErrorAlert'
import SearchFilter from '../../Common/SearchFilter'
import ConfirmModal from '../../Common/ConfirmModal'
import { systemAdminAPI } from '../../../api/SystemAdmin'
import '../../../styles/SystemAdmin/systemAdminStoreManagement.css'

const SystemAdminStoreManagement = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [filters, setFilters] = useState({ search: '', category: '', status: '' })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    description: '',
    category: '',
    phone: '',
    website: '',
    status: 'active'
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [filters, pagination.page, pagination.limit])

  const fetchStores = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category,
        status: filters.status
      }
      
      const response = await systemAdminAPI.getStores(params)
      if (response.success) {
        setStores(response.data.stores || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
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

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilter = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleAddStore = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      description: '',
      category: '',
      phone: '',
      website: '',
      status: 'active'
    })
    setFormErrors({})
    setShowAddModal(true)
  }

  const handleViewStore = (store) => {
    setSelectedStore(store)
    setShowViewModal(true)
  }

  const handleEditStore = (store) => {
    setSelectedStore(store)
    setFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      description: store.description,
      category: store.category,
      phone: store.phone,
      website: store.website,
      status: store.status
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteStore = (store) => {
    setSelectedStore(store)
    setShowDeleteModal(true)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Store name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required'
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSubmitting(true)
      
      const response = selectedStore
        ? await systemAdminAPI.updateStore(selectedStore.id, formData)
        : await systemAdminAPI.createStore(formData)
      
      if (response.success) {
        await fetchStores()
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedStore(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to save store')
      console.error('Store save error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedStore) return
    
    try {
      setSubmitting(true)
      
      const response = await systemAdminAPI.deleteStore(selectedStore.id)
      if (response.success) {
        await fetchStores()
        setShowDeleteModal(false)
        setSelectedStore(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to delete store')
      console.error('Store delete error:', err)
    } finally {
      setSubmitting(false)
    }
  }

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

  const getRatingDisplay = (rating, totalRatings) => {
    return (
      <div className="d-flex align-items-center">
        <FaStar className="text-warning me-1" />
        <span className="me-1">{rating || 0}</span>
        <small className="text-muted">({totalRatings || 0} reviews)</small>
      </div>
    )
  }

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'rating', 
      label: 'Rating',
      render: (store) => getRatingDisplay(store.averageRating, store.totalRatings)
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (store) => (
        <Badge bg="info">{store.category}</Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (store) => getStatusBadge(store.status)
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
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => handleEditStore(store)}
            title="Edit Store"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteStore(store)}
            title="Delete Store"
          >
            <FaTrash />
          </Button>
        </div>
      )
    }
  ]

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'retail', label: 'Retail' },
        { value: 'service', label: 'Service' },
        { value: 'grocery', label: 'Grocery' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ]

  if (loading) {
    return <LoadingSpinner message="Loading stores..." />
  }

  return (
    <div className="SystemAdminStoreManagement">
      <PageHeader
        title="Store Management"
        subtitle="Manage stores and their information"
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Stores', active: true }
        ]}
      />

      <Container fluid>
        {error && <ErrorAlert message={error} />}
        
        {/* Search and Filter */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <SearchFilter
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  filters={filterOptions}
                  placeholder="Search stores by name, email, or address..."
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button
                  variant="primary"
                  onClick={handleAddStore}
                  className="me-2"
                >
                  <FaPlus className="me-2" />
                  Add Store
                </Button>
                <Button variant="outline-secondary">
                  <FaDownload className="me-2" />
                  Export
                </Button>
              </div>
              <div className="text-muted">
                Total Stores: {pagination.total}
              </div>
            </div>
          </Col>
        </Row>

        {/* Stores Table */}
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <DataTable
                  data={stores}
                  columns={tableColumns}
                  pagination={pagination}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                  onSizeChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
                  loading={loading}
                  emptyMessage="No stores found"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Store Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
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
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    isInvalid={!!formErrors.category}
                  >
                    <option value="">Select Category</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service</option>
                    <option value="grocery">Grocery</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.category}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                isInvalid={!!formErrors.address}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>
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
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            Add Store
          </Button>
        </Modal.Footer>
      </Modal>

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
                    {getRatingDisplay(selectedStore.averageRating, selectedStore.totalRatings)}
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

      {/* Edit Store Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
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
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    isInvalid={!!formErrors.category}
                  >
                    <option value="">Select Category</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service</option>
                    <option value="grocery">Grocery</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.category}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                isInvalid={!!formErrors.address}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>
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
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            Update Store
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Store"
        message={`Are you sure you want to delete ${selectedStore?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  )
}

export default SystemAdminStoreManagement
