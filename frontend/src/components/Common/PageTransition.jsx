import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Page Transition Component
 * Prevents abrupt page changes and provides smooth transitions
 */
const PageTransition = ({ children, duration = 300 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const location = useLocation()

  useEffect(() => {
    // Start exit transition
    setIsVisible(false)
    
    // Change content after exit transition
    const changeTimeout = setTimeout(() => {
      setDisplayChildren(children)
      setIsVisible(true)
    }, duration / 2)

    return () => clearTimeout(changeTimeout)
  }, [location.pathname, children, duration])

  useEffect(() => {
    // Initial mount
    setIsVisible(true)
  }, [])

  const transitionStyle = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease-in-out`,
    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
    minHeight: '100vh'
  }

  return (
    <div style={transitionStyle} className="page-transition">
      {displayChildren}
    </div>
  )
}

export default PageTransition
