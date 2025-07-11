import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap'
import { FaStore, FaEdit, FaPlus } from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContext'
import '../../../styles/StoreOwner/storeOwnerStore.css'

const MyStore = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { storeOwnerAPI } = useAuth()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!storeOwnerAPI) {
        setError('Store Owner API not available. Please try logging in again.')
        return
      }

      // Fetch stores from the ratings endpoint which includes store data
      const response = await storeOwnerAPI.getStoreRatings()
      
      if (response && response.stores) {
        setStores(response.stores)
      } else {
        setStores([])
      }
    } catch (err) {
      setError(`Error loading stores: ${err.message}`)
      console.error('Error fetching stores:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (rating) => {
    const numRating = Number(rating) || 0
    const stars = []
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-warning">★</span>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-warning">★</span>
      )
    }

    const emptyStars = 5 - Math.ceil(numRating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-muted">★</span>
      )
    }

    return stars
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p>Loading your stores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Stores</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchStores}>
          Try Again
        </Button>
      </Alert>
    )
  }

  return (
    <div className="StoreOwnerStoreContainer">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-2">My Stores</h1>
          <p className="text-muted">Manage your store information and settings</p>
        </div>
        <Button variant="primary">
          <FaPlus className="me-2" />
          Add New Store
        </Button>
      </div>

      {stores.length > 0 ? (
        <Row>
          {stores.map((store) => (
            <Col key={store.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white rounded-circle p-2 me-3">
                      <FaStore />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">{store.name}</h6>
                      <small className="text-muted">Store</small>
                    </div>
                  </div>
                  <p className="text-muted small mb-2">{store.address}</p>
                  <p className="text-muted small mb-3">{store.email}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="mb-1">
                        {renderStarRating(store.average_rating)}
                      </div>
                      <div className="fw-bold text-warning">{Number(store.average_rating || 0).toFixed(1)}/5.0</div>
                      <small className="text-muted">{store.total_ratings || 0} reviews</small>
                    </div>
                    <Button variant="outline-primary" size="sm">
                      <FaEdit className="me-1" />
                      Edit
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <FaStore size={64} className="text-muted mb-3" />
            <h4 className="text-muted mb-2">No Stores Yet</h4>
            <p className="text-muted">
              You haven't added any stores yet. Click the "Add New Store" button to create your first store.
            </p>
            <Button variant="primary" className="mt-3">
              <FaPlus className="me-2" />
              Add Your First Store
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyStore
