import { useState, useRef, useEffect } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { updateUserProfile } from '../../services/user.service'
import { uploadAvatar, uploadCover } from '../../services/storage.service'
import useAuthStore from '../../store/useAuthStore'
import Modal  from '../../components/Modal/Modal'
import Input  from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import Avatar from '../../components/Avatar/Avatar'
import styles from './EditProfileModal.module.css'

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, profile } = useAuthStore()

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [grade,       setGrade]       = useState(profile?.grade ?? '')
  const [avatarFile,  setAvatarFile]  = useState(null)
  const [coverFile,   setCoverFile]   = useState(null)
  const [avatarPrev,  setAvatarPrev]  = useState(null)
  const [coverPrev,   setCoverPrev]   = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const avatarInputRef = useRef(null)
  const coverInputRef  = useRef(null)

  // Reset form mỗi lần modal mở lại
  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile?.displayName ?? '')
      setGrade(profile?.grade ?? '')
      setAvatarFile(null)
      setCoverFile(null)
      setAvatarPrev(null)
      setCoverPrev(null)
      setError('')
    }
  }, [isOpen])

  function pickAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPrev(URL.createObjectURL(file))
  }

  function pickCover(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPrev(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!displayName.trim()) { setError('Tên không được để trống'); return }
    setSaving(true)
    setError('')
    try {
      const updates = {
        displayName: displayName.trim(),
        grade:       grade.trim(),
      }

      // Upload ảnh song song nếu có
      const [avatarUrl, coverUrl] = await Promise.all([
        avatarFile ? uploadAvatar(user.uid, avatarFile) : null,
        coverFile  ? uploadCover(user.uid, coverFile)  : null,
      ])

      if (avatarUrl) updates.photoURL = avatarUrl
      if (coverUrl)  updates.coverURL = coverUrl

      // Sync Firebase Auth profile (displayName + photoURL nếu đổi)
      const authUpdate = { displayName: displayName.trim() }
      if (avatarUrl) authUpdate.photoURL = avatarUrl
      await updateProfile(auth.currentUser, authUpdate)

      await updateUserProfile(user.uid, updates)
      onClose()
    } catch (err) {
      setError(err.message ?? 'Lỗi khi lưu. Thử lại sau.')
    } finally {
      setSaving(false)
    }
  }

  const currentAvatar = avatarPrev ?? profile?.photoURL
  const currentCover  = coverPrev  ?? profile?.coverURL

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ">
      <form onSubmit={handleSave}>

        {/* Cover picker */}
        <div className={styles.coverWrap}>
          <div className={styles.coverPreview}
            style={{ backgroundImage: currentCover ? `url(${currentCover})` : undefined }}>
            {!currentCover && <span className={styles.coverEmpty}>Ảnh bìa</span>}
            <button type="button" className={styles.coverEditBtn}
              onClick={() => coverInputRef.current?.click()}>
              📷 Đổi ảnh bìa
            </button>
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className={styles.hidden}
            onChange={pickCover} />
        </div>

        {/* Avatar picker */}
        <div className={styles.avRow}>
          <div className={styles.avWrap}>
            <Avatar src={currentAvatar} name={displayName || profile?.displayName}
              size="xxl" online={false} />
            <button type="button" className={styles.avEditBtn}
              onClick={() => avatarInputRef.current?.click()}
              title="Đổi ảnh đại diện">
              ✏️
            </button>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className={styles.hidden}
            onChange={pickAvatar} />
          <p className={styles.avHint}>Nhấn vào ✏️ để đổi ảnh đại diện</p>
        </div>

        {/* Fields */}
        <div className={styles.fields}>
          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={50}
          />
          <div style={{ marginTop: 14 }}>
            <Input
              label="Lớp học"
              placeholder="VD: 10A1, 11B2, 12A3..."
              value={grade}
              onChange={e => setGrade(e.target.value)}
              maxLength={20}
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Huỷ
          </button>
          <Button type="submit" disabled={saving || !displayName.trim()}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
