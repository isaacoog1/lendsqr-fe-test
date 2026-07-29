import { Navigate, Outlet } from 'react-router-dom'
import { STORAGE_KEYS } from '@/constants'

function ProtectedRoute() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
