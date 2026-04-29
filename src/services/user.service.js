import {
  doc, getDoc, setDoc, updateDoc, getDocs,
  collection, query, orderBy, limit, increment,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { buildUserDoc } from '../mvc/models/user.model'
import { POINTS, LEADERBOARD_SIZE } from '../lib/constants'

export async function createUserDocument(firebaseUser, extra = {}, isNew = true) {
  const ref  = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const data = buildUserDoc(firebaseUser, extra)
    if (!isNew) data.totalPoints = 0
    await setDoc(ref, data)
  }
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null
}

export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), snap => {
    callback(snap.exists() ? { uid: snap.id, ...snap.data() } : null)
  })
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}

export async function getLeaderboard(n = LEADERBOARD_SIZE) {
  const q    = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(n))
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => ({ uid: d.id, rank: i + 1, ...d.data() }))
}

export function subscribeToLeaderboard(callback, onError, n = 10) {
  const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(n))
  return onSnapshot(q,
    snap => callback(snap.docs.map((d, i) => ({ uid: d.id, rank: i + 1, ...d.data() }))),
    err  => { console.error('[subscribeToLeaderboard]', err.code, err.message); onError?.(err) },
  )
}

export async function addPoints(uid, points) {
  await updateDoc(doc(db, 'users', uid), { totalPoints: increment(points) })
}

/** Lấy rank của một user cụ thể (đếm số user có điểm cao hơn) */
export async function getUserRank(uid) {
  const profile = await getUserById(uid)
  if (!profile) return null
  const all = await getLeaderboard(LEADERBOARD_SIZE)
  const idx = all.findIndex(u => u.uid === uid)
  return idx >= 0 ? idx + 1 : null
}
