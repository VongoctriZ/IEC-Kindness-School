import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToNotifications, markAllRead } from '../../services/notification.service'
import useAuthStore from '../../store/useAuthStore'
import { formatRelativeTime } from '../../lib/utils'
import styles from './NotifBell.module.css'

export default function NotifBell() {
  const { user } = useAuthStore()
  const [notifs, setNotifs]   = useState([])
  const [open,   setOpen]     = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!user) return
    return subscribeToNotifications(user.uid, setNotifs)
  }, [user])

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifs.filter(n => !n.read).length

  function handleOpen() {
    setOpen(v => !v)
    if (!open && unread > 0) markAllRead(user.uid)
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bell} onClick={handleOpen} aria-label="Thông báo">
        🔔
        {unread > 0 && (
          <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.ddHd}>
            <span className={styles.ddTitle}>Thông báo</span>
            {notifs.length > 0 && (
              <button className={styles.clearBtn} onClick={() => markAllRead(user.uid)}>
                Đánh dấu đọc tất
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className={styles.empty}>Chưa có thông báo nào 🔕</div>
          ) : (
            <div className={styles.list}>
              {notifs.map(n => (
                <Link
                  key={n.id}
                  to={`/`}
                  className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <div className={styles.itemAv}>
                    {n.fromPhotoURL
                      ? <img src={n.fromPhotoURL} alt={n.fromName} className={styles.avImg} />
                      : <div className={styles.avFallback}>{n.fromName?.[0] ?? '?'}</div>
                    }
                    <span className={styles.typeIco}>{n.type === 'like' ? '❤️' : '💬'}</span>
                  </div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemText}>
                      <strong>{n.fromName}</strong>
                      {n.type === 'like' ? ' đã thích bài viết của bạn' : ' đã bình luận về bài của bạn'}
                    </p>
                    {n.postSnippet && (
                      <p className={styles.snippet}>"{n.postSnippet}"</p>
                    )}
                    <p className={styles.time}>{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className={styles.dot} />}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
