import { useEffect, useCallback } from 'react'
import {
  subscribeToPosts, createPost, toggleLike, isLikedByUser, deletePost,
} from '../../services/post.service'
import { uploadPostMedia } from '../../services/storage.service'
import usePostStore   from '../../store/usePostStore'
import useAuthStore   from '../../store/useAuthStore'
import usePointStore  from '../../store/usePointStore'
import { POINTS }     from '../../lib/constants'

export function useFeedController() {
  const { posts, likedPosts, loading, setPosts, setLikedPosts, setLoading, toggleLikeLocally, removePost } = usePostStore()
  const { user, profile }  = useAuthStore()
  const pushPoint          = usePointStore(s => s.push)

  useEffect(() => {
    setLoading(true)

    const unsub = subscribeToPosts(
      async newPosts => {
        setPosts(newPosts)
        if (user && newPosts.length > 0) {
          const checks = await Promise.all(
            newPosts.map(p => isLikedByUser(p.id, user.uid).then(liked => liked ? p.id : null)),
          )
          setLikedPosts(new Set(checks.filter(Boolean)))
        }
        setLoading(false)
      },
      () => setLoading(false),  // thoát spinner khi lỗi
    )

    return unsub
  }, [user?.uid])

  const handleCreatePost = useCallback(async (content, file = null) => {
    if (!user || !profile || !content.trim()) return

    let mediaUrl = null
    let mediaType = null

    if (file) {
      const result = await uploadPostMedia(user.uid, file)
      mediaUrl  = result.url
      mediaType = result.mediaType
    }

    await createPost(user.uid, profile, content.trim(), mediaUrl, mediaType)
    pushPoint({ action: 'post', points: POINTS.POST, label: 'Đăng bài viết' })
  }, [user, profile])

  const handleLike = useCallback(async (postId) => {
    if (!user) return
    toggleLikeLocally(postId)  // optimistic update
    try {
      await toggleLike(postId, user.uid)
    } catch {
      toggleLikeLocally(postId)  // revert on error
    }
  }, [user])

  const handleDelete = useCallback(async (postId) => {
    if (!user) return
    removePost(postId)  // optimistic
    try {
      await deletePost(postId, user.uid)
    } catch (e) {
      console.error(e)
    }
  }, [user])

  return { posts, likedPosts, loading, handleCreatePost, handleLike, handleDelete }
}
