import { useState, useEffect, useRef } from 'react'
import { subscribeToComments, addComment, deleteComment } from '../../services/post.service'
import useAuthStore from '../../store/useAuthStore'
import Avatar from '../Avatar/Avatar'
import { formatRelativeTime } from '../../lib/utils'
import styles from './CommentSection.module.css'

const PAGE = 5

export default function CommentSection({ postId, totalCount = 0 }) {
  const [allComments, setAllComments] = useState([])
  const [visLimit,    setVisLimit]    = useState(PAGE)
  const [content,     setContent]     = useState('')
  const [sending,     setSending]     = useState(false)
  const [replyTo,     setReplyTo]     = useState(null) // { id, authorName }
  const { user, profile } = useAuthStore()
  const isTeacher = profile?.role === 'teacher'
  const inputRef  = useRef(null)

  useEffect(() => {
    return subscribeToComments(postId, setAllComments, () => setAllComments([]))
  }, [postId])

  // Phân tầng: top-level và replies
  const topLevel = allComments.filter(c => !c.parentId)
  const replyMap = {}
  allComments.forEach(c => {
    if (c.parentId) {
      if (!replyMap[c.parentId]) replyMap[c.parentId] = []
      replyMap[c.parentId].push(c)
    }
  })

  const displayed  = topLevel.slice(0, visLimit)
  const hasMore    = topLevel.length > visLimit
  const knownTotal = Math.max(allComments.length, totalCount)

  function handleReply(comment) {
    setReplyTo({ id: comment.id, authorName: comment.authorName })
    setContent(`@${comment.authorName} `)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function cancelReply() {
    setReplyTo(null)
    setContent('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || !user || !profile || sending) return
    setSending(true)
    const parentId = replyTo?.id ?? null
    const text     = content.trim()
    try {
      await addComment(postId, user.uid, profile, text, parentId)
      setContent('')
      setReplyTo(null)
      if (!parentId) setVisLimit(v => Math.max(v, displayed.length + 1))
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  // CommentRow: chỉ chứa avatar + bubble (flex row)
  function CommentRow({ c, isReply }) {
    return (
      <div className={isReply ? styles.replyRow : styles.item}>
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
          {!isReply && user && (
            <button className={styles.replyBtn} onClick={() => handleReply(c)}>
              Trả lời
            </button>
          )}
        </div>
      </div>
    )
  }

  // CommentItem: wrapper bao gồm row + danh sách replies phía dưới
  function CommentItem({ c }) {
    const replies = replyMap[c.id] ?? []
    return (
      <div className={styles.commentBlock}>
        <CommentRow c={c} isReply={false} />
        {replies.length > 0 && (
          <div className={styles.replies}>
            {replies.map(r => (
              <CommentRow key={r.id} c={r} isReply />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.section}>

      {knownTotal > 0 && (
        <div className={styles.countRow}>
          💬 {allComments.length} / {knownTotal} bình luận
        </div>
      )}

      {displayed.length > 0 && (
        <div className={styles.list}>
          {displayed.map(c => <CommentItem key={c.id} c={c} />)}
        </div>
      )}

      {hasMore && (
        <button
          className={styles.loadMore}
          onClick={() => setVisLimit(v => v + PAGE)}
        >
          Xem thêm ({topLevel.length - visLimit} bình luận)
        </button>
      )}

      {user && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Avatar src={profile?.photoURL} name={profile?.displayName} uid={user.uid} size="small" />
          <div className={styles.inputWrap}>
            {replyTo && (
              <div className={styles.replyHint}>
                Đang trả lời <strong>{replyTo.authorName}</strong>
                <button type="button" className={styles.cancelReply} onClick={cancelReply}>✕</button>
              </div>
            )}
            <div className={styles.inputRow}>
              <input
                ref={inputRef}
                className={styles.input}
                placeholder={replyTo ? `Trả lời ${replyTo.authorName}...` : 'Viết bình luận...'}
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
          </div>
        </form>
      )}
    </div>
  )
}
