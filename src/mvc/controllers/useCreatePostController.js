import { useCallback } from 'react'
import { createPost }      from '../../services/post.service'
import { uploadPostMedia } from '../../services/storage.service'
import useAuthStore        from '../../store/useAuthStore'
import usePostStore        from '../../store/usePostStore'
import usePointStore       from '../../store/usePointStore'
import { POINTS }          from '../../lib/constants'

export function useCreatePostController() {
  const { user, profile } = useAuthStore()
  const prependPost       = usePostStore(s => s.prependPost)
  const pushPoint         = usePointStore(s => s.push)

  const handleCreatePost = useCallback(async (content, file = null) => {
    if (!user || !profile || !content.trim()) return

    let mediaUrl  = null
    let mediaType = null

    if (file) {
      const result = await uploadPostMedia(user.uid, file)
      mediaUrl  = result.url
      mediaType = result.mediaType
    }

    const postId = await createPost(user.uid, profile, content.trim(), mediaUrl, mediaType)
    prependPost({
      id:             postId,
      authorId:       user.uid,
      authorName:     profile.displayName,
      authorRole:     profile.role,
      authorGrade:    profile.grade ?? '',
      authorPhotoURL: profile.photoURL ?? null,
      content:        content.trim(),
      mediaUrl:       mediaUrl ?? null,
      mediaType:      mediaType ?? null,
      likeCount:      0,
      commentCount:   0,
      createdAt:      { toDate: () => new Date() },
    })
    pushPoint({ action: 'post', points: POINTS.POST, label: 'Đăng bài viết' })
  }, [user, profile])

  return { handleCreatePost }
}
