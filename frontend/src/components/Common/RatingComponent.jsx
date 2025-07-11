import React from 'react'
import { FaStar, FaRegStar } from 'react-icons/fa'
import '../../styles/components/RatingComponent.css'

/**
 * Reusable rating component with interactive and display modes
 * Supports different sizes, colors, and precision levels
 */
const RatingComponent = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  showValue = true,
  showCount = false,
  count = 0,
  interactive = false,
  onRatingChange,
  precision = 1,
  color = 'warning',
  className = '',
  disabled = false
}) => {
  /**
   * Handles star click for interactive rating
   */
  const handleStarClick = (value) => {
    if (interactive && !disabled && onRatingChange) {
      onRatingChange(value)
    }
  }

  /**
   * Renders the star rating display
   */
  const renderStars = () => {
    const stars = []
    
    for (let i = 1; i <= maxRating; i++) {
      let StarIcon
      let filled = false
      
      if (rating >= i) {
        StarIcon = FaStar
        filled = true
      } else if (rating >= i - 0.5 && precision === 0.5) {
        StarIcon = FaStar
        filled = true
      } else {
        StarIcon = FaRegStar
        filled = false
      }
      
      stars.push(
        <span
          key={i}
          className={`RatingStar ${size} ${color} ${filled ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => interactive && !disabled && handleStarClick(i)}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive && !disabled ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleStarClick(i)
            }
          }}
        >
          <StarIcon className="StarIcon" />
        </span>
      )
    }
    
    return stars
  }

  const sizeClass = `RatingComponent-${size}`
  const containerClass = `RatingComponent ${sizeClass} ${interactive ? 'interactive' : ''} ${disabled ? 'disabled' : ''} ${className}`

  return (
    <div className={containerClass}>
      <div className="RatingStars">
        {renderStars()}
      </div>
      
      {(showValue || showCount) && (
        <div className="RatingDetails">
          {showValue && (
            <span className="RatingValue">
              {rating.toFixed(precision === 0.5 ? 1 : 0)}
            </span>
          )}
          {showCount && (
            <span className="RatingCount">
              ({count} {count === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Preset configurations
export const StarRating = (props) => (
  <RatingComponent {...props} />
)

export const InteractiveRating = (props) => (
  <RatingComponent interactive={true} {...props} />
)

export const DisplayRating = (props) => (
  <RatingComponent interactive={false} showValue={true} {...props} />
)

export const CompactRating = (props) => (
  <RatingComponent size="sm" showValue={false} {...props} />
)

export default RatingComponent
