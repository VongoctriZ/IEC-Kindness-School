import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeaderboard } from '../../mvc/controllers/usePointsController'
import useAuthStore from '../../store/useAuthStore'
import { getKindnessTitle } from '../../lib/utils'
import Avatar   from '../../components/Avatar/Avatar'
import Spinner  from '../../components/Spinner/Spinner'
import styles from './LeaderboardPage.module.css'

const TIME_FILTERS  = ['Tháng này', 'Năm học', 'Tất cả']
const CLASS_FILTERS = ['Tất cả', 'Khối 10', 'Khối 11', 'Khối 12']

export default function LeaderboardPage() {
  const { users, loading }  = useLeaderboard(50)
  const { user, profile }   = useAuthStore()
  const [timeFilter,  setTimeFilter]  = useState('Tháng này')
  const [classFilter, setClassFilter] = useState('Tất cả')
  const [search,      setSearch]      = useState('')

  const myRank = users.findIndex(u => u.uid === user?.uid) + 1

  const filtered = users.filter(u => {
    const matchClass = classFilter === 'Tất cả' || u.grade?.startsWith(classFilter.replace('Khối ', ''))
    const matchSearch = !search || u.displayName?.toLowerCase().includes(search.toLowerCase())
    return matchClass && matchSearch
  })

  const top3 = filtered.slice(0, 3)
  const rest  = filtered.slice(3)
  const maxPts = filtered[0]?.totalPoints || 1

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>🏆 Bảng xếp hạng Kindness Points</div>
        <h1 className={styles.heroTitle}>Những tấm lòng<br />tử tế nhất</h1>
        <p className={styles.heroDesc}>Những ngôi sao đang dẫn đầu bảng xếp hạng tháng này. Bạn có trong danh sách không?</p>

        {profile && (
          <div className={styles.myRank}>
            <div>
              <div className={styles.myRankNum}>#{myRank || '—'}</div>
              <div className={styles.myRankLbl}>Hạng của bạn</div>
            </div>
            <div className={styles.divider} />
            <div>
              <div className={styles.myPts}>⭐ {profile.totalPoints ?? 0}</div>
              <div className={styles.myPtsLbl}>Kindness Points</div>
            </div>
          </div>
        )}
      </section>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterIn}>
          <span className={styles.filterLbl}>Thời gian:</span>
          <div className={styles.pills}>
            {TIME_FILTERS.map(f => (
              <button key={f}
                className={`${styles.pill} ${timeFilter === f ? styles.pillActive : ''}`}
                onClick={() => setTimeFilter(f)}
              >{f}</button>
            ))}
          </div>
          <div className={styles.sep} />
          <span className={styles.filterLbl}>Lớp:</span>
          <div className={styles.pills}>
            {CLASS_FILTERS.map(f => (
              <button key={f}
                className={`${styles.pill} ${classFilter === f ? styles.pillActive : ''}`}
                onClick={() => setClassFilter(f)}
              >{f}</button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <span className={styles.searchIco}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm học sinh..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading
        ? <div className={styles.center}><Spinner size="lg" /></div>
        : (
          <div className={styles.content}>

            {/* Podium top 3 */}
            {top3.length === 3 && (
              <div className={styles.podiumSection}>
                <div className={styles.podium}>
                  {podiumOrder.map((u, idx) => {
                    const rank = filtered.indexOf(u) + 1
                    const heights = [90, 120, 70]
                    const colors  = [
                      'linear-gradient(135deg,#9CA3AF,#D1D5DB)',
                      'linear-gradient(135deg,#F59E0B,#FBBF24)',
                      'linear-gradient(135deg,#F97316,#FB923C)',
                    ]
                    return (
                      <Link key={u.uid} to={`/profile/${u.uid}`} className={styles.podiumItem}>
                        <div className={styles.podiumBadge}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
                        <Avatar src={u.photoURL} name={u.displayName} uid={u.uid}
                          size={rank === 1 ? 'xxl' : 'xl'} />
                        <div className={styles.podiumName}>{u.displayName}</div>
                        <div className={styles.podiumClass}>{u.grade}</div>
                        <div className={styles.podiumPts}>⭐ {u.totalPoints}</div>
                        <div className={styles.podiumTitle}>{getKindnessTitle(u.totalPoints ?? 0).icon} {getKindnessTitle(u.totalPoints ?? 0).title}</div>
                        <div className={styles.podiumStand}
                          style={{ height: heights[idx], background: colors[idx] }}>
                          {rank}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Full table */}
            <div className={styles.tableSection}>
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <h3 className={styles.tableTitle}>🏆 Bảng xếp hạng đầy đủ · {timeFilter}</h3>
                  <span className={styles.tableCount}>{filtered.length} học sinh</span>
                </div>

                {filtered.map((u, i) => {
                  const isMe = u.uid === user?.uid
                  return (
                    <Link key={u.uid} to={`/profile/${u.uid}`}
                      className={`${styles.row} ${i < 3 ? styles.top3Row : ''} ${isMe ? styles.meRow : ''}`}>
                      <div className={`${styles.rankCol} ${i < 3 ? styles.rankEmoji : styles.rankNum}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </div>
                      <Avatar src={u.photoURL} name={u.displayName} uid={u.uid} size="medium" />
                      <div className={styles.info}>
                        <div className={styles.name}>
                          {u.displayName}
                          {isMe && <span className={styles.meTag}>● bạn</span>}
                        </div>
                        <div className={styles.sub}>
                          {u.grade}
                          <span className={styles.kindTag}>{getKindnessTitle(u.totalPoints ?? 0).icon} {getKindnessTitle(u.totalPoints ?? 0).title}</span>
                        </div>
                      </div>
                      <div className={styles.barWrap}>
                        <div className={styles.bar}>
                          <div className={styles.barFill} style={{ width: `${(u.totalPoints / maxPts) * 100}%` }} />
                        </div>
                      </div>
                      <div className={`${styles.pts} ${isMe ? styles.mePts : ''}`}>
                        ⭐ {u.totalPoints}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}
