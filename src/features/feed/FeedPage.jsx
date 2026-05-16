import { useRef } from 'react'
import { getRoleLabel } from '../../lib/utils'
import { Link }   from 'react-router-dom'
import { useFeedController }  from '../../mvc/controllers/useFeedController'
import { useLeaderboard }     from '../../mvc/controllers/usePointsController'
import useAuthStore   from '../../store/useAuthStore'
import PostCard          from '../../components/PostCard/PostCard'
import Avatar            from '../../components/Avatar/Avatar'
import Spinner           from '../../components/Spinner/Spinner'
import KindnessProgress  from '../../components/KindnessProgress/KindnessProgress'
import styles from './FeedPage.module.css'

const POINTS_RULES = [
  { icon: '📝', label: 'Đăng bài viết',   pts: '+10' },
  { icon: '💬', label: 'Bình luận',        pts: '+5'  },
  { icon: '❤️', label: 'Nhận like',         pts: '+2'  },
  { icon: '🎉', label: 'Đăng ký lần đầu', pts: '+20' },
]

export default function FeedPage() {
  const { posts, likedPosts, loading, handleLike, handleDelete } = useFeedController()
  const { users: topUsers } = useLeaderboard(5)
  const { user, profile }   = useAuthStore()

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroIn}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>✨ Mạng xã hội học đường tích cực</div>
            <h1 className={styles.heroTitle}>
              Chia sẻ điều tốt,<br />
              <span>lan tỏa yêu thương</span>
            </h1>
            <p className={styles.heroDesc}>
              Mỗi hành động tốt đều được ghi nhận và tích điểm. Cùng nhau xây dựng cộng đồng học đường tích cực.
            </p>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><div className={styles.hsIco}>👩‍🎓</div><div className={styles.hsNum}>1,248</div><div className={styles.hsLbl}>Học sinh tham gia</div></div>
            <div className={styles.heroStat}><div className={styles.hsIco}>📝</div><div className={styles.hsNum}>{posts.length}+</div><div className={styles.hsLbl}>Bài viết tốt đẹp</div></div>
            <div className={styles.heroStat}><div className={styles.hsIco}>⭐</div><div className={styles.hsNum}>42,810</div><div className={styles.hsLbl}>Kindness Points</div></div>
            <div className={styles.heroStat}><div className={styles.hsIco}>❤️</div><div className={styles.hsNum}>18,940</div><div className={styles.hsLbl}>Lượt yêu thích</div></div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className={styles.main}>

        {/* FEED COLUMN */}
        <div className={styles.feed}>
          {loading
            ? <div className={styles.center}><Spinner size="lg" /></div>
            : posts.length === 0
              ? <div className={styles.empty}>Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ! 🌱</div>
              : posts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={likedPosts.has(post.id)}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    currentUid={user?.uid}
                    currentUserRole={profile?.role}
                    delay={i < 3 ? `d${i + 1}` : ''}
                  />
                ))
          }
        </div>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>

          {/* User card */}
          {profile && (
            <div className={styles.userCard}>
              <div className={styles.ucBanner} />
              <Link to="/profile" className={styles.ucAvatar}>
                <Avatar src={profile.photoURL} name={profile.displayName} uid={user?.uid} size="xl" online />
              </Link>
              <div className={styles.ucName}>{profile.displayName}</div>
              <div className={styles.ucSub}>{profile.grade} · {getRoleLabel(profile.role)}</div>
              <div className={styles.ucStats}>
                <div className={styles.ucStat}><div className={styles.ucN}>28</div><div className={styles.ucL}>Bài viết</div></div>
                <div className={styles.ucStat}><div className={styles.ucN}>112</div><div className={styles.ucL}>Likes nhận</div></div>
              </div>
              <div className={styles.ucProgressWrap}>
                <KindnessProgress points={profile.totalPoints ?? 0} compact />
              </div>
            </div>
          )}

          {/* Mini leaderboard */}
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>
              🏆 Bảng xếp hạng
              <Link to="/leaderboard" className={styles.sideTitleLink}>Xem tất cả →</Link>
            </div>
            {topUsers.map((u, i) => (
              <Link key={u.uid} to={`/profile/${u.uid}`} className={styles.lbRow}>
                <span className={`${styles.lbRank} ${styles[`r${i + 1}`] ?? styles.rx}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <Avatar src={u.photoURL} name={u.displayName} uid={u.uid} size="small" />
                <div className={styles.lbInfo}>
                  <div className={styles.lbName}>{u.displayName}</div>
                  <div className={styles.lbSub}>{u.grade}</div>
                </div>
                <div className={styles.lbPts}>⭐ {u.totalPoints}</div>
              </Link>
            ))}
          </div>

          {/* Points rules */}
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>✨ Cách kiếm điểm</div>
            {POINTS_RULES.map(r => (
              <div key={r.label} className={styles.prRow}>
                <span>{r.icon} {r.label}</span>
                <span className={styles.prBadge}>{r.pts}</span>
              </div>
            ))}
          </div>

        </aside>
      </div>
    </div>
  )
}
