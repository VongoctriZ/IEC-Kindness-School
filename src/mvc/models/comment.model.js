/**
 * @typedef {Object} Comment
 * @property {string}  id
 * @property {string}  postId
 * @property {string}  authorId
 * @property {string}  authorName
 * @property {'student'|'teacher'} authorRole
 * @property {string|null} authorPhotoURL
 * @property {string}  content
 * @property {string|null} mediaUrl
 * @property {'image'|'video'|null} mediaType
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

export function buildCommentDoc(postId, uid, profile, content, mediaUrl = null, mediaType = null) {
  return {
    postId,
    authorId:       uid,
    authorName:     profile.displayName,
    authorRole:     profile.role,
    authorPhotoURL: profile.photoURL ?? null,
    content,
    mediaUrl,
    mediaType,
  }
}
