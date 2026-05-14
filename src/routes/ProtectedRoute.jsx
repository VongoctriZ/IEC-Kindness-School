import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import Spinner from '../components/Spinner/Spinner'
import { ROLES } from '../lib/constants'
import styles from './ProtectedRoute.module.css'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, needsOnboarding } = useAuthStore()

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  // New Google user — OnboardingModal handled inside MainLayout
  if (needsOnboarding) return children
  // Wait for Firestore profile to load
  if (!profile) return <div className={styles.center}><Spinner size="lg" /></div>
  // Pending teachers cannot access the main app
  if (profile.role === ROLES.PENDING_TEACHER) return <Navigate to="/pending" replace />

  return children
}
