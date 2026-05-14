import { useRef, useState } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import Avatar from '../Avatar/Avatar'
import CommentSection from '../CommentSection/CommentSection'
import { formatRelativeTime, getRoleLabel, getRoleClass } from '../../lib/utils'
import styles from './PostCard.module.css'

export default function PostCard({ post, isLiked, onLike, onDelete, currentUid, currentUserRole, delay = '' }) {
  const ref = useRef(null)
  const [showComments, setShowComments] = useState(false)
  useScrollReveal(ref)

  const isAuthor   = currentUid === post.authorId
  const canDelete  = isAuthor || currentUserRole === 'teacher' || currentUserRole === 'admin'
  // Use live role when author is the current user (avoids stale snapshot in post doc)
  const displayRole = (isAuthor && currentUserRole) ? currentUserRole : post.authorRole

  return (
    <article ref={ref} className={`${styles.card} reveal ${delay}`}>
      {/* Header */}
      <div className={styles.header}>
        <Avatar
          src={post.authorPhotoURL}
          name={post.authorName}
          subtext={`${post.authorGrade} · ${formatRelativeTime(post.createdAt)}`}
          uid={post.authorId}
          size="large"
          online
          showInfo
          to={`/profile/${post.authorId}`}
        />
        <div className={styles.badges}>
          <span className={`${styles.badge} ${getRoleClass(displayRole, styles)}`}>
            {getRoleLabel(displayRole)}
          </span>
          <span className={styles.points}>+10 ✨</span>
        </div>
        {canDelete && (
          <button className={styles.more} onClick={() => onDelete?.(post.id)} title="Xoá bài">
            🗑
          </button>
        )}
      </div>

      {/* Content */}
      <p className={styles.body}>{post.content}</p>

      {/* Media */}
      {post.mediaUrl && (
        <div className={styles.media}>
          {post.mediaType === 'video'
            ? <video src={post.mediaUrl} controls className={styles.video} />
            : <img src={post.mediaUrl} alt="" className={styles.image} />
          }
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <button
          className={`${styles.action} ${isLiked ? styles.liked : ''}`}
          onClick={() => onLike?.(post.id)}
        >
          ❤️ {post.likeCount}
        </button>
        <button
          className={`${styles.action} ${showComments ? styles.commentActive : ''}`}
          onClick={() => setShowComments(v => !v)}
        >
          💬 {post.commentCount}
        </button>
        <button className={styles.action}>↗️ Chia sẻ</button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection postId={post.id} totalCount={post.commentCount} />}
    </article>
  )
}
