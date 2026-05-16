import { useState, useEffect } from 'react'
import { useParams }  from 'react-router-dom'
import { subscribeToUserPosts } from '../../services/post.service'
import { getUserById, getUserRank } from '../../services/user.service'
import useAuthStore from '../../store/useAuthStore'
import { getKindnessTitle, getRoleLabel, getRoleClass } from '../../lib/utils'
import Avatar             from '../../components/Avatar/Avatar'
import PostCard           from '../../components/PostCard/PostCard'
import Spinner            from '../../components/Spinner/Spinner'
import EditProfileModal   from './EditProfileModal'
import KindnessProgress   from '../../components/KindnessProgress/KindnessProgress'
import styles from './ProfilePage.module.css'

const TABS = [
  { id: 'posts',   label: '📝 Bài viết'      },
  { id: 'history', label: '⭐ Lịch sử điểm'  },
  { id: 'badges',  label: '🏅 Huy hiệu'      },
]

const BADGES = [
  { icon: '🌱', title: 'Người mới',   desc: 'Đăng bài đầu tiên',   unlocked: true  },
  { icon: '📝', title: 'Cây bút',     desc: '10 bài viết',          unlocked: true  },
  { icon: '❤️', title: 'Yêu thương',  desc: '100 lượt like',         unlocked: true  },
  { icon: '⭐', title: '100 điểm',    desc: 'Đạt 100 KP',           unlocked: true  },
  { icon: '🔥', title: 'Streak 7',    desc: '7 ngày liên tiếp',     unlocked: true  },
  { icon: '🤝', title: 'Đồng đội',   desc: '50 bình luận',         unlocked: true  },
  { icon: '🥇', title: 'Top 5',       desc: 'Vào top 5',            unlocked: false },
  { icon: '💎', title: '500 điểm',   desc: 'Đạt 500 KP',           unlocked: false },
  { icon: '🌟', title: 'Ngôi sao',   desc: '50 bài viết',          unlocked: false },
]

