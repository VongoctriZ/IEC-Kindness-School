import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import Spinner from '../../components/Spinner/Spinner'
import styles from './AuthLayout.module.css'

export default function AuthLayout() {
  const { user, loading } = useAuthStore()

  if (loading) return (
    <div className={styles.center}><Spinner size="lg" /></div>
  )

  if (user) return <Navigate to="/" replace />

  return (
    <div className={styles.root}>
      {/* Left branding panel */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <a href="/" className={styles.brand}>🌱 IEC — Kindness School</a>
          <h1 className={styles.headline}>
            Chào mừng trở lại,<br />
            <span className={styles.highlight}>ngôi sao tử tế!</span>
          </h1>
          <p className={styles.desc}>
            Đăng nhập để tiếp tục chia sẻ những điều tốt đẹp và leo hạng trên bảng xếp hạng Kindness Points.
          </p>
          <div className={styles.features}>
            {[
              { icon: '📝', title: 'Chia sẻ việc tốt',        sub: 'Mỗi bài viết mang lại +10 điểm' },
              { icon: '🏆', title: 'Bảng xếp hạng real-time', sub: 'Xem vị trí của bạn trong trường' },
              { icon: '❤️', title: 'Cộng đồng tích cực',      sub: 'Kết nối và lan tỏa yêu thương'  },
            ].map(f => (
              <div key={f.title} className={styles.feature}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <strong className={styles.featureTitle}>{f.title}</strong>
                  <span className={styles.featureSub}>{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className={styles.leftFoot}>© 2026 IEC-KindnessSchool · Powered by Firebase</footer>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.card}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
