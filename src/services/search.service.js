import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from './firebase'

export async function searchUsers(term) {
  if (!term.trim()) return []
  const snap = await getDocs(
    query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(100))
  )
  const q = term.toLowerCase()
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() }))
    .filter(u =>
      u.displayName?.toLowerCase().includes(q) ||
      u.grade?.toLowerCase().includes(q)
    )
}

export async function searchPosts(term) {
  if (!term.trim()) return []
  const snap = await getDocs(
    query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(200))
  )
  const q = term.toLowerCase()
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => p.content?.toLowerCase().includes(q))
}
