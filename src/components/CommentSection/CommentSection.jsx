import { useState, useEffect, useRef } from 'react'
import { subscribeToComments, addComment, deleteComment } from '../../services/post.service'
import useAuthStore from '../../store/useAuthStore'
import Avatar from '../Avatar/Avatar'
import { formatRelativeTime } from '../../lib/utils'
import styles from './CommentSection.module.css'

const PAGE = 5   // số bình luận mỗi lần load

export default function CommentSection({ postId, totalCount = 0 }) {
  const [comments,  setComments]  = useState([])
  const [visLimit,  setVisLimit]  = useState(PAGE)
  const [content,   setContent]   = useState('')
  const [sending,   setSending]   = useState(false)
  const { user, profile } = useAuthStore()
  const isTeacher = profile?.role === 'teacher'
  const inputRef  = useRef(null)

  // Query limit+1 → nếu trả về đúng limit+1 thì còn bình luận chưa load
  useEffect(() => {
    return subscribeToComments(
      postId,
      data => setComments(data),
      ()   => setComments([]),
      visLimit + 1,
    )
  }, [postId, visLimit])

  const displayed = comments.slice(0, visLimit)
  const hasMore   = comments.length > visLimit

  // Tổng bình luận: ưu tiên số thực tế đã load, fallback về trường post
  const shownCount = displayed.length
  const knownTotal = Math.max(shownCount, totalCount)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || !user || !profile || sending) return
    setSending(true)
    try {
      await addComment(postId, user.uid, profile, content.trim())
      setContent('')
      // Mở rộng limit để bình luận vừa gửi hiện ngay
      setVisLimit(v => Math.max(v, shownCount + 1))
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.section}>

      {/* Header đếm bình luận */}
      {knownTotal > 0 && (
        <div className={styles.countRow}>
          💬 {shownCount} / {knownTotal} bình luận
        </div>
      )}

      {/* Danh sách */}
      {displayed.length > 0 && (
        <div className={styles.list}>
          {displayed.map(c => (
            <div key={c.id} className={styles.item}>
              <Avatar src={c.authorPhotoURL} name={c.authorName} uid={c.authorId} size="small" to={`/profile/${c.authorId}`} />
              <div className={styles.bubble}>
                <div className={styles.meta}>
                  <span className={styles.author}>{c.authorName}</span>
                  <span className={styles.time}>{formatRelativeTime(c.createdAt)}</span>
                  {(isTeacher || c.authorId === user?.uid) && (
                    <button
                      className={styles.delComment}
                      onClick={() => deleteComment(c.id, postId)}
                      title="Xoá bình luận"
                    >🗑</button>
                  )}
                </div>
                <div className={styles.text}>{c.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          className={styles.loadMore}
          onClick={() => setVisLimit(v => v + PAGE)}
        >
          Xem thêm bình luận ({comments.length - visLimit} còn lại)
        </button>
      )}

      {/* Input */}
      {user && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Avatar src={profile?.photoURL} name={profile?.displayName} uid={user.uid} size="small" />
          <div className={styles.inputWrap}>
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="Viết bình luận..."
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={300}
              autoComplete="off"
            />
            {content.trim() && (
              <button type="submit" className={styles.send} disabled={sending}>
                {sending ? '…' : '↑'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
