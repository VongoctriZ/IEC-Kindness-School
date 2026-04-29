import { useState, useEffect } from 'react'
import { subscribeToLeaderboard, getUserRank } from '../../services/user.service'
import useAuthStore from '../../store/useAuthStore'

export function useLeaderboard(n = 10) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToLeaderboard(
      data => { setUsers(data); setLoading(false) },
      ()   => setLoading(false),
      n,
    )
    return unsub
  }, [n])

  return { users, loading }
}

export function useMyRank() {
  const { user } = useAuthStore()
  const [rank,    setRank]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserRank(user.uid)
      .then(setRank)
      .finally(() => setLoading(false))
  }, [user?.uid])

  return { rank, loading }
}
