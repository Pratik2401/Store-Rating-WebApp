import React from 'react'
import { Table, Button, Badge } from 'react-bootstrap'
import { FaSort, FaChevronUp, FaChevronDown, FaEye, FaEdit, FaTrash } from 'react-icons/fa'

/**
 * Reusable data table component with sorting, filtering, and custom column rendering
 * Supports loading states, empty states, and action buttons
 */
const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  sortField = '',
  sortDirection = 'asc',
  onSort,
  onView,
  className = '',
  emptyMessage = 'No data available',
  emptyIcon: EmptyIcon
}) => {
  /**
   * Returns appropriate sort icon based on current sort state
   */
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="SortIcon" />
    return sortDirection === 'asc' ? 
      <FaChevronUp className="SortIcon" /> : 
      <FaChevronDown className="SortIcon" />
  }

  /**
   * Handles sort functionality for table columns
   */
  const handleSort = (field) => {
    if (onSort) {
      const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(field, direction)
    }
  }

  /**
   * Renders cell content based on column configuration and data type
   */
  const renderCellValue = (value, column, row) => {
    if (column.type === 'badge') {
      const variant = column.getVariant ? column.getVariant(value) : 'primary'
      return <Badge bg={variant} className="CellBadge">{value}</Badge>
    }
    
    if (column.type === 'rating') {
      return (
        <div className="RatingCell">
          <span className="RatingValue">{value || 'N/A'}</span>
          {value && <span className="RatingStars">{'★'.repeat(Math.round(value))}</span>}
        </div>
      )
    }
    
    if (column.render) {
      return column.render(row)
    }
    
    return value || 'N/A'
  }

  if (loading) {
    return (
      <div className="DataTableLoading text-center py-5">
        <div className="LoadingSpinner spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="DataTableEmpty text-center py-5">
        {EmptyIcon && <EmptyIcon className="EmptyIcon mb-3 text-muted" size={48} />}
        <p className="EmptyMessage text-muted mb-0">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`DataTableContainer ${className}`}>
      <Table responsive striped hover className="DataTable">
        <thead className="DataTableHeader">
          <tr className="DataTableHeaderRow">
            {columns.map((column) => (
              <th 
                key={column.key}
                className={`DataTableHeaderCell ${column.sortable ? 'sortable' : ''}`}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
                style={{ cursor: column.sortable ? 'pointer' : 'default' }}
              >
                <div className="HeaderCellContent d-flex align-items-center">
                  <span className="HeaderLabel">{column.label}</span>
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
            <th className="DataTableActionsHeader">View</th>
          </tr>
        </thead>
        <tbody className="DataTableBody">
          {data.map((row, index) => (
            <tr key={row.id || index} className="DataTableRow">
              {columns.map((column) => (
                <td key={column.key} className="DataTableCell">
                  {renderCellValue(row[column.key], column, row)}
                </td>
              ))}
              <td className="DataTableActionsCell">
                {onView && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onView(row)}
                    className="ActionButton ViewButton"
                  >
                    <FaEye className="ActionIcon" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default DataTable
