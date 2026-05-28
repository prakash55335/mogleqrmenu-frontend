import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div style={{
      backgroundColor: '#000', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '50%',
        border: '3px solid #facc15',
        borderTop: '3px solid transparent',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#facc15', fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px' }}>
        LOADING...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'kitchen') return <Navigate to="/admin/kitchen" replace />
    if (user.role === 'billing') return <Navigate to="/admin/billing" replace />
    return <Navigate to="/admin/tables" replace />
  }

  return children
}