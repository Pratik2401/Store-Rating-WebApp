import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import CommonNavbar from '../Common/CommonNavbar'
import CommonSidebar from '../Common/CommonSidebar'
import Dashboard from './Dashboard/StoreOwnerDashboard'
import StoreOwnerAverageRating from './StoreOwnerAverageRating'
import StoreOwnerRatings from './StoreOwnerRatings'
import '../../styles/layouts/StoreOwner.css'

/**
 * Main store owner dashboard layout component
 * Manages sidebar state and routing for store owner interface
 */
const StoreOwnerDashboard = () => {
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
    <div className="StoreOwnerDashboardContainer">
      <div className="StoreOwnerLayoutRow">
        <div className={`StoreOwnerSidebarContainer${sidebarMobileOpen ? ' open' : ''}`}> 
          <CommonSidebar
            collapsed={sidebarCollapsed}
            mobileOpen={sidebarMobileOpen}
            onCloseMobile={closeSidebarMobile}
            role="storeOwner"
            brandText="Store Rating"
            brandSubtext="Store Owner"
          />
        </div>
        {sidebarMobileOpen && (
          <div
            className="storeowner-sidebar-mobile-overlay show"
            onClick={closeSidebarMobile}
            aria-label="Close sidebar overlay"
            tabIndex={0}
            role="button"
            style={{ zIndex: 1055 }}
          />
        )}
        <div className="StoreOwnerMainColumn">
          <div className={`StoreOwnerNavbarRow${sidebarMobileOpen ? ' hide-when-sidebar-open' : ''}`}> 
            <CommonNavbar 
              onToggleSidebar={openSidebarMobile} 
              sidebarMobileOpen={sidebarMobileOpen} 
              role="storeOwner"
              brandText="Store Owner Portal"
            />
          </div>
          {/* Main Content */}
          <div className={`StoreOwnerMainContent${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}> 
            <Container fluid className="StoreOwnerMainContainer p-4">
              <Routes>
                <Route path="/" element={<Navigate to="/store-owner/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/average-rating" element={<StoreOwnerAverageRating />} />
                <Route path="/ratings" element={<StoreOwnerRatings />} />
              </Routes>
            </Container>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreOwnerDashboard
