/**
 * @typedef {Object} Post
 * @property {string}  id
 * @property {string}  authorId
 * @property {string}  authorName
 * @property {'student'|'teacher'} authorRole
 * @property {string}  authorGrade
 * @property {string|null} authorPhotoURL
 * @property {string}  content
 * @property {string|null} mediaUrl
 * @property {'image'|'video'|null} mediaType
 * @property {number}  likeCount
 * @property {number}  commentCount
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/** Tạo payload cho posts collection */
export function buildPostDoc(uid, profile, content, mediaUrl = null, mediaType = null) {
  return {
    authorId:        uid,
    authorName:      profile.displayName,
    authorRole:      profile.role,
    authorGrade:     profile.grade ?? '',
    authorPhotoURL:  profile.photoURL ?? null,
    content,
    mediaUrl,
    mediaType,
    likeCount:    0,
    commentCount: 0,
  }
}
