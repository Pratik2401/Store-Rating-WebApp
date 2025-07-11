import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import CommonNavbar from '../Common/CommonNavbar'
import CommonSidebar from '../Common/CommonSidebar'
import Dashboard from './Dashboard/SystemAdminDashboard'
import UserManagement from './UserManagement/SystemAdminUserManagement'
import UserDetails from './UserManagement/UserDetails'
import StoreManagement from './StoreManagement/SystemAdminStoreManagement'
import '../../styles/layouts/SystemAdmin.css'

const SystemAdminStructure = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    setSidebarMobileOpen((open) => !open)
  }

  const openSidebarMobile = () => setSidebarMobileOpen(true)
  const closeSidebarMobile = () => setSidebarMobileOpen(false)

  return (
    <div className="AdminDashboardContainer">
      <div className="AdminLayoutRow">
        {/* Sidebar (desktop + mobile) */}
        <div className={`AdminSidebarContainer${sidebarMobileOpen ? ' open' : ''}`}> 
          <CommonSidebar
            collapsed={sidebarCollapsed}
            mobileOpen={sidebarMobileOpen}
            onCloseMobile={closeSidebarMobile}
            role="systemAdmin"
            brandText="Store Rating"
            brandSubtext="System Admin"
          />
        </div>
        {/* Overlay for mobile when sidebar is open */}
        {sidebarMobileOpen && (
          <div
            className="admin-sidebar-mobile-overlay show"
            onClick={closeSidebarMobile}
            aria-label="Close sidebar overlay"
            tabIndex={0}
            role="button"
            style={{ zIndex: 1055 }}
          />
        )}
        {/* Main Content Area */}
        <div className="AdminMainColumn">
          {/* Navbar inside main content, full width of main column */}
          <div className={`AdminNavbarRow${sidebarMobileOpen ? ' hide-when-sidebar-open' : ''}`}> 
            <CommonNavbar 
              onToggleSidebar={openSidebarMobile} 
              sidebarMobileOpen={sidebarMobileOpen} 
              role="systemAdmin"
              brandText="System Admin Portal"
            />
          </div>
          {/* Main Content */}
          <div className={`AdminMainContent${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}> 
            <Container fluid className="AdminMainContainer p-4">
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/users/:userId" element={<UserDetails />} />
                <Route path="/stores" element={<StoreManagement />} />
              </Routes>
            </Container>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemAdminStructure
