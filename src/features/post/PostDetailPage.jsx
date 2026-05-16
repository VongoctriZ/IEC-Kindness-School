import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { subscribeToPost, toggleLike, isLikedByUser, deletePost } from '../../services/post.service'
import useAuthStore from '../../store/useAuthStore'
import PostCard from '../../components/PostCard/PostCard'
import Spinner  from '../../components/Spinner/Spinner'
import styles   from './PostDetailPage.module.css'

export default function PostDetailPage() {
  const { postId }            = useParams()
  const navigate              = useNavigate()
  const { user, profile }     = useAuthStore()
  const [post,       setPost]       = useState(null)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)

  useEffect(() => {
    if (!postId) return
    setLoading(true)
    const unsub = subscribeToPost(
      postId,
      p => {
        if (!p) { setNotFound(true); setLoading(false); return }
        setPost(p)
        setLoading(false)
      },
      () => { setNotFound(true); setLoading(false) },
    )
    return unsub
  }, [postId])

  useEffect(() => {
    if (!post || !user) return
    isLikedByUser(post.id, user.uid).then(liked => {
      setLikedPosts(liked ? new Set([post.id]) : new Set())
    })
  }, [post?.id, user?.uid])

  async function handleLike(pid) {
    if (!user) return
    setLikedPosts(prev => {
      const next = new Set(prev)
      next.has(pid) ? next.delete(pid) : next.add(pid)
      return next
    })
    try {
      const nowLiked = await toggleLike(pid, user.uid)
      setLikedPosts(prev => {
        const next = new Set(prev)
        nowLiked ? next.add(pid) : next.delete(pid)
        return next
      })
    } catch {
      setLikedPosts(prev => {
        const next = new Set(prev)
        next.has(pid) ? next.delete(pid) : next.add(pid)
        return next
      })
    }
  }

  async function handleDelete(pid) {
    if (!user) return
    try {
      await deletePost(pid, user.uid)
      navigate('/')
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return (
    <div className={styles.center}><Spinner size="lg" /></div>
  )

  if (notFound || !post) return (
    <div className={styles.center}>
      <div className={styles.notFound}>
        <div className={styles.notFoundIco}>🔍</div>
        <p>Bài viết không tồn tại hoặc đã bị xoá.</p>
        <Link to="/" className={styles.backHome}>← Về trang chủ</Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>← Quay lại</button>
      </div>
      <PostCard
        post={post}
        isLiked={likedPosts.has(post.id)}
        onLike={handleLike}
        onDelete={handleDelete}
        currentUid={user?.uid}
        currentUserRole={profile?.role}
      />
    </div>
  )
}
