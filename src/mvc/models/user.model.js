import { POINTS, ROLES } from '../../lib/constants'

/**
 * @typedef {'student'|'teacher'|'pending_teacher'|'admin'} UserRole
 * @typedef {Object} UserProfile
 * @property {string}   uid
 * @property {string}   displayName
 * @property {string}   email
 * @property {string|null} photoURL
 * @property {string|null} coverURL
 * @property {UserRole} role
 * @property {string}   grade
 * @property {number}   totalPoints
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

export function buildUserDoc(firebaseUser, extra = {}) {
  const role = extra.role ?? ROLES.STUDENT
  return {
    displayName: extra.displayName ?? firebaseUser.displayName ?? '',
    email:       firebaseUser.email,
    photoURL:    firebaseUser.photoURL ?? null,
    coverURL:    null,
    role,
    grade:       extra.grade ?? '',
    totalPoints: role === ROLES.PENDING_TEACHER ? 0 : POINTS.REGISTER,
    createdAt:   new Date(),
  }
}
