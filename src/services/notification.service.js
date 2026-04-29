import {
  collection, addDoc, doc, updateDoc, getDocs,
  query, orderBy, limit, where, serverTimestamp, writeBatch,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

const NOTIF_LIMIT = 30

export async function createNotification(toUid, { type, fromUid, fromName, fromPhotoURL, postId, postSnippet }) {
  if (toUid === fromUid) return   // không tự thông báo chính mình
  await addDoc(collection(db, 'notifications', toUid, 'items'), {
    type,
    fromUid,
    fromName,
    fromPhotoURL:  fromPhotoURL ?? null,
    postId,
    postSnippet:   postSnippet?.slice(0, 60) ?? '',
    read:          false,
    createdAt:     serverTimestamp(),
  })
}

export function subscribeToNotifications(uid, callback, onError) {
  const q = query(
    collection(db, 'notifications', uid, 'items'),
    orderBy('createdAt', 'desc'),
    limit(NOTIF_LIMIT),
  )
  return onSnapshot(q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err  => { console.error('[subscribeToNotifications]', err); onError?.(err) },
  )
}

export async function markAllRead(uid) {
  const snap = await getDocs(
    query(collection(db, 'notifications', uid, 'items'), where('read', '==', false))
  )
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { read: true }))
  await batch.commit()
}
