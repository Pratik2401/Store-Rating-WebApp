import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap'
import { FaStore, FaStar, FaEye, FaPlus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { userAPI } from '../../../api'
import '../../../styles/User/userDashboard.css'

/**
 * User Dashboard component displaying user statistics and recent activity
 * Shows store metrics, recent ratings, and featured stores
 */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    ratedStores: 0,
    averageRating: 0,
    recentRatings: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [featuredStores, setFeaturedStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { userData } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  /**
   * Fetches dashboard data including stores and user ratings
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [storesResponse, ratingsResponse] = await Promise.all([
        userAPI.getStores().catch(err => {
          console.warn('Failed to fetch stores:', err)
          return { stores: [] }
        }),
        userAPI.getMyRatings({ limit: 10 }).catch(err => {
          console.warn('Failed to fetch ratings:', err)
          return { ratings: [], total: 0 }
        })
      ]);
      
      const allStores = storesResponse?.stores || [];
      const userRatings = Array.isArray(ratingsResponse?.ratings) ? ratingsResponse.ratings : [];
      
      const stats = {
        totalStores: allStores.length,
        ratedStores: userRatings.length,
        averageRating: userRatings.length > 0 
          ? (userRatings.reduce((sum, rating) => sum + (rating.rating || 0), 0) / userRatings.length).toFixed(1)
          : 0,
        recentRatings: userRatings.filter(rating => {
          if (!rating.created_at) return false;
          const ratingDate = new Date(rating.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return ratingDate > weekAgo
        }).length
      };
      setStats(stats);
      setRecentActivity(userRatings.slice(0, 5)); // Show latest 5 ratings
      setFeaturedStores(allStores.slice(0, 3)); // Show top 3 stores
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const renderStarRating = (rating) => {
    const numRating = Number(rating) || 0;
    const stars = []
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={i} className="UserDashboardStar text-warning" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <FaStar key="half" className="UserDashboardStar text-warning" style={{ opacity: 0.5 }} />
      )
    }

    const emptyStars = 5 - Math.ceil(numRating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="UserDashboardStar " />
      )
    }

    return stars
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRatingBadgeVariant = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating >= 4.5) return 'success'
    if (numRating >= 3.5) return 'warning'
    if (numRating >= 2.5) return 'info'
    return 'danger'
  }

  if (loading) {
    return (
      <div className="UserDashboardLoading d-flex justify-content-center align-items-center">
        <div className="UserDashboardLoadingContent text-center">
          <Spinner animation="border" variant="primary" className="UserDashboardLoadingSpinner mb-3" />
          <p className="UserDashboardLoadingText ">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" className="UserDashboardError">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <div className="UserDashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {userData?.name || 'User'}!</h1>
        <p>
          Discover and rate amazing stores in your area. Your feedback helps others make better choices.
        </p>
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
              <div className="stats-number">{stats.totalStores}</div>
              <div className="stats-label">Total Stores Available</div>
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
              <div className="stats-number">{stats.ratedStores}</div>
              <div className="stats-label">Stores You've Rated</div>
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
              <div className="stats-number">
                {(Number(stats.averageRating) || 0).toFixed(1)}/5.0
              </div>
              <div className="stats-label">Your Average Rating</div>
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
              <div className="stats-number">{stats.recentRatings}</div>
              <div className="stats-label">Recent Ratings (30 days)</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Activity */}
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className={`activity-item ${index !== recentActivity.length - 1 ? 'border-bottom pb-3 mb-3' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-medium mb-1 text-primary">
                          {activity.store_name}
                        </h6>
                        <Badge bg={getRatingBadgeVariant(activity.rating)}>
                          {activity.rating}/5
                        </Badge>
                      </div>
                      <div className="mb-2">
                        {renderStarRating(activity.rating)}
                      </div>
                      {activity.comment && (
                        <p className=" small mb-2 fst-italic">
                          "{activity.comment}"
                        </p>
                      )}
                      <small className="">
                        {formatDate(activity.created_at)}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaStar className=" mb-3" size={48} />
                  <p className=" mb-3">No recent activity</p>
                  <Button 
                    as={Link} 
                    to="/user/stores" 
                    className="action-btn"
                  >
                    <FaPlus className="me-2" />
                    Rate Your First Store
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Featured Stores */}
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Featured Stores</h5>
              <Button 
                as={Link} 
                to="/user/stores" 
                className="action-btn action-btn-outline"
              >
                <FaEye className="me-2" />
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="featured-list">
                {featuredStores.map((store, index) => (
                  <div 
                    key={store.id} 
                    className={`featured-item ${index !== featuredStores.length - 1 ? 'border-bottom pb-3 mb-3' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="store-info">
                        <h6 className="fw-medium mb-1 text-primary">
                          {store.name}
                        </h6>
                        <p className=" small mb-2">
                          {store.address}
                        </p>
                      </div>
                      <Badge bg={getRatingBadgeVariant(store.average_rating)}>
                        {(Number(store.average_rating) || 0).toFixed(1)}
                      </Badge>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="store-rating">
                        {renderStarRating(store.average_rating)}
                        <span className="ms-2 small ">
                          ({store.total_ratings || 0} reviews)
                        </span>
                      </div>
                      {store.user_rating ? (
                        <span className="small text-success fw-medium">
                          Your rating: {store.user_rating}/5
                        </span>
                      ) : (
                        <Button 
                          as={Link} 
                          to={`/user/stores/${store.id}`} 
                          className="action-btn action-btn-sm"
                        >
                          Rate Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
