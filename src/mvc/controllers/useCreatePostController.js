import { useCallback } from 'react'
import { createPost }      from '../../services/post.service'
import { uploadPostMedia } from '../../services/storage.service'
import useAuthStore        from '../../store/useAuthStore'
import usePointStore       from '../../store/usePointStore'
import { POINTS }          from '../../lib/constants'

export function useCreatePostController() {
  const { user, profile } = useAuthStore()
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

    await createPost(user.uid, profile, content.trim(), mediaUrl, mediaType)
    pushPoint({ action: 'post', points: POINTS.POST, label: 'Đăng bài viết' })
  }, [user, profile])

  return { handleCreatePost }
}
