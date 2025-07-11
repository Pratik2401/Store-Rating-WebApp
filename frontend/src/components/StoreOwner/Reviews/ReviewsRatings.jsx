import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Alert, Spinner, Table, Badge, Button } from 'react-bootstrap'
import { FaStar, FaEye, FaReply } from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContext'
import '../../../styles/StoreOwner/storeOwnerReviews.css'

const ReviewsRatings = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [customers, setCustomers] = useState([])

  const { storeOwnerAPI } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!storeOwnerAPI) {
        setError('Store Owner API not available. Please try logging in again.')
        return
      }

      // Fetch ratings data
      const ratingsResponse = await storeOwnerAPI.getStoreRatings()
      
      if (ratingsResponse && ratingsResponse.ratings) {
        setReviews(ratingsResponse.ratings)
        
        // Calculate stats from ratings
        const ratings = ratingsResponse.ratings
        const totalReviews = ratings.length
        const averageRating = totalReviews > 0 
          ? ratings.reduce((sum, review) => sum + Number(review.rating), 0) / totalReviews
          : 0
        
        // Calculate rating distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        ratings.forEach(review => {
          const rating = Number(review.rating)
          if (rating >= 1 && rating <= 5) {
            distribution[rating]++
          }
        })
        
        setStats({
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(1)),
          ratingDistribution: distribution
        })
      } else {
        setReviews([])
        setStats({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      }

      // Fetch customers data
      const customersResponse = await storeOwnerAPI.getCustomers({ limit: 10 })
      if (customersResponse && customersResponse.customers) {
        setCustomers(customersResponse.customers)
      }
    } catch (err) {
      setError(`Error loading reviews: ${err.message}`)
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'text-warning' : 'text-muted'}
          size={14}
        />
      )
    }
    return stars
  }

  const getRatingBadgeVariant = (rating) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'danger'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p>Loading reviews and ratings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Reviews</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <div className="StoreOwnerReviewsContainer">
      <div className="mb-4">
        <h1 className="fw-bold mb-2">Reviews & Ratings</h1>
        <p className="text-muted">Monitor and manage customer feedback for your stores</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xs={12} md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-primary text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3">
                <FaStar size={24} />
              </div>
              <h3 className="fw-bold mb-1">{stats.averageRating.toFixed(1)}/5.0</h3>
              <p className="text-muted mb-0">Average Rating</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-success text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3">
                <FaEye size={24} />
              </div>
              <h3 className="fw-bold mb-1">{stats.totalReviews}</h3>
              <p className="text-muted mb-0">Total Reviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-warning text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3">
                <FaReply size={24} />
              </div>
              <h3 className="fw-bold mb-1">0</h3>
              <p className="text-muted mb-0">Pending Responses</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reviews Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0 fw-bold">Recent Reviews</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {reviews.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0" hover>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Store</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle p-2 me-2 d-flex align-items-center justify-content-center">
                            {(review.user_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-medium">{review.user_name || 'Unknown User'}</div>
                            <small className="text-muted">{review.user_email || 'No email'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{review.store_name || 'Unknown Store'}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            {renderStarRating(Number(review.rating) || 0)}
                          </div>
                          <Badge bg={getRatingBadgeVariant(Number(review.rating) || 0)}>
                            {Number(review.rating) || 0}/5
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {review.comment ? (
                            <span>{review.comment}</span>
                          ) : (
                            <span className="text-muted fst-italic">No comment</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">{formatDate(review.created_at)}</span>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          <FaReply className="me-1" />
                          Reply
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaStar size={64} className="text-muted mb-3" />
              <h4 className="text-muted mb-2">No Reviews Yet</h4>
              <p className="text-muted">
                You haven't received any reviews yet. Once customers start reviewing your stores, they'll appear here.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default ReviewsRatings
