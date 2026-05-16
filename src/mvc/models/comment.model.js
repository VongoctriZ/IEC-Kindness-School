/**
 * @typedef {Object} Comment
 * @property {string}  id
 * @property {string}  postId
 * @property {string|null} parentId
 * @property {string}  authorId
 * @property {string}  authorName
 * @property {'student'|'teacher'} authorRole
 * @property {string|null} authorPhotoURL
 * @property {string}  content
 * @property {string|null} mediaUrl
 * @property {'image'|'video'|null} mediaType
 * @property {number}  likeCount
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

export function buildCommentDoc(postId, uid, profile, content, parentId = null, mediaUrl = null, mediaType = null) {
  return {
    postId,
    parentId,
    authorId:       uid,
    authorName:     profile.displayName,
    authorRole:     profile.role,
    authorPhotoURL: profile.photoURL ?? null,
    content,
    mediaUrl,
    mediaType,
    likeCount: 0,
  }
}
