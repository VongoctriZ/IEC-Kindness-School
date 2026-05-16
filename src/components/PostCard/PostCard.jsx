import { useRef, useState, useEffect } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { updatePost } from '../../services/post.service'
import { uploadPostMedia, validateFile } from '../../services/storage.service'
import Avatar from '../Avatar/Avatar'
import Modal from '../Modal/Modal'
import CommentSection from '../CommentSection/CommentSection'
import { formatRelativeTime, getRoleLabel, getRoleClass } from '../../lib/utils'
import styles from './PostCard.module.css'

export default function PostCard({ post, isLiked, onLike, onDelete, currentUid, currentUserRole, delay = '' }) {
  const cardRef  = useRef(null)
  const menuRef  = useRef(null)
  const fileRef  = useRef(null)
  const [showComments, setShowComments] = useState(false)
  const [showMenu,     setShowMenu]     = useState(false)
  const [editOpen,     setEditOpen]     = useState(false)
  const [editContent,  setEditContent]  = useState('')
  const [editMediaUrl, setEditMediaUrl] = useState(null)
  const [editMediaType,setEditMediaType]= useState(null)
  const [mediaFile,    setMediaFile]    = useState(null)
  const [uploadPct,    setUploadPct]    = useState(0)
  const [saving,       setSaving]       = useState(false)
  const [shareToast,   setShareToast]   = useState(false)
  useScrollReveal(cardRef)

  const isAuthor   = currentUid === post.authorId
  const canDelete  = isAuthor || currentUserRole === 'teacher' || currentUserRole === 'admin'
  const displayRole = (isAuthor && currentUserRole) ? currentUserRole : post.authorRole

  // Đóng menu khi click ngoài
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: post.authorName, text: post.content.slice(0, 100), url })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        const el = document.createElement('textarea')
        el.value = url
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    }
  }

  function openEdit() {
    setEditContent(post.content)
    setEditMediaUrl(post.mediaUrl ?? null)
    setEditMediaType(post.mediaType ?? null)
    setMediaFile(null)
    setUploadPct(0)
    setShowMenu(false)
    setEditOpen(true)
  }

  function handleMediaPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const type = validateFile(file)
      setMediaFile(file)
      setEditMediaUrl(URL.createObjectURL(file))
      setEditMediaType(type)
    } catch (err) {
      alert(err.message)
    }
    e.target.value = ''
  }

  function removeMedia() {
    setEditMediaUrl(null)
    setEditMediaType(null)
    setMediaFile(null)
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editContent.trim() || saving) return
    setSaving(true)
    try {
      let finalUrl  = editMediaUrl
      let finalType = editMediaType

      if (mediaFile) {
        setUploadPct(1)
        const result = await uploadPostMedia(currentUid, mediaFile, pct => setUploadPct(pct))
        finalUrl  = result.url
        finalType = result.mediaType
      }

      // Nếu media đã bị xoá (url null) hoặc thay mới → truyền tường minh
      const hadMedia   = !!post.mediaUrl
      const mediaChanged = finalUrl !== post.mediaUrl
      await updatePost(
        post.id, currentUid, editContent.trim(),
        (hadMedia || mediaChanged) ? finalUrl  : undefined,
        (hadMedia || mediaChanged) ? finalType : undefined,
      )
      setEditOpen(false)
      setMediaFile(null)
      setUploadPct(0)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <article ref={cardRef} className={`${styles.card} reveal ${delay}`}>
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
          <div className={styles.menuWrap} ref={menuRef}>
            <button className={styles.more} onClick={() => setShowMenu(v => !v)} title="Tuỳ chọn">
              ···
            </button>
            {showMenu && (
              <div className={styles.menuDrop}>
                {isAuthor && (
                  <button className={styles.menuItem} onClick={openEdit}>
                    ✏️ Chỉnh sửa
                  </button>
                )}
                <button
                  className={`${styles.menuItem} ${styles.danger}`}
                  onClick={() => { setShowMenu(false); onDelete?.(post.id) }}
                >
                  🗑 Xoá bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className={styles.body}>{post.content}</p>
      {post.editedAt && <span className={styles.edited}>đã chỉnh sửa</span>}

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
        <button className={styles.action} onClick={handleShare}>
          ↗️ Chia sẻ
        </button>
        {shareToast && <span className={styles.toast}>✅ Đã copy link!</span>}
      </div>

      {/* Comments */}
      {showComments && <CommentSection postId={post.id} totalCount={post.commentCount} />}

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setUploadPct(0) }} title="Chỉnh sửa bài viết">
        <form onSubmit={handleEdit} className={styles.editForm}>
          <textarea
            className={styles.editArea}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            maxLength={500}
            rows={4}
            autoFocus
          />
          <div className={styles.editMeta}>{editContent.length}/500</div>

          {/* Media section */}
          <div className={styles.editMedia}>
            {editMediaUrl ? (
              <>
                <div className={styles.editMediaPreview}>
                  {editMediaType === 'video'
                    ? <video src={editMediaUrl} className={styles.editMediaItem} controls />
                    : <img    src={editMediaUrl} className={styles.editMediaItem} alt="" />
                  }
                </div>
                <div className={styles.editMediaBtns}>
                  <label className={styles.editMediaBtn}>
                    🔄 Thay đổi
                    <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMediaPick} hidden />
                  </label>
                  <button type="button" className={`${styles.editMediaBtn} ${styles.editMediaRemove}`} onClick={removeMedia}>
                    🗑 Xoá
                  </button>
                </div>
              </>
            ) : (
              <label className={styles.editMediaAdd}>
                📎 Thêm ảnh / video
                <input type="file" accept="image/*,video/*" onChange={handleMediaPick} hidden />
              </label>
            )}

            {uploadPct > 0 && uploadPct < 100 && (
              <div className={styles.uploadBar}>
                <div className={styles.uploadFill} style={{ width: `${uploadPct}%` }} />
              </div>
            )}
          </div>

          <div className={styles.editActions}>
            <button type="button" className={styles.editCancel} onClick={() => { setEditOpen(false); setUploadPct(0) }}>
              Huỷ
            </button>
            <button
              type="submit"
              className={styles.editSave}
              disabled={saving || !editContent.trim()}
            >
              {saving ? (uploadPct > 0 && uploadPct < 100 ? `Đang tải ${uploadPct}%…` : 'Đang lưu…') : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>
    </article>
  )
}
