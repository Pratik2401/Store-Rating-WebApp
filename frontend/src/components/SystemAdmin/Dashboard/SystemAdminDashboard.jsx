import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import { FaUsers, FaStore, FaStar } from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContext'
import { systemAdminAPI } from '../../../api/SystemAdmin'
import '../../../styles/SystemAdmin/systemAdminDashboard.css'

/**
 * System Admin Dashboard component
 * Displays key metrics and system overview for administrators
 */
const SystemAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { userData } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  /**
   * Fetches dashboard statistics from the API
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const dashboardResponse = await systemAdminAPI.getDashboardStats()

      if (dashboardResponse.success) {
        const data = dashboardResponse.data
        setStats({
          totalUsers: data.totalUsers || 0,
          totalStores: data.totalStores || 0,
          totalRatings: data.totalRatings || 0
        })
      } else {
        setError('Failed to load dashboard data. Please try again.')
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Formats date string for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="SystemAdminDashboardLoading d-flex justify-content-center align-items-center">
        <div className="SystemAdminDashboardLoadingContent text-center">
          <Spinner animation="border" variant="primary" className="SystemAdminDashboardLoadingSpinner mb-3" />
          <p className="SystemAdminDashboardLoadingText">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" className="SystemAdminDashboardError">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <div className="SystemAdminDashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1>Welcome back, {userData?.name || 'Admin'}!</h1>
            <p className="mb-0">
              Manage your system efficiently with comprehensive tools for users, stores, and analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-5">
        <Col xs={12} sm={6} lg={4} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaUsers size={32} />
                </div>
              </div>
              <div className="stats-number">{stats.totalUsers}</div>
              <div className="stats-label">Total Users</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaStore size={32} />
                </div>
              </div>
              <div className="stats-number">{stats.totalStores}</div>
              <div className="stats-label">Total Stores</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stats-icon">
                  <FaStar size={32} />
                </div>
              </div>
              <div className="stats-number">{stats.totalRatings}</div>
              <div className="stats-label">Total Ratings</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SystemAdminDashboard
