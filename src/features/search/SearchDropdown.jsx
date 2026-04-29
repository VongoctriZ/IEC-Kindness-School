import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchUsers, searchPosts } from '../../services/search.service'
import { formatRelativeTime } from '../../lib/utils'
import Avatar  from '../../components/Avatar/Avatar'
import Spinner from '../../components/Spinner/Spinner'
import styles  from './SearchDropdown.module.css'

const MAX_EACH = 4

export default function SearchDropdown({ isOpen, onClose }) {
  const [query,   setQuery]   = useState('')
  const [users,   setUsers]   = useState([])
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const inputRef  = useRef(null)
  const wrapRef   = useRef(null)
  const timerRef  = useRef(null)
  const navigate  = useNavigate()

  // Focus input khi mở
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setUsers([])
      setPosts([])
      setSearched(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Đóng khi click ngoài
  useEffect(() => {
    if (!isOpen) return
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return
    function handler(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const doSearch = useCallback(async (term) => {
    if (!term.trim()) { setUsers([]); setPosts([]); setSearched(false); return }
    setLoading(true)
    try {
      const [u, p] = await Promise.all([searchUsers(term), searchPosts(term)])
      setUsers(u.slice(0, MAX_EACH))
      setPosts(p.slice(0, MAX_EACH))
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  function handleViewAll() {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) handleViewAll()
  }

  const total = users.length + posts.length

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.panel} ref={wrapRef}>

        {/* Input */}
        <div className={styles.inputRow}>
          <span className={styles.inputIco}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Tìm học sinh, giáo viên, bài viết..."
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {loading && <Spinner size="sm" />}
          {!loading && query && (
            <button className={styles.clear} onClick={() => { setQuery(''); setUsers([]); setPosts([]); setSearched(false); inputRef.current?.focus() }}>✕</button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>Đóng</button>
        </div>

        {/* Kết quả */}
        <div className={styles.results}>

          {/* Trạng thái chờ nhập */}
          {!query && (
            <div className={styles.hint}>Nhập tên, lớp học hoặc nội dung bài viết</div>
          )}

          {/* Không có kết quả */}
          {searched && total === 0 && !loading && (
            <div className={styles.empty}>Không tìm thấy kết quả nào cho "<strong>{query}</strong>"</div>
          )}

          {/* Users */}
          {users.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>👤 Học sinh & Giáo viên</div>
              {users.map(u => (
                <button
                  key={u.uid}
                  className={styles.userRow}
                  onClick={() => { navigate(`/profile/${u.uid}`); onClose() }}
                >
                  <Avatar src={u.photoURL} name={u.displayName} uid={u.uid} size="medium" />
                  <div className={styles.rowInfo}>
                    <div className={styles.rowName}>{u.displayName}</div>
                    <div className={styles.rowMeta}>
                      {u.grade && <span>{u.grade}</span>}
                      <span className={`${styles.roleTag} ${u.role === 'teacher' ? styles.teacher : styles.student}`}>
                        {u.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowPts}>⭐ {u.totalPoints ?? 0}</div>
                </button>
              ))}
            </div>
          )}

          {/* Posts */}
          {posts.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>📝 Bài viết</div>
              {posts.map(p => (
                <button
                  key={p.id}
                  className={styles.postRow}
                  onClick={handleViewAll}
                >
                  <Avatar src={p.authorPhotoURL} name={p.authorName} uid={p.authorId} size="small" />
                  <div className={styles.rowInfo}>
                    <div className={styles.postAuthor}>
                      {p.authorName}
                      <span className={styles.postTime}> · {formatRelativeTime(p.createdAt)}</span>
                    </div>
                    <div className={styles.postContent}>{p.content}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Xem tất cả */}
          {searched && total > 0 && (
            <button className={styles.viewAll} onClick={handleViewAll}>
              Xem tất cả kết quả cho "<strong>{query}</strong>" →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
