import React from 'react'
import { Button, Breadcrumb, Badge } from 'react-bootstrap'
import { FaPlus, FaSyncAlt, FaFilter, FaFileDownload } from 'react-icons/fa'
import '../../styles/components/PageHeader.css'

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  stats = [],
  showRefresh = false,
  onRefresh,
  loading = false,
  className = ''
}) => {
  const renderAction = (action, index) => {
    const {
      label,
      icon: IconComponent = FaPlus,
      variant = 'primary',
      size = 'sm',
      onClick,
      disabled = false,
      loading: actionLoading = false,
      className: actionClassName = ''
    } = action

    return (
      <Button
        key={index}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || actionLoading}
        className={`PageHeaderAction ${actionClassName}`}
      >
        {actionLoading ? (
          <div className="spinner-border spinner-border-sm me-2" role="status" />
        ) : (
          IconComponent && <IconComponent className="me-2" />
        )}
        {label}
      </Button>
    )
  }

  const renderStat = (stat, index) => {
    const {
      label,
      value,
      variant = 'primary',
      icon: IconComponent,
      className: statClassName = ''
    } = stat

    return (
      <Badge
        key={index}
        bg={variant}
        className={`PageHeaderStat ${statClassName}`}
      >
        {IconComponent && <IconComponent className="me-2" />}
        {value} {label}
      </Badge>
    )
  }

  return (
    <div className={`PageHeader ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb className="PageHeaderBreadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <Breadcrumb.Item
              key={index}
              active={index === breadcrumbs.length - 1}
              href={crumb.href}
              onClick={crumb.onClick}
            >
              {crumb.icon && <crumb.icon className="me-1" />}
              {crumb.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* Main Header Content */}
      <div className="PageHeaderContent">
        <div className="PageHeaderInfo">
          <h1 className="PageHeaderTitle">{title}</h1>
          {subtitle && (
            <p className="PageHeaderSubtitle">{subtitle}</p>
          )}
          
          {/* Stats */}
          {stats.length > 0 && (
            <div className="PageHeaderStats">
              {stats.map(renderStat)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="PageHeaderActions">
          {showRefresh && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="PageHeaderRefresh me-2"
            >
              <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {actions.map(renderAction)}
        </div>
      </div>
    </div>
  )
}

// Preset action creators for common use cases
export const createAddAction = (onClick, label = 'Add New', loading = false) => ({
  label,
  icon: FaPlus,
  variant: 'primary',
  onClick,
  loading
})

export const createFilterAction = (onClick, label = 'Filter', loading = false) => ({
  label,
  icon: FaFilter,
  variant: 'outline-secondary',
  onClick,
  loading
})

export const createExportAction = (onClick, label = 'Export', loading = false) => ({
  label,
  icon: FaFileDownload,
  variant: 'outline-primary',
  onClick,
  loading
})

export default PageHeader
