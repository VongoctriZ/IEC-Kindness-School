import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getPendingTeachers, approveTeacher, rejectTeacher } from '../../services/user.service'
import { useAuthController } from '../../mvc/controllers/useAuthController'
import useAuthStore from '../../store/useAuthStore'
import Button from '../../components/Button/Button'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const [teachers,   setTeachers]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadError,  setLoadError]  = useState('')
  const [processing, setProcessing] = useState(null)
  const { logout } = useAuthController()
  const profile = useAuthStore(s => s.profile)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getPendingTeachers()
      setTeachers(data)
    } catch (err) {
      console.error('[AdminPage] getPendingTeachers:', err)
      setLoadError('Không thể tải danh sách. Kiểm tra lại kết nối hoặc quyền Firestore.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleApprove(uid) {
    setProcessing(uid)
    await approveTeacher(uid)
    setTeachers(prev => prev.filter(t => t.uid !== uid))
    setProcessing(null)
  }

  async function handleReject(uid, name) {
    if (!window.confirm(`Từ chối tài khoản của "${name}"?\nTài khoản sẽ bị vô hiệu hoá.`)) return
    setProcessing(uid)
    await rejectTeacher(uid)
    setTeachers(prev => prev.filter(t => t.uid !== uid))
    setProcessing(null)
  }

  function formatDate(ts) {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className={styles.root}>
      {/* Top bar — logo + back link */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIco}>🌱</span>
          <span className={styles.logoName}>Kindness School</span>
        </Link>
        <Link to="/" className={styles.backBtn}>← Về trang chủ</Link>
      </div>

      <div className={styles.content}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🛡️ Trang Quản trị</h1>
          <p className={styles.sub}>Xin chào, {profile?.displayName ?? 'Admin'}</p>
        </div>
        <Button variant="secondary" size="small" onClick={logout}>Đăng xuất</Button>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Giáo viên chờ duyệt</h2>
          {!loading && (
            <span className={`${styles.badge} ${teachers.length > 0 ? styles.badgeActive : ''}`}>
              {teachers.length}
            </span>
          )}
        </div>

        {loading ? (
          <p className={styles.empty}>Đang tải...</p>
        ) : loadError ? (
          <p className={styles.errorMsg}>{loadError}</p>
        ) : teachers.length === 0 ? (
          <p className={styles.empty}>✅ Không có yêu cầu nào đang chờ duyệt.</p>
        ) : (
          <div className={styles.list}>
            {teachers.map(t => (
              <div key={t.uid} className={styles.row}>
                <div className={styles.avatar}>
                  {t.photoURL
                    ? <img src={t.photoURL} alt={t.displayName} />
                    : <span>{t.displayName?.[0]?.toUpperCase() ?? '?'}</span>
                  }
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{t.displayName}</div>
                  <div className={styles.email}>{t.email}</div>
                  <div className={styles.date}>Đăng ký: {formatDate(t.createdAt)}</div>
                </div>
                <div className={styles.actions}>
                  <Button
                    size="small"
                    onClick={() => handleApprove(t.uid)}
                    disabled={processing === t.uid}
                  >
                    ✅ Duyệt
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleReject(t.uid, t.displayName)}
                    disabled={processing === t.uid}
                  >
                    ❌ Từ chối
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          🔄 Làm mới
        </button>
      </div>

      <p className={styles.note}>
        Để tạo tài khoản admin: vào Firebase Console → Firestore → collection <code>users</code> → tìm uid của người dùng → đổi field <code>role</code> thành <code>admin</code>.
      </p>
      </div>
    </div>
  )
}
