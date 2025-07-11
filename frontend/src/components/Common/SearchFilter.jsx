import React from 'react'
import { Form } from 'react-bootstrap'

/**
 * Search and filter component with dynamic filter options
 * Provides search input and multiple filter dropdowns
 */
const SearchFilter = ({ 
  searchValue, 
  onSearchChange, 
  placeholder = 'Search...', 
  filters = [], 
  activeFilters = {}, 
  onFilterChange,
  className = ''
}) => {
  return (
    <div className={`SearchFilterContainer ${className}`}>
      <div className="SearchFilterRow row g-3">
        <div className="SearchInputCol col-md-6">
          <Form.Group className="SearchInputGroup">
            <Form.Control
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="SearchInput"
            />
          </Form.Group>
        </div>
        
        {filters.map((filter, index) => (
          <div key={filter.key} className="FilterCol col-md-3">
            <Form.Group className="FilterGroup">
              <Form.Select
                value={activeFilters[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="FilterSelect"
              >
                <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                {filter.options.map((option, optionIndex) => (
                  <option key={`${filter.key}-${option.value}-${optionIndex}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchFilter
