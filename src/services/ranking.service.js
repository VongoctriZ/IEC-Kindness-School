import {
  collection, query, where, orderBy, getDocs, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { getStartOfWeek } from '../lib/utils'

/**
 * Lấy weekly ranking từ pointHistory collection.
 * @param {number} n — số lượng top user cần lấy
 * @param {(uid: string) => object} getUserMap — map uid → user profile (từ leaderboard data đã có)
 */
export async function getWeeklyRanking(n = 50) {
  const since = Timestamp.fromDate(getStartOfWeek())
  const q = query(
    collection(db, 'pointHistory'),
    where('createdAt', '>=', since),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)

  // Aggregate: uid → weeklyPoints
  const map = {}
  snap.docs.forEach(d => {
    const { uid, points } = d.data()
    if (uid && points) map[uid] = (map[uid] ?? 0) + points
  })

  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([uid, weeklyPoints]) => ({ uid, weeklyPoints }))
}
