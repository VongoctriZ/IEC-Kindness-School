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
  const { posts, likedPosts, loading, feedLimit, setPosts, setLikedPosts, setLoading, toggleLikeLocally, removePost, prependPost, increaseLimit } = usePostStore()
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
      () => setLoading(false),
      feedLimit,
    )

    return unsub
  }, [user?.uid, feedLimit])

  const loadMore = useCallback(() => increaseLimit(), [increaseLimit])
  const hasMore  = posts.length >= feedLimit

  const handleCreatePost = useCallback(async (content, file = null) => {
    if (!user || !profile || !content.trim()) return

    let mediaUrl = null
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
    const snapshot = usePostStore.getState().posts
    removePost(postId)
    try {
      await deletePost(postId, user.uid, profile?.role)
    } catch (e) {
      setPosts(snapshot)
      console.error('[handleDelete]', e.message)
    }
  }, [user, profile])

  return { posts, likedPosts, loading, handleCreatePost, handleLike, handleDelete, loadMore, hasMore }
}
