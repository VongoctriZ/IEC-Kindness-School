import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchUsers, searchPosts } from '../../services/search.service'
import { formatRelativeTime, getRoleLabel, getRoleClass } from '../../lib/utils'
import Avatar  from '../../components/Avatar/Avatar'
import Spinner from '../../components/Spinner/Spinner'
import styles  from './SearchPage.module.css'

const TABS = [
  { id: 'users', label: '👤 Học sinh' },
  { id: 'posts', label: '📝 Bài viết'  },
]

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [tab,      setTab]      = useState('users')
  const [query,    setQuery]    = useState(initialQ)
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const timerRef   = useRef(null)

  const doSearch = useCallback(async (term, currentTab) => {
    if (!term.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const data = currentTab === 'users'
        ? await searchUsers(term)
        : await searchPosts(term)
      setResults(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-search khi vào trang từ dropdown (có ?q= trong URL)
  useEffect(() => {
    if (initialQ.trim()) doSearch(initialQ, 'users')
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val, tab), 350)
  }

  function handleTabChange(newTab) {
    setTab(newTab)
    if (query.trim()) doSearch(query, newTab)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔍 Tìm kiếm</h1>
        <p className={styles.sub}>Tìm học sinh, giáo viên hoặc bài viết</p>

        <div className={styles.inputWrap}>
          <span className={styles.ico}>🔍</span>
          <input
            className={styles.input}
            placeholder={tab === 'users' ? 'Tên hoặc lớp học...' : 'Nội dung bài viết...'}
            value={query}
            onChange={handleInput}
            autoFocus
          />
          {query && (
            <button className={styles.clear} onClick={() => { setQuery(''); setResults([]); setSearched(false) }}>
              ✕
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.activeTab : ''}`}
              onClick={() => handleTabChange(t.id)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        {loading && <div className={styles.center}><Spinner size="md" /></div>}

        {!loading && searched && results.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIco}>🔍</div>
            <div>Không tìm thấy kết quả nào cho "<strong>{query}</strong>"</div>
          </div>
        )}

        {!loading && !searched && !query && (
          <div className={styles.hint}>
            <div className={styles.hintIco}>✨</div>
            <div>Nhập tên, lớp học, hoặc nội dung để bắt đầu tìm kiếm</div>
          </div>
        )}

        {!loading && tab === 'users' && results.length > 0 && (
          <div className={styles.userList}>
            <div className={styles.count}>{results.length} kết quả</div>
            {results.map(u => (
              <Link key={u.uid} to={`/profile/${u.uid}`} className={styles.userRow}>
                <Avatar src={u.photoURL} name={u.displayName} uid={u.uid} size="large" />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{u.displayName}</div>
                  <div className={styles.userMeta}>
                    {u.grade && <span>{u.grade}</span>}
                    <span className={`${styles.roleTag} ${getRoleClass(u.role, styles)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </div>
                </div>
                <div className={styles.userPts}>⭐ {u.totalPoints ?? 0}</div>
              </Link>
            ))}
          </div>
        )}

        {!loading && tab === 'posts' && results.length > 0 && (
          <div className={styles.postList}>
            <div className={styles.count}>{results.length} kết quả</div>
            {results.map(p => (
              <div key={p.id} className={styles.postRow}>
                <Avatar src={p.authorPhotoURL} name={p.authorName} uid={p.authorId}
                  size="medium" to={`/profile/${p.authorId}`} />
                <div className={styles.postInfo}>
                  <div className={styles.postMeta}>
                    <span className={styles.postAuthor}>{p.authorName}</span>
                    <span className={styles.postTime}>{formatRelativeTime(p.createdAt)}</span>
                  </div>
                  <p className={styles.postContent}>{p.content}</p>
                  <div className={styles.postStats}>
                    <span>❤️ {p.likeCount}</span>
                    <span>💬 {p.commentCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
