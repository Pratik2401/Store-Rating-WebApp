import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Alert, Spinner } from 'react-bootstrap'
import { FaStar, FaUsers, FaStore, FaChartLine } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import '../../../styles/StoreOwner/storeOwnerDashboard.css'

/**
 * Store Owner Dashboard component displaying store performance metrics
 * Shows ratings statistics, user engagement, and recent activity
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const { storeOwnerAPI } = useAuth()
  
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    storeCount: 0
  })
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  /**
   * Fetches dashboard statistics and store data
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!storeOwnerAPI) {
        setError('Store Owner API not available. Please try logging in again.')
        return
      }
      
      try {
        const statsResponse = await storeOwnerAPI.getDashboardStats()
        if (statsResponse) {
          setStats({
            averageRating: Number(statsResponse.averageRating) || 0,
            totalRatings: Number(statsResponse.totalRatings) || 0,
            storeCount: Number(statsResponse.storeCount) || 0
          })
        }

        const ratingsResponse = await storeOwnerAPI.getStoreRatings()
        if (ratingsResponse) {
          setStores(ratingsResponse.stores || [])
        }
      } catch (err) {
        console.error('API error:', err)
        setError(`Error loading data: ${err.message || 'Please try again.'}`)
      }
    } catch (err) {
      setError(`Dashboard error: ${err.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }
  return (
    <div className="StoreOwnerDashboardContainer">
      {/* Page Header */}
      <div className="StoreOwnerDashboardHeader mb-4">
        <h1 className="StoreOwnerDashboardTitle fw-bold mb-2">Store Owner Dashboard</h1>
        <p className="StoreOwnerDashboardSubtitle">
          Welcome to your store management portal. Use the sidebar to navigate to different sections.
        </p>
      </div>

      {/* Analytics Cards */}
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaStar size={30} />
              </div>
              <h3 className="fw-bold mb-1 text-dark">
                {stats.averageRating.toFixed(1)}/5.0
              </h3>
              <p className="mb-0">Average Rating</p>
              <small className="text-muted">
                Across all stores
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaChartLine size={30} />
              </div>
              <h3 className="fw-bold mb-1 text-dark">{stats.totalRatings}</h3>
              <p className="mb-0">Total Ratings</p>
              <small className="text-muted">
                All time ratings
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaStore size={30} />
              </div>
              <h3 className="fw-bold mb-1 text-dark">{stats.storeCount}</h3>
              <p className="mb-0">My Stores</p>
              <small className="text-muted">
                Total stores owned
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaStore size={30} />
              </div>
              <h3 className="fw-bold mb-1 text-dark">{stats.storeCount}</h3>
              <p className="mb-0">My Stores</p>
              <small className="text-muted">
                Total stores owned
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Links */}
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3">
          <Card 
            className="h-100 shadow-sm border-0 cursor-pointer" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/store-owner/average-rating')}
          >
            <Card.Body className="text-center">
              <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaStar size={30} />
              </div>
              <h5 className="fw-bold mb-2">Average Rating</h5>
              <p className="text-muted mb-0">
                View your store's overall rating performance
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} className="mb-3">
          <Card 
            className="h-100 shadow-sm border-0 cursor-pointer" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/store-owner/ratings')}
          >
            <Card.Body className="text-center">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaUsers size={30} />
              </div>
              <h5 className="fw-bold mb-2">User Ratings</h5>
              <p className="text-muted mb-0">
                View all users who have rated your store
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* My Stores Section */}
      {stores.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light border-0">
            <h5 className="mb-0 fw-bold">My Stores</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {stores.slice(0, 3).map((store) => (
                <Col key={store.id} xs={12} md={6} lg={4} className="mb-3">
                  <Card className="h-100 border">
                    <Card.Body>
                      <h6 className="fw-bold mb-2">{store.name}</h6>
                      <p className="text-muted small mb-1">{store.email}</p>
                      <p className="text-muted small mb-2">{store.address}</p>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-bold text-primary mb-1">
                            {Number(store.average_rating || 0).toFixed(1)}/5.0
                          </div>
                          <small className="text-muted">
                            {store.total_ratings || 0} ratings
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">{store.total_ratings || 0}</div>
                          <small className="text-muted">ratings</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            {stores.length > 3 && (
              <div className="text-center">
                <small className="text-muted">
                  Showing 3 of {stores.length} stores. View all stores in the detailed sections.
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Information Card */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0 fw-bold">Getting Started</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4">
            <h6 className="mb-3">Welcome to your Store Owner Dashboard!</h6>
            <p className="text-muted mb-4">
              Here you can manage your store's rating information. Use the navigation menu on the left to:
            </p>
            <div className="row text-start">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <FaStar className="text-warning me-3" size={20} />
                  <div>
                    <strong>Average Rating:</strong> View your store's overall rating performance
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <FaUsers className="text-primary me-3" size={20} />
                  <div>
                    <strong>User Ratings:</strong> See all customers who have rated your store
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Dashboard
