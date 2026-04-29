import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import Spinner from '../components/Spinner/Spinner'
import styles from './ProtectedRoute.module.css'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) return (
    <div className={styles.center}><Spinner size="lg" /></div>
  )

  return user ? children : <Navigate to="/login" replace />
}
