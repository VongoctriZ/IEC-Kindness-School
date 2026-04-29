import { useEffect, useRef } from 'react'
import AppRouter from './routes/AppRouter'
import useAuthStore from './store/useAuthStore'
import { subscribeToAuth }        from './services/auth.service'
import { subscribeToUserProfile } from './services/user.service'

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore()
  const profileUnsubRef = useRef(null)

  useEffect(() => {
    const authUnsub = subscribeToAuth(firebaseUser => {
      // Teardown previous profile listener on every auth change
      profileUnsubRef.current?.()
      profileUnsubRef.current = null

      if (firebaseUser) {
        setUser(firebaseUser)
        // Real-time profile listener — fires again when createUserDocument
        // writes the doc (fixes race condition during signup)
        profileUnsubRef.current = subscribeToUserProfile(firebaseUser.uid, profile => {
          setProfile(profile)
          setLoading(false)
        })
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      authUnsub()
      profileUnsubRef.current?.()
    }
  }, [])

  return <AppRouter />
}
