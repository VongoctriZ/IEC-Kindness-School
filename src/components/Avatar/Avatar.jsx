import { Link } from 'react-router-dom'
import { getInitials, getAvatarColor } from '../../lib/utils'
import styles from './Avatar.module.css'

export default function Avatar({
  src,
  name      = '',
  subtext,
  size      = 'medium',
  online,
  uid       = '',
  className = '',
  showInfo  = false,
  to        = '',   // nếu có → wrap trong Link
}) {
  const initials = getInitials(name)
  const color    = getAvatarColor(uid || name)

  const inner = (
    <div className={`${styles.wrap} ${className} ${to ? styles.clickable : ''}`}>
      {/* avOuter = position:relative wrapper so dot isn't clipped by av's overflow:hidden */}
      <div className={`${styles.avOuter} ${styles[size]}`}>
        <div
          className={`${styles.av} ${styles[size]}`}
          style={{ background: color.bg, color: color.color, borderColor: color.border }}
        >
          {src
            ? <img src={src} alt={name} className={styles.img} />
            : initials
          }
        </div>
        {online !== undefined && (
          <span className={`${styles.dot} ${online ? styles.online : styles.offline}`} />
        )}
      </div>

      {showInfo && (name || subtext) && (
        <div className={styles.info}>
          {name    && <div className={styles.name}>{name}</div>}
          {subtext && <div className={styles.sub}>{subtext}</div>}
        </div>
      )}
    </div>
  )

  if (to) return <Link to={to} className={styles.avatarLink}>{inner}</Link>
  return inner
}
