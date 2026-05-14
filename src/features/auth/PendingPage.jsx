import { useAuthController } from '../../mvc/controllers/useAuthController'
import Button from '../../components/Button/Button'
import styles from './PendingPage.module.css'

export default function PendingPage() {
  const { logout } = useAuthController()

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.icon}>⏳</div>
        <h1 className={styles.title}>Đang chờ duyệt</h1>
        <p className={styles.desc}>
          Tài khoản giáo viên của bạn đã được tạo thành công.
          Quản trị viên sẽ xem xét và kích hoạt trong thời gian sớm nhất.
        </p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepDot} data-done="true">✓</span>
            <span>Tạo tài khoản thành công</span>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <span className={styles.stepDot} data-pending="true">⏳</span>
            <span>Quản trị viên duyệt</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${styles.stepDisabled}`}>
            <span className={styles.stepDot}>🔓</span>
            <span>Kích hoạt tài khoản</span>
          </div>
        </div>

        <p className={styles.hint}>
          Khi được duyệt, trang sẽ tự động chuyển về ứng dụng — không cần đăng nhập lại.
        </p>

        <Button variant="secondary" onClick={logout}>Đăng xuất</Button>
      </div>
    </div>
  )
}
