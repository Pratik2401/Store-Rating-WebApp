import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Alert, Spinner } from 'react-bootstrap'
import { FaStar, FaStore } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/StoreOwner/storeOwnerDashboard.css'

/**
 * StoreOwnerAverageRating Component
 * 
 * Displays average rating statistics for all stores owned by the store owner.
 * Shows both overall statistics and individual store performance with multi-store support.
 */
const StoreOwnerAverageRating = () => {
  const [stores, setStores] = useState([])
  const [overallStats, setOverallStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    storeCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { storeOwnerAPI } = useAuth()

  useEffect(() => {
    fetchStoreData()
  }, [])

  /**
   * Fetch stores and overall statistics for the store owner
   */
  const fetchStoreData = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!storeOwnerAPI) {
        setError('Store Owner API not available. Please try logging in again.')
        return
      }
      
      // Fetch both stores and overall stats
      const [storesResponse, statsResponse] = await Promise.all([
        storeOwnerAPI.getStores(),
        storeOwnerAPI.getDashboardStats()
      ])
      
      if (storesResponse?.stores) {
        setStores(storesResponse.stores)
      }
      
      if (statsResponse) {
        setOverallStats({
          averageRating: Number(statsResponse.averageRating) || 0,
          totalRatings: Number(statsResponse.totalRatings) || 0,
          storeCount: Number(statsResponse.storeCount) || 0
        })
      }
    } catch (err) {
      console.error('API error:', err)
      setError(`Error loading store data: ${err.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="StoreOwnerDashboardLoading d-flex justify-content-center align-items-center">
        <div className="StoreOwnerDashboardLoadingContent text-center">
          <Spinner animation="border" variant="primary" className="StoreOwnerDashboardLoadingSpinner mb-3" />
          <p className="StoreOwnerDashboardLoadingText">Loading average rating...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" className="StoreOwnerDashboardError">
        <Alert.Heading>Error Loading Average Rating</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <div className="StoreOwnerDashboardContainer">
      {/* Page Header */}
      <div className="StoreOwnerDashboardHeader mb-4">
        <h1 className="StoreOwnerDashboardTitle fw-bold mb-2">Store Ratings Overview</h1>
        <p className="StoreOwnerDashboardSubtitle">
          View overall rating performance across all your stores.
        </p>
      </div>

      {/* Overall Statistics Cards */}
      <Row className="mb-4">
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="StoreOwnerDashboardStatCard h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="StoreOwnerDashboardStatIcon bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <FaStar size={40} />
              </div>
              <h2 className="StoreOwnerDashboardStatValue fw-bold mb-2 text-dark">
                {overallStats.averageRating.toFixed(1)}/5.0
              </h2>
              <p className="StoreOwnerDashboardStatTitle mb-3">Overall Average Rating</p>
              <small className="text-muted">Across all stores</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="StoreOwnerDashboardStatCard h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="StoreOwnerDashboardStatIcon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <FaStar size={40} />
              </div>
              <h2 className="StoreOwnerDashboardStatValue fw-bold mb-2 text-dark">
                {overallStats.totalRatings}
              </h2>
              <p className="StoreOwnerDashboardStatTitle mb-3">Total Ratings</p>
              <small className="text-muted">All ratings received</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="StoreOwnerDashboardStatCard h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="StoreOwnerDashboardStatIcon bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <FaStore size={40} />
              </div>
              <h2 className="StoreOwnerDashboardStatValue fw-bold mb-2 text-dark">
                {overallStats.storeCount}
              </h2>
              <p className="StoreOwnerDashboardStatTitle mb-3">Total Stores</p>
              <small className="text-muted">Stores you own</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Individual Store Performance */}
      {stores.length > 0 && (
        <>
          <div className="mb-4">
            <h3 className="fw-bold mb-3">Individual Store Performance</h3>
          </div>
          <Row>
            {stores.map((store) => (
              <Col xs={12} md={6} lg={4} key={store.id} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="StoreOwnerDashboardStatIcon bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                        <FaStore size={20} />
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold">{store.name}</h5>
                        <small className="text-muted">{store.address}</small>
                      </div>
                    </div>
                    
                    <div className="text-center py-3">
                      <div className="mb-2">
                        <h4 className="text-primary mb-1 fw-bold">{store.average_rating.toFixed(1)}/5.0</h4>
                        <small className="text-muted">Average Rating</small>
                      </div>
                      
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="border rounded p-2">
                            <h6 className="text-primary mb-0">{store.total_ratings}</h6>
                            <small className="text-muted">Ratings</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded p-2">
                            <h6 className="text-info mb-0">{store.total_rating_users}</h6>
                            <small className="text-muted">Customers</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Overall Summary */}
      <Card className="shadow-sm mt-4">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0 fw-bold">Performance Summary</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4">
            {overallStats.averageRating > 0 ? (
              <>
                <div className="mb-3">
                  <h3 className="text-primary mb-2">
                    Excellent work! Your {overallStats.storeCount > 1 ? 'stores have' : 'store has'} an overall average rating of {overallStats.averageRating.toFixed(1)} stars.
                  </h3>
                  <p className="text-muted">
                    Keep maintaining high service quality across {overallStats.storeCount > 1 ? 'all your stores' : 'your store'} to ensure continued customer satisfaction.
                  </p>
                </div>
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className="border rounded p-3">
                      <h4 className="text-warning mb-1">{overallStats.averageRating.toFixed(1)}</h4>
                      <small className="text-muted">Overall Rating</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3">
                      <h4 className="text-primary mb-1">{overallStats.totalRatings}</h4>
                      <small className="text-muted">Total Reviews</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3">
                      <h4 className="text-info mb-1">{overallStats.storeCount}</h4>
                      <small className="text-muted">{overallStats.storeCount === 1 ? 'Store' : 'Stores'}</small>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <FaStar className="text-muted mb-3" size={48} />
                <h5 className="text-muted mb-2">No Ratings Yet</h5>
                <p className="text-muted">
                  Your {overallStats.storeCount > 1 ? 'stores haven\'t' : 'store hasn\'t'} received any ratings yet. 
                  Once customers start rating your {overallStats.storeCount > 1 ? 'stores' : 'store'}, you'll see performance metrics here.
                </p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default StoreOwnerAverageRating
