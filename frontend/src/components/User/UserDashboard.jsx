import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import CommonNavbar from '../Common/CommonNavbar'
import CommonSidebar from '../Common/CommonSidebar'
import StoreList from './StoreList/StoreList'
import StoreDetails from './StoreList/StoreDetails'
import Profile from './Profile/Profile'
import Dashboard from './Dashboard/Dashboard'
import '../../styles/User/userDashboard.css'

/**
 * Main user dashboard layout component
 * Manages sidebar state and routing for user interface
 */
const UserDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  /**
   * Toggles sidebar visibility for both desktop and mobile
   */
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    setSidebarMobileOpen((open) => !open)
  }

  /**
   * Opens mobile sidebar
   */
  const openSidebarMobile = () => setSidebarMobileOpen(true)
  
  /**
   * Closes mobile sidebar
   */
  const closeSidebarMobile = () => setSidebarMobileOpen(false)

  return (
    <div className="UserDashboardContainer">
      <div className="UserLayoutRow">
        <div className={`UserSidebarContainer${sidebarMobileOpen ? ' open' : ''}`}> 
          <CommonSidebar
            collapsed={sidebarCollapsed}
            mobileOpen={sidebarMobileOpen}
            onCloseMobile={closeSidebarMobile}
            role="user"
            brandText="Store Rating"
            brandSubtext="User Portal"
          />
        </div>
        {sidebarMobileOpen && (
          <div
            className="user-sidebar-mobile-overlay show"
            onClick={closeSidebarMobile}
            aria-label="Close sidebar overlay"
            tabIndex={0}
            role="button"
            style={{ zIndex: 1055 }}
          />
        )}
        <div className="UserMainColumn">
          <div className={`UserNavbarRow${sidebarMobileOpen ? ' hide-when-sidebar-open' : ''}`}> 
            <CommonNavbar 
              onToggleSidebar={openSidebarMobile} 
              sidebarMobileOpen={sidebarMobileOpen} 
              role="user"
              brandText="Store Rating System"
            />
          </div>
          <div className={`UserMainContent${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}> 
            <Container fluid className="UserMainContainer p-4">
              <Routes>
                <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/stores" element={<StoreList />} />
                <Route path="/stores/:storeId" element={<StoreDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
              </Routes>
            </Container>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