export default function ProfilePage() {
  const { uid: paramUid } = useParams()
  const { user, profile: myProfile } = useAuthStore()
  const targetUid = paramUid ?? user?.uid

  const [profile,     setProfile]     = useState(null)
  const [posts,       setPosts]       = useState([])
  const [rank,        setRank]        = useState(null)
  const [tab,         setTab]         = useState('posts')
  const [loading,     setLoading]     = useState(true)
  const [editOpen,    setEditOpen]    = useState(false)

  const isOwn = targetUid === user?.uid

  useEffect(() => {
    if (isOwn && myProfile) {
      setProfile(myProfile)
      setLoading(false)
    }
  }, [myProfile, isOwn])

  useEffect(() => {
    if (!targetUid) return
    if (!isOwn) {
      setLoading(true)
      getUserById(targetUid)
        .then(p => { setProfile(p); setLoading(false) })
        .catch(() => setLoading(false))
    }
    getUserRank(targetUid).then(setRank).catch(() => {})
    const unsub = subscribeToUserPosts(targetUid, setPosts, () => setPosts([]))
    return unsub
  }, [targetUid, isOwn])

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>
  if (!profile) return <div className={styles.center}>Không tìm thấy hồ sơ.</div>

  const kindness    = getKindnessTitle(profile.totalPoints ?? 0)
  const nextRankPts = rank > 1 ? (profile.totalPoints + 30) : null

  return (
    <div className={styles.page}>
      {/* Cover */}
      <div className={styles.cover}
        style={profile.coverURL ? { backgroundImage: `url(${profile.coverURL})` } : undefined}>
        {isOwn && (
          <button className={styles.coverEdit} onClick={() => setEditOpen(true)}>
            📷 Đổi ảnh bìa
          </button>
        )}
      </div>

      {/* Profile header */}
      <div className={styles.profileHd}>
        <div className={styles.hdRow}>
          <div className={styles.hdLeft}>
            <div className={styles.avWrap}>
              <Avatar src={profile.photoURL} name={profile.displayName} uid={targetUid}
                size="xxl" online={isOwn} />
              {isOwn && <button className={styles.avEdit} onClick={() => setEditOpen(true)}>✏️</button>}
            </div>
            <div className={styles.hdInfo}>
              <h1 className={styles.name}>{profile.displayName}</h1>
              <div className={styles.sub}>
                <span>{profile.grade}</span>
                <span className={`${styles.badge} ${getRoleClass(profile.role, styles)}`}>
                  {getRoleLabel(profile.role)}
                </span>
                <span className={styles.joinDate}>Tham gia 2025</span>
              </div>
            </div>
          </div>
          {isOwn && (
            <div className={styles.hdActions}>
              <button className={styles.btnEdit} onClick={() => setEditOpen(true)}>✏️ Chỉnh sửa hồ sơ</button>
              <button className={styles.btnShare}>📤 Chia sẻ</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.stat} ${styles.statHighlight}`}>
          <div className={styles.statIco}>⭐</div>
          <div className={styles.statNum}>{profile.totalPoints ?? 0}</div>
          <div className={styles.statLbl}>Kindness Points</div>
          <div className={styles.kindnessTag}>{kindness.icon} {kindness.title}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIco}>🏆</div>
          <div className={styles.statNum} style={{ color: 'var(--color-primary)' }}>#{rank ?? '—'}</div>
          <div className={styles.statLbl}>Xếp hạng trường</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIco}>📝</div>
          <div className={styles.statNum}>{posts.length}</div>
          <div className={styles.statLbl}>Bài viết</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIco}>❤️</div>
          <div className={styles.statNum}>{posts.reduce((s, p) => s + p.likeCount, 0)}</div>
          <div className={styles.statLbl}>Lượt yêu thích</div>
        </div>
      </div>

      {/* Kindness progress bar */}
      <div className={styles.progressWrap}>
        <KindnessProgress points={profile.totalPoints ?? 0} />
      </div>

      {/* Tabs */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.activeTab : ''}`}
              onClick={() => setTab(t.id)}
            >{t.label} {t.id === 'posts' ? `(${posts.length})` : ''}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>

        {/* Posts tab */}
        {tab === 'posts' && (
          <div className={styles.postsFeed}>
            {posts.length === 0
              ? <div className={styles.empty}>Chưa có bài viết nào.</div>
              : posts.map(p => (
                  <PostCard key={p.id} post={p} isLiked={false} currentUid={user?.uid} currentUserRole={myProfile?.role} />
                ))
            }
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className={styles.historyCard}>
            <div className={styles.historyTitle}>⭐ Lịch sử tích điểm</div>
            {[
              { ico: '📝', bg: 'var(--color-accent-light)', label: 'Đăng bài viết',   time: 'Hôm nay 08:23', pts: '+10' },
              { ico: '💬', bg: '#DBEAFE',                   label: 'Bình luận',         time: 'Hôm qua 16:45', pts: '+5'  },
              { ico: '❤️', bg: 'var(--color-yellow-light)', label: 'Nhận 5 lượt like', time: 'Hôm qua 09:00', pts: '+10' },
            ].map((h, i) => (
              <div key={i} className={styles.histItem}>
                <div className={styles.histIco} style={{ background: h.bg }}>{h.ico}</div>
                <div className={styles.histInfo}>
                  <div className={styles.histLabel}>{h.label}</div>
                  <div className={styles.histTime}>{h.time}</div>
                </div>
                <div className={styles.histPts}>{h.pts}</div>
              </div>
            ))}
          </div>
        )}

        {/* Badges tab */}
        {tab === 'badges' && (
          <div className={styles.badgesCard}>
            <div className={styles.badgesTitle}>🏅 Huy hiệu ({BADGES.filter(b => b.unlocked).length}/{BADGES.length})</div>
            <div className={styles.badgesGrid}>
              {BADGES.map(b => (
                <div key={b.title} className={`${styles.badgeItem} ${b.unlocked ? '' : styles.locked}`}>
                  <div className={styles.badgeIco}>{b.icon}</div>
                  <div className={styles.badgeName}>{b.title}</div>
                  <div className={styles.badgeDesc}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Rank progress */}
          {rank && rank > 1 && (
            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>📈 Tiến độ xếp hạng</div>
              <div className={styles.rankInfo}>
                Bạn đang ở <strong>#{rank}</strong>. Cần thêm <strong>30 điểm</strong> để lên hạng {rank - 1}.
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '90%' }} />
              </div>
              <div className={styles.progressLabel}>{profile.totalPoints} / {(profile.totalPoints ?? 0) + 30} điểm</div>
            </div>
          )}

          {/* Badge highlights */}
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>🏅 Huy hiệu nổi bật</div>
            {BADGES.filter(b => b.unlocked).slice(0, 3).map(b => (
              <div key={b.title} className={styles.badgeRow}>
                <span className={styles.badgeRowIco}>{b.icon}</span>
                <div>
                  <div className={styles.badgeRowTitle}>{b.title}</div>
                  <div className={styles.badgeRowDesc}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {isOwn && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}
