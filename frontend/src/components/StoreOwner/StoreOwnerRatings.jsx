import React, { useState, useEffect } from 'react'
import { Card, Alert, Spinner, Table, Badge } from 'react-bootstrap'
import { FaStore } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/StoreOwner/storeOwnerDashboard.css'

/**
 * StoreOwnerRatings Component
 * 
 * Displays all ratings received by the store owner across all their stores.
 * Shows customer information, store names, and ratings with multi-store support.
 */
const StoreOwnerRatings = () => {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { storeOwnerAPI } = useAuth()

  useEffect(() => {
    fetchRatings()
  }, [])

  /**
   * Fetch all ratings for stores owned by the store owner
   */
  const fetchRatings = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!storeOwnerAPI) {
        setError('Store Owner API not available. Please try logging in again.')
        return
      }
      
      const ratingsResponse = await storeOwnerAPI.getStoreRatings()
      if (ratingsResponse) {
        setRatings(ratingsResponse.ratings || [])
      }
    } catch (err) {
      console.error('API error:', err)
      setError(`Error loading ratings: ${err.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Get appropriate badge variant based on rating value
   */
  const getRatingBadgeVariant = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating >= 4.5) return 'success'
    if (numRating >= 3.5) return 'warning'
    if (numRating >= 2.5) return 'info'
    return 'danger'
  }

  if (loading) {
    return (
      <div className="StoreOwnerDashboardLoading d-flex justify-content-center align-items-center">
        <div className="StoreOwnerDashboardLoadingContent text-center">
          <Spinner animation="border" variant="primary" className="StoreOwnerDashboardLoadingSpinner mb-3" />
          <p className="StoreOwnerDashboardLoadingText">Loading ratings data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" className="StoreOwnerDashboardError">
        <Alert.Heading>Error Loading Ratings</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <div className="StoreOwnerDashboardContainer">
      {/* Page Header */}
      <div className="StoreOwnerDashboardHeader mb-4">
        <h1 className="StoreOwnerDashboardTitle fw-bold mb-2">Store Ratings</h1>
        <p className="StoreOwnerDashboardSubtitle">
          View all customers who have submitted ratings across all your stores.
        </p>
      </div>

      {/* Users Who Rated Table */}
      <Card className="StoreOwnerDashboardRatingsCard shadow-sm">
        <Card.Header className="StoreOwnerDashboardRatingsHeader bg-light border-0">
          <h5 className="StoreOwnerDashboardRatingsTitle mb-0 fw-bold">
            Customer Ratings Across All Stores
          </h5>
        </Card.Header>
        <Card.Body className="StoreOwnerDashboardRatingsBody p-0">
          {ratings.length > 0 ? (
            <div className="table-responsive">
              <Table className="StoreOwnerDashboardRatingsTable mb-0" hover>
                <thead className="bg-light">
                  <tr>
                    <th className="StoreOwnerDashboardTableHeader">Customer</th>
                    <th className="StoreOwnerDashboardTableHeader">Store</th>
                    <th className="StoreOwnerDashboardTableHeader">Rating</th>
                    <th className="StoreOwnerDashboardTableHeader">Review</th>
                    <th className="StoreOwnerDashboardTableHeader">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((rating) => (
                    <tr key={rating.id} className="StoreOwnerDashboardTableRow">
                      <td className="StoreOwnerDashboardTableCell">
                        <div className="StoreOwnerDashboardCustomerInfo d-flex align-items-center">
                          <div className="StoreOwnerDashboardCustomerAvatar bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center">
                            {rating.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="StoreOwnerDashboardCustomerDetails">
                            <div className="StoreOwnerDashboardCustomerName fw-medium">
                              {rating.user_name}
                            </div>
                            <div className="StoreOwnerDashboardCustomerEmail small text-muted">
                              {rating.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="StoreOwnerDashboardTableCell">
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                            <FaStore size={12} />
                          </div>
                          <div>
                            <div className="StoreOwnerDashboardStoreName fw-medium">
                              {rating.store_name}
                            </div>
                            <small className="text-muted">Store ID: {rating.store_id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="StoreOwnerDashboardTableCell store-rating-cell">
                        <div className="StoreOwnerDashboardRatingDisplay store-rating-display d-flex align-items-center justify-content-center">
                          <div className="store-rating-info d-flex flex-column align-items-center">
                            <span className="store-rating-number fw-bold text-primary mb-1" style={{ fontSize: '1.2rem' }}>
                              {Number(rating.rating).toFixed(1)}
                            </span>
                            <Badge bg={getRatingBadgeVariant(rating.rating)} className="store-rating-badge" size="sm">
                              {Number(rating.rating).toFixed(1)}/5
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="StoreOwnerDashboardTableCell">
                        <div style={{ maxWidth: '200px' }}>
                          {rating.review ? (
                            <span className="text-truncate d-block" title={rating.review}>
                              {rating.review}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">No review</span>
                          )}
                        </div>
                      </td>
                      <td className="StoreOwnerDashboardTableCell">
                        <span className="StoreOwnerDashboardDate small text-muted">
                          {formatDate(rating.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="StoreOwnerDashboardNoRatings">
                <FaStar className="text-muted mb-3" size={48} />
                <h5 className="text-muted mb-2">No Ratings Yet</h5>
                <p className="text-muted">
                  Your stores haven't received any ratings yet. Once customers start rating your stores, they'll appear here.
                </p>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default StoreOwnerRatings
