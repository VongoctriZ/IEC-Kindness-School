import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavItem        from '../NavItem/NavItem'
import Avatar         from '../Avatar/Avatar'
import NotifBell      from '../../features/notifications/NotifBell'
import SearchDropdown from '../../features/search/SearchDropdown'
import useAuthStore   from '../../store/useAuthStore'
import { signOutUser } from '../../services/auth.service'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { to: '/',            icon: '🏠', label: 'Trang chủ' },
  { to: '/leaderboard', icon: '🏆', label: 'Xếp hạng'  },
  { to: '/profile',     icon: '👤', label: 'Hồ sơ'     },
]

export default function Navbar({ onPostClick }) {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleLogout() {
    await signOutUser()
    navigate('/login')
  }

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>🌱 IEC — Kindness School</Link>

          <div className={styles.links}>
            {NAV_LINKS.map(n => <NavItem key={n.to} {...n} />)}
          </div>

          <button
            className={styles.searchBtn}
            onClick={() => setSearchOpen(true)}
            aria-label="Tìm kiếm"
          >
            🔍 <span className={styles.searchBtnLabel}>Tìm kiếm</span>
          </button>

          <button className={styles.postBtn} onClick={onPostClick}>✏️ Đăng bài</button>

          {user && (
            <div className={styles.userArea}>
              <NotifBell />
              <Link to="/profile" className={styles.userInfo}>
                <Avatar
                  src={profile?.photoURL}
                  name={profile?.displayName}
                  uid={user.uid}
                  size="large"
                  online
                />
                <div className={styles.userText}>
                  <div className={styles.userName}>{profile?.displayName}</div>
                  <div className={styles.userSub}>
                    {profile?.grade} · ⭐ {profile?.totalPoints ?? 0}
                  </div>
                </div>
              </Link>
              <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">↩</button>
            </div>
          )}

          <button className={styles.ham} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className={styles.drawer}>
          {NAV_LINKS.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={styles.drawerItem}
              onClick={() => setMenuOpen(false)}
            >
              {n.icon} {n.label}
            </Link>
          ))}
          <button className={styles.drawerItem} onClick={() => { setMenuOpen(false); setSearchOpen(true) }}>
            🔍 Tìm kiếm
          </button>
          <button className={styles.drawerPost} onClick={() => { setMenuOpen(false); onPostClick?.() }}>
            ✏️ Đăng bài
          </button>
          <button className={styles.drawerLogout} onClick={handleLogout}>↩ Đăng xuất</button>
        </div>
      )}

      <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
