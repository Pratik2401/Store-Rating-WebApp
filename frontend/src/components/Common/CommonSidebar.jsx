import React from 'react'
import { Nav, Button } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  FaTimes, FaHome, FaStore, FaStar, FaUser, FaUsers, FaCog, FaChartBar 
} from 'react-icons/fa'
import '../../styles/components/CommonSidebar.css'

const CommonSidebar = ({ 
  collapsed, 
  mobileOpen, 
  onCloseMobile,
  role = 'user', // 'user', 'admin', 'systemAdmin'
  brandText = 'Store Rating',
  brandSubtext = 'User Portal'
}) => {
  const location = useLocation()

  const getSidebarItems = () => {
    switch (role) {
      case 'systemAdmin':
        return [
          {
            icon: FaHome,
            label: 'Dashboard',
            path: '/admin/dashboard',
            exact: true
          },
          {
            icon: FaUsers,
            label: 'User Management',
            path: '/admin/users'
          },
          {
            icon: FaStore,
            label: 'Store Management',
            path: '/admin/stores'
          }
        ]
      case 'admin':
        return [
          {
            icon: FaHome,
            label: 'Dashboard',
            path: '/admin/dashboard',
            exact: true
          },
          {
            icon: FaStore,
            label: 'Store Management',
            path: '/admin/stores'
          },
          {
            icon: FaChartBar,
            label: 'Analytics',
            path: '/admin/analytics'
          },
          {
            icon: FaUser,
            label: 'Profile',
            path: '/admin/profile'
          }
        ]
      case 'storeOwner':
        return [
          {
            icon: FaHome,
            label: 'Dashboard',
            path: '/store-owner/dashboard',
            exact: true
          },
          {
            icon: FaStar,
            label: 'Average Rating',
            path: '/store-owner/average-rating'
          },
          {
            icon: FaUsers,
            label: 'User Ratings',
            path: '/store-owner/ratings'
          }
        ]
      case 'user':
      default:
        return [
          {
            icon: FaHome,
            label: 'Dashboard',
            path: '/user/dashboard',
            exact: true
          },
          {
            icon: FaStore,
            label: 'Browse Stores',
            path: '/user/stores'
          },
          {
            icon: FaUser,
            label: 'Profile',
            path: '/user/profile'
          }
        ]
    }
  }

  const getBrandIcon = () => {
    switch (role) {
      case 'systemAdmin':
      case 'admin':
        return FaCog
      case 'storeOwner':
        return FaStore
      case 'user':
      default:
        return FaStore
    }
  }

  const getBrandSubtext = () => {
    switch (role) {
      case 'systemAdmin':
        return 'System Admin'
      case 'admin':
        return 'Admin Portal'
      case 'storeOwner':
        return 'Store Owner'
      case 'user':
      default:
        return brandSubtext
    }
  }

  const sidebarItems = getSidebarItems()
  const BrandIcon = getBrandIcon()

  return (
    <>
      <div className={`CommonSidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="CommonSidebarContent">
          {/* Header */}
          <div className="CommonSidebarHeader">
            <div className="CommonSidebarLogo d-flex align-items-center">
              <div className="CommonSidebarLogoIcon bg-primary text-white rounded me-3">
                <BrandIcon />
              </div>
              {!collapsed && (
                <div className="CommonSidebarLogoText">
                  <div className="CommonSidebarTitle fw-bold">{brandText}</div>
                  <div className="CommonSidebarSubtitle small text-muted">{getBrandSubtext()}</div>
                </div>
              )}
            </div>
            
            {/* Mobile Close Button */}
            <Button
              variant="outline-secondary"
              size="sm"
              className="CommonSidebarCloseBtn d-lg-none"
              onClick={onCloseMobile}
            >
              <FaTimes />
            </Button>
          </div>

          {/* Navigation */}
          <Nav className="CommonSidebarNav flex-column">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={`CommonSidebarNavLink nav-link ${isActive ? 'active' : ''}`}
                  onClick={mobileOpen ? onCloseMobile : undefined}
                >
                  <Icon className="CommonSidebarNavIcon" />
                  {!collapsed && (
                    <span className="CommonSidebarNavLabel">{item.label}</span>
                  )}
                </NavLink>
              )
            })}
          </Nav>

          {/* Footer */}
          {!collapsed && (
            <div className="CommonSidebarFooter mt-auto">
              <div className="CommonSidebarFooterContent text-center">
                <small className="text-muted">
                  Store Rating System v1.0
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CommonSidebar
