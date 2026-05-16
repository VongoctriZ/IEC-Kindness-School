import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { createUserDocument } from '../../services/user.service'
import { ROLES } from '../../lib/constants'
import Button from '../../components/Button/Button'
import styles from './OnboardingModal.module.css'

export default function OnboardingModal() {
  const [role, setRole]       = useState(ROLES.STUDENT)
  const [grade, setGrade]     = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setNeedsOnboarding } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit() {
    if (!user) return
    setLoading(true)
    try {
      await createUserDocument(user, {
        displayName: user.displayName,
        grade: role === ROLES.STUDENT ? grade : '',
        role,
      })
      setNeedsOnboarding(false)
      if (role === ROLES.PENDING_TEACHER) navigate('/pending')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.icon}>🌱</div>
        <h2 className={styles.title}>Chào mừng đến Kindness School!</h2>
        <p className={styles.sub}>Cho chúng tôi biết bạn là ai để hoàn tất hồ sơ</p>

        <div className={styles.roleToggle}>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === ROLES.STUDENT ? styles.roleBtnActive : ''}`}
            onClick={() => setRole(ROLES.STUDENT)}
          >
            🎒 Học sinh
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === ROLES.PENDING_TEACHER ? styles.roleBtnActive : ''}`}
            onClick={() => setRole(ROLES.PENDING_TEACHER)}
          >
            👨‍🏫 Giáo viên
          </button>
        </div>

        {role === ROLES.STUDENT && (
          <input
            className={styles.gradeInput}
            placeholder="Lớp học (VD: 10A1, 11B2…)"
            value={grade}
            onChange={e => setGrade(e.target.value)}
          />
        )}

        {role === ROLES.PENDING_TEACHER && (
          <div className={styles.teacherNote}>
            ℹ️ Tài khoản giáo viên cần được quản trị viên duyệt trước khi kích hoạt.
          </div>
        )}

        <Button className={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Bắt đầu →'}
        </Button>
      </div>
    </div>
  )
}
