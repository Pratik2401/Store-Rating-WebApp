import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Badge, ProgressBar, Alert } from 'react-bootstrap'
import { 
  FaUsers, 
  FaStore, 
  FaStar, 
  FaChartLine, 
  FaWifi, 
  FaDatabase,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { getStorageInfo, isStorageAvailable } from '../../utils/localStorage'
import { getFormattedRemainingTime, isSessionValid } from '../../utils/sessionManager'

const SystemHealthCard = () => {
  const [storageInfo, setStorageInfo] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('online')
  const [sessionInfo, setSessionInfo] = useState('')

  useEffect(() => {
    // Get storage information
    if (isStorageAvailable()) {
      setStorageInfo(getStorageInfo())
    }

    // Check connection status
    const handleOnline = () => setConnectionStatus('online')
    const handleOffline = () => setConnectionStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Update session info
    const updateSessionInfo = () => {
      if (isSessionValid()) {
        setSessionInfo(getFormattedRemainingTime())
      } else {
        setSessionInfo('Session expired')
      }
    }

    updateSessionInfo()
    const sessionInterval = setInterval(updateSessionInfo, 60000) // Update every minute

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(sessionInterval)
    }
  }, [])

  const getConnectionBadge = () => {
    if (connectionStatus === 'online') {
      return <Badge bg="success">Online</Badge>
    } else {
      return <Badge bg="danger">Offline</Badge>
    }
  }

  const getStorageUsagePercentage = () => {
    if (!storageInfo) return 0
    // Assuming 5MB quota (typical for localStorage)
    const quota = 5 * 1024 * 1024 // 5MB in bytes
    return (storageInfo.totalSize / quota) * 100
  }

  return (
    <Card className="system-health-card">
      <Card.Header>
        <h6 className="mb-0">
          <FaShieldAlt className="me-2" />
          System Health
        </h6>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <div className="health-metric">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="health-label">
                  <FaWifi className="me-1" />
                  Connection
                </span>
                {getConnectionBadge()}
              </div>
            </div>
          </Col>
          
          <Col md={6}>
            <div className="health-metric">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="health-label">
                  <FaClock className="me-1" />
                  Session
                </span>
                <Badge bg="info">{sessionInfo}</Badge>
              </div>
            </div>
          </Col>
          
          {storageInfo && (
            <Col md={12}>
              <div className="health-metric">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="health-label">
                    <FaDatabase className="me-1" />
                    Storage Usage
                  </span>
                  <span className="health-value">{storageInfo.totalSizeFormatted}</span>
                </div>
                <ProgressBar
                  now={getStorageUsagePercentage()}
                  variant={getStorageUsagePercentage() > 80 ? 'danger' : 'primary'}
                  size="sm"
                />
              </div>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  )
}

const StatsCard = ({ title, value, icon, color = 'primary', change = null, subtitle = null }) => {
  return (
    <Card className="stats-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div className="stats-content">
            <h6 className="stats-title text-muted mb-2">{title}</h6>
            <h3 className="stats-value mb-1">{value}</h3>
            {subtitle && (
              <p className="stats-subtitle text-muted small mb-0">{subtitle}</p>
            )}
            {change && (
              <div className="stats-change mt-2">
                <Badge bg={change > 0 ? 'success' : 'danger'}>
                  {change > 0 ? '+' : ''}{change}%
                </Badge>
                <span className="ms-2 small text-muted">vs last period</span>
              </div>
            )}
          </div>
          <div className={`stats-icon text-${color}`}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

const DashboardInfo = () => {
  const { user } = useAuth()
  const { showError } = useNotification()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // This would typically fetch from your API
        // For now, we'll use mock data
        const mockStats = {
          users: { total: 1245, change: 12 },
          stores: { total: 87, change: 5 },
          ratings: { total: 3421, change: -2 },
          revenue: { total: '$12,345', change: 8 }
        }
        
        setStats(mockStats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        showError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [showError])

  if (loading) {
    return (
      <div className="dashboard-info-loading">
        <Alert variant="info">Loading dashboard information...</Alert>
      </div>
    )
  }

  return (
    <div className="dashboard-info">
      {/* Welcome Section */}
      <div className="welcome-section mb-4">
        <h4 className="welcome-title">
          Welcome back, {user?.firstName || user?.email || 'User'}!
        </h4>
        <p className="welcome-subtitle text-muted">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col md={3}>
            <StatsCard
              title="Total Users"
              value={stats.users.total.toLocaleString()}
              icon={<FaUsers size={24} />}
              color="primary"
              change={stats.users.change}
              subtitle="Active platform users"
            />
          </Col>
          <Col md={3}>
            <StatsCard
              title="Stores"
              value={stats.stores.total.toLocaleString()}
              icon={<FaStore size={24} />}
              color="success"
              change={stats.stores.change}
              subtitle="Registered stores"
            />
          </Col>
          <Col md={3}>
            <StatsCard
              title="Ratings"
              value={stats.ratings.total.toLocaleString()}
              icon={<FaStar size={24} />}
              color="warning"
              change={stats.ratings.change}
              subtitle="Total ratings submitted"
            />
          </Col>
          <Col md={3}>
            <StatsCard
              title="Performance"
              value="98.5%"
              icon={<FaChartLine size={24} />}
              color="info"
              change={2}
              subtitle="Platform uptime"
            />
          </Col>
        </Row>
      )}

      {/* System Health */}
      <Row className="g-3">
        <Col md={12}>
          <SystemHealthCard />
        </Col>
      </Row>
    </div>
  )
}

export default DashboardInfo
