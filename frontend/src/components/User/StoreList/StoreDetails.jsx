import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Badge, Alert, Spinner, Form, Modal } from 'react-bootstrap'
import { FaArrowLeft, FaStar, FaRegStar, FaMapMarker, FaPhone, FaEnvelope, FaGlobe, FaCalendar, FaUser, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import userAPI from '../../../api/User/userAPI'
import { showSuccessAlert, showErrorAlert, showWarningAlert, showConfirmAlert } from '../../../utils/SweetAlert'
import '../../../styles/User/userStoreDetails.css'
import '../../../styles/User/RatingModal.css'

const StoreDetails = () => {
  const { storeId } = useParams()
  const navigate = useNavigate()

  const [store, setStore] = useState(null)
  const [ratings, setRatings] = useState([])
  const [userRating, setUserRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [newRating, setNewRating] = useState({
    rating: 5,
    review: ''
  })
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails()
    }
  }, [storeId])

  const fetchStoreDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch store details from API
      const response = await userAPI.getStoreById(storeId)
      
      if (response.success) {
        setStore(response.data.store)
        setUserRating(response.data.userRating)
        setRatings(response.data.recentRatings || [])
        
        // Set rating form if user has existing rating
        if (response.data.userRating) {
          setNewRating({
            rating: response.data.userRating.rating,
            review: response.data.userRating.review || ''
          })
        }
      } else {
        setError('Store not found')
      }
    } catch (err) {
      setError('Failed to fetch store details. Please try again.')
      showErrorAlert('Error', 'Failed to fetch store details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (rating, interactive = false, onStarClick = null) => {
    const numRating = Number(rating) || 0;
    const stars = []
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= numRating
      
      stars.push(
        <FaStar
          key={i}
          className={`${filled ? 'active' : ''} ${interactive ? 'interactive-star' : ''}`}
          onClick={interactive && onStarClick ? () => onStarClick(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        />
      )
    }

    return interactive ? (
      <div className="star-rating">
        {stars}
      </div>
    ) : (
      <div className="d-flex align-items-center">
        {stars}
      </div>
    )
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmittingRating(true)
      
      // Submit rating to API
      const response = await userAPI.submitRating(storeId, {
        rating: newRating.rating,
        review: newRating.review
      })
      
      if (response.success) {
        if (userRating) {
          showSuccessAlert('Success', 'Your rating has been updated successfully!')
        } else {
          showSuccessAlert('Success', 'Thank you for rating this store!')
        }
        
        // Refresh store details to get updated data
        await fetchStoreDetails()
        setShowRatingModal(false)
      }
    } catch (err) {
      showErrorAlert('Error', 'Failed to submit rating. Please try again.')
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleDeleteRating = async () => {
    if (!userRating) return

    try {
      const result = await showConfirmAlert('Delete Rating', 'Are you sure you want to delete your rating?')
      if (!result.isConfirmed) return

      // For now, we don't have a delete endpoint, so we'll submit rating 0
      // This would need to be implemented in the backend
      showWarningAlert('Feature Not Available', 'Rating deletion is not yet implemented.')
      
    } catch (err) {
      showErrorAlert('Error', 'Failed to delete rating. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="StoreDetailsLoading">
        <div className="loading-spinner"></div>
        <p className="mt-3 text-muted">Loading store details...</p>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="StoreDetailsError text-center py-5">
        <Alert variant="danger">
          <h4>Store Not Found</h4>
          <p>The store you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => navigate('/user/stores')}>
            <FaArrowLeft className="me-2" />
            Back to Stores
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="store-details-container">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline-primary"
          onClick={() => navigate('/user/stores')}
          className="mb-3"
        >
          <FaArrowLeft className="me-2" />
          Back to Stores
        </Button>
      </div>

      {/* Store Header */}
      <Card className="store-header-card fade-in">
        {store.image_url && (
          <div className="position-relative">
            <Card.Img
              variant="top"
              src={store.image_url}
              alt={store.name}
              style={{ height: '250px', objectFit: 'cover' }}
            />
          </div>
        )}
        <Card.Body className="store-header-content">
          <Row>
            <Col lg={8}>
              <div className="d-flex align-items-start mb-4">
                <div className="StoreDetailsAvatar me-4">
                  {store.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow-1">
                  <h1 className="store-title">{store.name}</h1>
                  {store.category && (
                    <Badge bg="secondary" className="StoreDetailsStatusBadge mb-3">
                      {store.category}
                    </Badge>
                  )}
                  {store.description && (
                    <p className="store-description">
                      {store.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Store Contact Info */}
              <div className="StoreDetailsContact">
                <Row className="g-3">
                  <Col sm={6}>
                    <div className="d-flex align-items-center">
                      <FaMapMarker className="text-primary me-2" />
                      <span>{store.address}</span>
                    </div>
                  </Col>
                  {store.phone && (
                    <Col sm={6}>
                      <div className="d-flex align-items-center">
                        <FaPhone className="text-primary me-2" />
                        <a href={`tel:${store.phone}`} className="text-decoration-none">
                          {store.phone}
                        </a>
                      </div>
                    </Col>
                  )}
                  {store.email && (
                    <Col sm={6}>
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="text-primary me-2" />
                        <a href={`mailto:${store.email}`} className="text-decoration-none">
                          {store.email}
                        </a>
                      </div>
                    </Col>
                  )}
                  {store.website && (
                    <Col sm={6}>
                      <div className="d-flex align-items-center">
                        <FaGlobe className="text-primary me-2" />
                        <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          Visit Website
                        </a>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </Col>
            
            <Col lg={4}>
              {/* Average Rating Section */}
              <div className="average-rating-section">
                <div className="average-rating-display">
                  <div className="rating-number">{parseFloat(store.average_rating || 0).toFixed(1)}</div>
                  <div>
                    <div className="star-rating mb-1">
                      {renderStarRating(parseFloat(store.average_rating) || 0)}
                    </div>
                    <div className="rating-text">({store.total_ratings || 0} reviews)</div>
                  </div>
                </div>
              </div>

              {/* User Rating Actions */}
              <div className="text-center mt-4">
                {userRating ? (
                  <div className="user-rating-card">
                    <div className="user-rating-info">
                      <h5>Your Rating</h5>
                      <div>
                        <div className="star-rating mb-2">
                          {renderStarRating(userRating.rating)}
                        </div>
                        <div className="user-rating-meta">{userRating.rating}/5 stars</div>
                      </div>
                    </div>
                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-primary"
                        onClick={() => setShowRatingModal(true)}
                      >
                        <FaEdit className="me-2" />
                        Edit Rating
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={handleDeleteRating}
                      >
                        <FaTrash className="me-2" />
                        Delete Rating
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h6 className="mb-3">Rate This Store</h6>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowRatingModal(true)}
                      className="w-100"
                    >
                      <FaPlus className="me-2" />
                      Add Rating
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Recent Reviews */}
      <Card className="store-info-card slide-up">
        <Card.Header>
          <h5 className="mb-0">Recent Reviews</h5>
        </Card.Header>
        <Card.Body>
          {ratings.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No reviews yet. Be the first to rate this store!</p>
            </div>
          ) : (
            <div className="recent-ratings-list">
              {ratings.map((rating, index) => (
                <div key={index} className="rating-item">
                  <div className="rating-item-header">
                    <div className="rating-item-user">
                      <div className="StoreDetailsReviewerAvatar">
                        {rating.user_name ? rating.user_name.split(' ').map(n => n[0]).join('') : '?'}
                      </div>
                      <div>
                        <strong>{rating.user_name || 'Anonymous'}</strong>
                        <div className="rating-item-stars">
                          {renderStarRating(rating.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="rating-item-date">
                      {formatDate(rating.created_at)}
                    </div>
                  </div>
                  {rating.review && (
                    <div className="rating-item-comment">
                      "{rating.review}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Rating Modal */}
      <Modal 
        show={showRatingModal} 
        onHide={() => setShowRatingModal(false)} 
        centered
        className="rating-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {userRating ? 'Edit Your Rating' : 'Rate This Store'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRatingSubmit}>
          <Modal.Body>
            <div className="mb-4">
              <Form.Label className="fw-semibold">Rating</Form.Label>
              <div className="rating-stars-container">
                {renderStarRating(newRating.rating, true, (rating) => 
                  setNewRating(prev => ({ ...prev, rating }))
                )}
              </div>
              <div className="text-center">
                <span className="fs-5 fw-bold">{newRating.rating}/5 stars</span>
              </div>
            </div>

            <div className="mb-3">
              <Form.Label className="fw-semibold">Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Share your experience with this store..."
                value={newRating.review}
                onChange={(e) => setNewRating(prev => ({ ...prev, review: e.target.value }))}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="outline-primary" 
              onClick={() => setShowRatingModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submittingRating || !newRating.review.trim()}
            >
              {submittingRating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                <>
                  {userRating ? 'Update Rating' : 'Submit Rating'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default StoreDetails
