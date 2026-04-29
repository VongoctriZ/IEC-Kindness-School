import { POINTS, ROLES } from '../../lib/constants'

/**
 * @typedef {Object} UserProfile
 * @property {string}  uid
 * @property {string}  displayName
 * @property {string}  email
 * @property {string|null} photoURL
 * @property {string|null} coverURL
 * @property {'student'|'teacher'} role
 * @property {string}  grade        — lớp học, VD "10A1"
 * @property {number}  totalPoints
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/** Tạo document mới cho users/{uid} */
export function buildUserDoc(firebaseUser, extra = {}) {
  return {
    displayName: extra.displayName ?? firebaseUser.displayName ?? '',
    email:       firebaseUser.email,
    photoURL:    firebaseUser.photoURL ?? null,
    coverURL:    null,
    role:        ROLES.STUDENT,
    grade:       extra.grade ?? '',
    totalPoints: POINTS.REGISTER,
    createdAt:   new Date(),
  }
}
