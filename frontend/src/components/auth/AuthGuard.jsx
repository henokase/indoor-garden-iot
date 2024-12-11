import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function AuthGuard({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const isLoginPage = location.pathname === '/login' || location.pathname === '/'

    if (!isAuthenticated && !isLoginPage) {
      navigate('/login')
    } else if (isAuthenticated && isLoginPage) {
      navigate('/dashboard')
    }
  }, [location.pathname, navigate])

  return children
} 