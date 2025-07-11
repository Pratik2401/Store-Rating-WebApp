import React from 'react'
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap'
import { FaBars, FaUser, FaDoorOpen } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../styles/components/CommonNavbar.css'

/**
 * Common navigation bar component with user dropdown and sidebar toggle
 * Supports different user roles and responsive design
 */
const CommonNavbar = ({ 
  onToggleSidebar, 
  sidebarMobileOpen = false,
  role = 'user', // 'user', 'admin', 'systemAdmin'
  brandText = 'Store Rating System'
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  /**
   * Handles user logout with confirmation
   */
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  /**
   * Returns user-friendly role display name
   */
  const getRoleDisplayName = () => {
    switch (role) {
      case 'systemAdmin':
        return 'System Admin'
      case 'admin':
        return 'Admin'
      case 'storeOwner':
        return 'Store Owner'
      case 'user':
      default:
        return 'User'
    }
  }

  /**
   * Returns Bootstrap badge color variant for user role
   */
  const getRoleBadgeColor = () => {
    switch (role) {
      case 'systemAdmin':
        return 'danger'
      case 'admin':
        return 'warning'
      case 'storeOwner':
        return 'info'
      case 'user':
      default:
        return 'success'
    }
  }

  return (
    <div
      className={`CommonNavbarOuter${sidebarMobileOpen ? ' hide-on-mobile' : ''}`}
    >
      <Navbar
        expand="lg"
        className="CommonNavbar shadow-sm vamtam-navbar navbar-white-bg"
      >
        {/* Sidebar Toggle Button - prominent on mobile */}
        <Button
          size="lg"
          onClick={onToggleSidebar}
          className="CommonSidebarToggle me-3 border-0 vamtam-navbar-toggle d-lg-none"
          aria-label="Open sidebar menu"
        >
          <FaBars />
        </Button>

        <div className="CommonNavbarBrand d-lg-none">
          {brandText}
        </div>

        <Nav className="CommonNavRight ms-auto flex-row align-items-center">
          <NavDropdown
            title={
              <span className="CommonUserDropdownTitle navbar-user-color d-flex align-items-center">
                <FaUser className="CommonUserIcon me-2 navbar-usericon-color" />
                <span className="d-none d-sm-inline">{user?.name || getRoleDisplayName()}</span>
              </span>
            }
            id="CommonUserDropdown"
            align="end"
            className="CommonUserDropdown"
            menuVariant="light"
            style={{ position: 'static' }}
          >
            <NavDropdown.Item className="CommonUserDropdownItem" disabled>
              <div className="CommonUserInfo">
                <div className="CommonUserName fw-bold navbar-username-color">{user?.name}</div>
                <div className="CommonUserEmail small navbar-useremail-color">{user?.email}</div>
                <div className="CommonUserRole small">
                  <span className={`CommonRoleBadge badge bg-${getRoleBadgeColor()} navbar-rolebadge-color`}>
                    {getRoleDisplayName()}
                  </span>
                </div>
              </div>
            </NavDropdown.Item>
            
            <NavDropdown.Item 
              className="CommonLogoutItem text-danger"
              onClick={handleLogout}
            >
              <FaDoorOpen className="CommonLogoutIcon me-2" />
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>
    </div>
  )
}

export default CommonNavbar
