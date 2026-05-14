import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserDocument, getUserById } from './user.service'

export async function signUp(email, password, displayName, grade = '', role = 'student') {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  await createUserDocument(user, { displayName, grade, role })
  return user
}

export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  const existing = await getUserById(user.uid)
  return { user, isNew: !existing }
}

export function signOutUser() {
  return signOut(auth)
}

export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email)
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback)
}
