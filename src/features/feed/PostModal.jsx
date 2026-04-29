import { useState, useRef } from 'react'
import { useCreatePostController } from '../../mvc/controllers/useCreatePostController'
import useAuthStore from '../../store/useAuthStore'
import Avatar         from '../../components/Avatar/Avatar'
import Button         from '../../components/Button/Button'
import Spinner        from '../../components/Spinner/Spinner'
import styles from './PostModal.module.css'

export default function PostModal({ onClose }) {
  const [content,    setContent]    = useState('')
  const [file,       setFile]       = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const fileRef = useRef(null)

  const { user, profile }     = useAuthStore()
  const { handleCreatePost }  = useCreatePostController()

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function submit() {
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await handleCreatePost(content, file)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>✏️ Đăng bài mới</h3>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.composer}>
            <Avatar src={profile?.photoURL} name={profile?.displayName} uid={user?.uid} size="large" online />
            <textarea
              className={styles.textarea}
              placeholder="Bạn đã làm gì tốt hôm nay? Chia sẻ nhé! 🌟"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              maxLength={500}
              autoFocus
            />
          </div>

          {preview && (
            <div className={styles.previewWrap}>
              {file?.type.startsWith('video')
                ? <video src={preview} className={styles.preview} controls />
                : <img   src={preview} className={styles.preview} alt="preview" />
              }
              <button className={styles.removePreview} onClick={() => { setFile(null); setPreview(null) }}>✕</button>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button className={styles.mediaBtn} onClick={() => fileRef.current?.click()}>
            📷 Ảnh / Video
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            style={{ display: 'none' }}
            onChange={pickFile}
          />
          <div className={styles.charCount}>{content.length}/500</div>
          <Button onClick={submit} disabled={!content.trim() || submitting} size="medium">
            {submitting ? <Spinner size="sm" /> : 'Đăng bài ✨'}
          </Button>
        </div>
      </div>
    </div>
  )
}
