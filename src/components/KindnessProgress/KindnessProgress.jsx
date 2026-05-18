import { KINDNESS_TITLES, ANCIENT_TREE } from '../../lib/utils'
import { ANCIENT_TREE_COUNT } from '../../lib/constants'
import styles from './KindnessProgress.module.css'

function getLevelInfo(cyclePoints) {
  let idx = 0
  for (let i = KINDNESS_TITLES.length - 1; i >= 0; i--) {
    if (cyclePoints >= KINDNESS_TITLES[i].min) { idx = i; break }
  }
  const current   = KINDNESS_TITLES[idx]
  const isMax     = idx === KINDNESS_TITLES.length - 1
  const next      = isMax ? null : KINDNESS_TITLES[idx + 1]
  const pct       = isMax
    ? 100
    : Math.min(100, Math.round(((cyclePoints - current.min) / (next.min - current.min)) * 100))
  const remaining = isMax ? 0 : next.min - cyclePoints
  return { current, next, isMax, pct, remaining, idx }
}

export default function KindnessProgress({ points = 0, cyclePoints, matureTreeCount = 0, compact = false }) {
  // Dùng cyclePoints nếu có, fallback về points để tương thích ngược
  const displayPoints = cyclePoints ?? points
  const { current, next, isMax, pct, remaining, idx } = getLevelInfo(displayPoints)
  const isAncient = matureTreeCount >= ANCIENT_TREE_COUNT

  if (compact) {
    return (
      <div className={styles.compact}>
        <div className={styles.compactHeader}>
          <span className={styles.compactLevel}>
            {isAncient ? `${ANCIENT_TREE.icon} ${ANCIENT_TREE.title}` : `${current.icon} ${current.title}`}
          </span>
          <span className={styles.compactPts}>⭐ {points}</span>
        </div>
        <div className={styles.treeCounter}>🌲 × {matureTreeCount} cây đã trồng</div>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.hint}>
          {isMax
            ? '🎉 Sắp thu hoạch cây trưởng thành!'
            : `Còn ${remaining} điểm đến ${next.icon} ${next.title}`}
        </div>
        {matureTreeCount > 0 && (
          <div className={styles.encouragement}>
            Bạn đã trồng được {matureTreeCount} cây trưởng thành, hãy tiếp tục cố gắng! 💪
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.currentLevel}>
          <span className={styles.ico}>{current.icon}</span>
          <div>
            <div className={styles.levelName}>
              {current.title}
              {isAncient && <span className={styles.ancientBadge}>{ANCIENT_TREE.icon} {ANCIENT_TREE.title}</span>}
            </div>
            <div className={styles.levelSub}>Cấp {idx + 1} / {KINDNESS_TITLES.length}</div>
          </div>
        </div>
        {!isMax && (
          <div className={styles.nextLevel}>
            <div className={styles.nextName}>{next.title}</div>
            <span className={styles.nextIco}>{next.icon}</span>
          </div>
        )}
      </div>

      <div className={styles.treeCounter}>🌲 × {matureTreeCount} cây trưởng thành đã vun trồng</div>

      <div className={styles.barWrap}>
        <div className={styles.barTrack}>
          <div className={styles.fillFull} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.pct}>{pct}%</span>
      </div>

      <div className={styles.sub}>
        {isMax
          ? '🎉 Sắp thu hoạch cây trưởng thành!'
          : `Còn ${remaining} điểm để lên ${next.icon} ${next.title}`}
      </div>
      {matureTreeCount > 0 && (
        <div className={styles.encouragement}>
          Bạn đã trồng được {matureTreeCount} cây trưởng thành, hãy tiếp tục cố gắng! 💪
        </div>
      )}

      <div className={styles.allLevels}>
        {KINDNESS_TITLES.map((t, i) => (
          <div key={t.title} className={`${styles.dot} ${i <= idx ? styles.dotDone : ''}`} title={t.title}>
            {i <= idx ? t.icon : '·'}
          </div>
        ))}
      </div>
    </div>
  )
}
