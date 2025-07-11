import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Form, InputGroup, Button, Badge, Alert, Spinner, Pagination } from 'react-bootstrap'
// Removed react-icons imports as we're using direct SVG elements
import { useNavigate } from 'react-router-dom'
import userAPI from '../../../api/User/userAPI'
import { showSuccessAlert, showErrorAlert } from '../../../utils/SweetAlert'
import '../../../styles/components/StoreList.css'

const StoreList = () => {
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [storesPerPage] = useState(9)

  // Removed useAuth userAPI, use direct import
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    filterStores()
  }, [stores, searchTerm, ratingFilter])

  const fetchStores = async () => {
    try {
      setLoading(true)
      setError('')
      // Get all stores without any parameters
      const response = await userAPI.getStores();
      const fetchedStores = response.stores || []
      setStores(fetchedStores)
      setFilteredStores(fetchedStores)
    } catch (err) {
      setError('Failed to load stores. Please try again.')
      console.error('Store fetch error:', err)
      showErrorAlert('Error', 'Failed to fetch stores. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterStores = () => {
    let filtered = [...stores]

    // Search filter - only filter by name and address per requirements
    if (searchTerm.trim()) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Rating filter
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter)
      filtered = filtered.filter(store => {
        // Make sure average_rating exists and is a valid number
        const storeRating = parseFloat(store.average_rating || 0)
        return !isNaN(storeRating) && storeRating >= minRating
      })
    }

    setFilteredStores(filtered)
    setCurrentPage(1)
  }

  const renderStarRating = (rating) => {
    const numRating = Number(rating) || 0;
    const stars = []
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 >= 0.5

    // Full stars - use direct SVG for more control
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg 
          key={`full-${i}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 576 512" 
          width="1em" 
          height="1em" 
          fill="#010ED0"
          className="text-warning active"
        >
          <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg>
      )
    }

    // Half star
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <svg 
          key="half" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 576 512" 
          width="1em" 
          height="1em" 
          fill="#010ED0"
          className="text-warning active" 
          style={{ opacity: 0.5 }}
        >
          <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg>
      )
    }

    // Empty stars
    const totalStars = hasHalfStar ? fullStars + 1 : fullStars
    const emptyStars = 5 - totalStars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg 
          key={`empty-${i}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 576 512" 
          width="1em" 
          height="1em" 
          fill="#dee2e6"
          className="text-muted"
        >
          <path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z" />
        </svg>
      )
    }

    return <div className="d-flex align-items-center">{stars}</div>
  }

  const handleStoreClick = (storeId) => {
    navigate(`/user/stores/${storeId}`)
  }

  // Removed getUniqueCategories function

  // Pagination logic
  const indexOfLastStore = currentPage * storesPerPage
  const indexOfFirstStore = indexOfLastStore - storesPerPage
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore)
  const totalPages = Math.ceil(filteredStores.length / storesPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="StoreListLoading text-center py-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3 ">Loading stores...</p>
      </div>
    );
  }

  return (
    <div className="StoreList">
      {/* Header */}
      <div className="StoreListHeader mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap">
          <div>
            <h2 className="StoreListTitle h3 mb-2">Browse Stores</h2>
            <p className="StoreListSubtitle  mb-0">
              Discover and rate amazing stores in your area
            </p>
          </div>
          <div className="StoreListStats text-end">
            <Badge bg="primary" className="me-2">
              {filteredStores.length} stores found
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="StoreListFilters mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Label className="fw-semibold">
                <svg 
                  stroke="currentColor" 
                  fill="#010ED0" 
                  strokeWidth="0" 
                  viewBox="0 0 512 512" 
                  className="me-2" 
                  height="1em" 
                  width="1em" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
                </svg>
                Search Stores
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Label className="fw-semibold">
                <svg 
                  stroke="currentColor" 
                  fill="#010ED0" 
                  strokeWidth="0" 
                  viewBox="0 0 576 512" 
                  className="me-2" 
                  height="1em" 
                  width="1em" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                </svg>
                Minimum Rating
              </Form.Label>
              <Form.Select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* No Results */}
      {filteredStores.length === 0 && !loading && (
        <Card className="StoreListNoResults text-center py-5">
          <Card.Body>
            <svg 
              stroke="currentColor" 
              fill="#010ED0" 
              strokeWidth="0" 
              viewBox="0 0 512 512" 
              className="mb-3" 
              height="48" 
              width="48" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
            </svg>
            <h4 className="">No stores found</h4>
            <p className=" mb-0">
              Try adjusting your search criteria or filters
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Store Grid */}
      {filteredStores.length > 0 && (
        <>
          <Row className="g-4">
            {currentStores.map(store => (
              <Col key={store.id} lg={4} md={6}>
                <Card className="StoreCard h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="StoreCardHeader mb-2">
                      <Card.Title className="StoreCardTitle h5 mb-1">
                        {store.name}
                      </Card.Title>
                      {/* Category badge removed */}
                    </div>

                    <div className="StoreCardLocation mb-3">
                      <div className="">
                        <svg 
                          stroke="currentColor" 
                          fill="#010ED0" 
                          strokeWidth="0" 
                          viewBox="0 0 384 512" 
                          className="me-2" 
                          height="1em" 
                          width="1em" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"></path>
                        </svg>
                        <strong>Address:</strong> {store.address}
                      </div>
                    </div>

                    <div className="StoreCardRating mb-3">
                      <div className="mb-2">
                        <strong>Overall Rating:</strong>
                        <div className="d-flex align-items-center mt-1">
                          <div className="StoreCardStars me-2">
                            {renderStarRating(Number(store.average_rating) || 0)}
                          </div>
                          <span className="fw-semibold">
                            {(Number(store.average_rating) || 0).toFixed(1)}/5.0
                          </span>
                          <small className=" ms-2">
                            ({store.total_ratings || 0} reviews)
                          </small>
                        </div>
                      </div>

                      {store.user_rating && (
                        <div className="mb-2">
                          <strong>Your Rating:</strong>
                          <div className="d-flex align-items-center mt-1">
                            <div className="StoreCardStars me-2">
                              {renderStarRating(Number(store.user_rating) || 0)}
                            </div>
                            <span className="text-success fw-semibold">
                              {store.user_rating}/5.0
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="StoreCardActions mt-auto">
                      <div className="d-grid gap-2">
                        <Button
                          className="action-btn"
                          onClick={() => handleStoreClick(store.id)}
                        >
                          <svg 
                            stroke="currentColor" 
                            fill="#010ED0" 
                            strokeWidth="0" 
                            viewBox="0 0 576 512" 
                            className="me-2" 
                            height="1em" 
                            width="1em" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
                          </svg>
                          Visit Store
                        </Button>
                        
                        {store.user_rating ? (
                          <Button
                            className="action-btn-outline btn-outline-warning"
                            size="sm"
                            onClick={() => handleStoreClick(store.id)}
                          >
                            <svg 
                              stroke="currentColor" 
                              fill="currentColor" 
                              strokeWidth="0" 
                              viewBox="0 0 576 512" 
                              className="me-2" 
                              height="1em" 
                              width="1em" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                            </svg>
                            Modify Rating
                          </Button>
                        ) : (
                          <Button
                            className="action-btn-outline btn-outline-success"
                            size="sm"
                            onClick={() => handleStoreClick(store.id)}
                          >
                            <svg 
                              stroke="currentColor" 
                              fill="#010ED0" 
                              strokeWidth="0" 
                              viewBox="0 0 576 512" 
                              className="me-2" 
                              height="1em" 
                              width="1em" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                            </svg>
                            Submit Rating
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="StoreListPagination d-flex justify-content-center mt-5">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    )
                  } else if (
                    pageNumber === currentPage - 3 ||
                    pageNumber === currentPage + 3
                  ) {
                    return <Pagination.Ellipsis key={pageNumber} />
                  }
                  return null
                })}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StoreList
