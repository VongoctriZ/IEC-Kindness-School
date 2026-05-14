import { useState } from 'react'
import { useAuthController } from '../../mvc/controllers/useAuthController'
import { ROLES } from '../../lib/constants'
import Button from '../../components/Button/Button'
import Input  from '../../components/Input/Input'
import styles from './LoginPage.module.css'

const GOOGLE_ICON = (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.9 36 24 36c-5.2 0-9.6-3-11.3-7.4L6 33.8C9.3 39.6 16.1 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.7 2-2.1 3.7-3.8 5l6.2 5.2C40.9 35.4 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
)

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} title={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
      {show ? '🙈' : '👁️'}
    </button>
  )
}

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const { loading, error, login, register, loginWithGoogle, resetPassword } = useAuthController()
  const [forgotMode,    setForgotMode]    = useState(false)
  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // Login state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Register state
  const [rEmail,    setREmail]    = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rName,     setRName]     = useState('')
  const [rGrade,    setRGrade]    = useState('')
  const [rRole,     setRRole]     = useState(ROLES.STUDENT)
  const [showRPass, setShowRPass] = useState(false)
  const [strength,  setStrength]  = useState(0)
  const [terms,     setTerms]     = useState(false)

  function checkStrength(v) {
    let s = 0
    if (v.length >= 8)           s++
    if (/[A-Z]/.test(v))         s++
    if (/[0-9]/.test(v))         s++
    if (/[^A-Za-z0-9]/.test(v))  s++
    setStrength(s)
  }

  const strengthLabels = ['', 'Yếu 😅', 'Trung bình 😐', 'Khá 😊', 'Mạnh 💪']
  const strengthCls    = ['', styles.weak, styles.medium, styles.medium, styles.strong]

  return (
    <div>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'login' ? styles.activeTab : ''}`}
          onClick={() => setTab('login')}
        >Đăng nhập</button>
        <button
          className={`${styles.tab} ${tab === 'register' ? styles.activeTab : ''}`}
          onClick={() => setTab('register')}
        >Đăng ký</button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* LOGIN */}
      {tab === 'login' && !forgotMode && (
        <form onSubmit={e => { e.preventDefault(); login(email, password) }}>
          <h2 className={styles.title}>Đăng nhập</h2>
          <p className={styles.sub}>Chào mừng bạn quay lại! 👋</p>

          <Input label="Email trường học" type="email" placeholder="ten@iec.edu.vn"
            value={email} onChange={e => setEmail(e.target.value)} />
          <div style={{ marginTop: 14 }}>
            <Input
              label="Mật khẩu"
              type={showPass ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<EyeToggle show={showPass} onToggle={() => setShowPass(v => !v)} />}
            />
          </div>
          <div className={styles.forgotWrap}>
            <button type="button" className={styles.forgot}
              onClick={() => { setForgotMode(true); setForgotEmail(email); setForgotSuccess(false) }}>
              Quên mật khẩu?
            </button>
          </div>

          <Button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
          </Button>

          <div className={styles.divider}><span>hoặc</span></div>

          <button type="button" className={styles.googleBtn} onClick={loginWithGoogle} disabled={loading}>
            {GOOGLE_ICON} Tiếp tục với Google
          </button>

          <p className={styles.switchLink}>
            Chưa có tài khoản?{' '}
            <button type="button" onClick={() => setTab('register')}>Đăng ký ngay</button>
          </p>
        </form>
      )}

      {/* FORGOT PASSWORD */}
      {tab === 'login' && forgotMode && (
        <div>
          <button className={styles.backBtn} onClick={() => setForgotMode(false)}>← Quay lại</button>
          <h2 className={styles.title}>Đặt lại mật khẩu</h2>
          <p className={styles.sub}>Nhập email trường học, chúng tôi sẽ gửi link đặt lại mật khẩu. 📧</p>

          {forgotSuccess ? (
            <div className={styles.successBanner}>
              ✅ Email đã được gửi! Kiểm tra hộp thư (kể cả Spam) và làm theo hướng dẫn.
            </div>
          ) : (
            <form onSubmit={async e => {
              e.preventDefault()
              const ok = await resetPassword(forgotEmail)
              if (ok) setForgotSuccess(true)
            }}>
              <Input label="Email trường học" type="email" placeholder="ten@iec.edu.vn"
                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              <Button type="submit" className={styles.submitBtn} disabled={loading || !forgotEmail.trim()}>
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu →'}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* REGISTER */}
      {tab === 'register' && (
        <form onSubmit={e => {
          e.preventDefault()
          if (!terms) return
          register(rEmail, rPassword, rName, rGrade, rRole)
        }}>
          <h2 className={styles.title}>Tạo tài khoản</h2>
          <p className={styles.sub}>Tham gia cộng đồng tử tế ngay hôm nay! 🌟</p>

          {/* Role toggle */}
          <div className={styles.roleToggle}>
            <button
              type="button"
              className={`${styles.roleBtn} ${rRole === ROLES.STUDENT ? styles.roleBtnActive : ''}`}
              onClick={() => setRRole(ROLES.STUDENT)}
            >
              🎒 Học sinh
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${rRole === ROLES.PENDING_TEACHER ? styles.roleBtnActive : ''}`}
              onClick={() => setRRole(ROLES.PENDING_TEACHER)}
            >
              👨‍🏫 Giáo viên
            </button>
          </div>

          {rRole === ROLES.PENDING_TEACHER && (
            <div className={styles.teacherNote}>
              ℹ️ Tài khoản giáo viên sẽ được quản trị viên duyệt trước khi kích hoạt.
            </div>
          )}

          <Input label="Họ và tên" placeholder="Nguyễn Văn A"
            value={rName} onChange={e => setRName(e.target.value)} />
          <div style={{ marginTop: 14 }}>
            <Input label="Email trường học" type="email" placeholder="ten@iec.edu.vn"
              value={rEmail} onChange={e => setREmail(e.target.value)} />
          </div>
          {rRole === ROLES.STUDENT && (
            <div style={{ marginTop: 14 }}>
              <Input label="Lớp học" placeholder="VD: 10A1, 11B2, 12A3..."
                value={rGrade} onChange={e => setRGrade(e.target.value)} />
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <Input
              label="Mật khẩu"
              type={showRPass ? 'text' : 'password'}
              placeholder="Tối thiểu 8 ký tự"
              value={rPassword}
              onChange={e => { setRPassword(e.target.value); checkStrength(e.target.value) }}
              icon={<EyeToggle show={showRPass} onToggle={() => setShowRPass(v => !v)} />}
            />
          </div>

          {/* Strength bar */}
          <div className={styles.strengthBar}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`${styles.seg} ${i < strength ? strengthCls[strength] : ''}`} />
            ))}
          </div>
          {rPassword && <div className={styles.strengthLabel}>{strengthLabels[strength]}</div>}

          <label className={styles.terms}>
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
            Tôi đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách bảo mật</a>
          </label>

          <Button type="submit" variant="accent" className={styles.submitBtn}
            disabled={loading || !terms}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản ✨'}
          </Button>

          <div className={styles.divider}><span>hoặc</span></div>

          <button type="button" className={styles.googleBtn} onClick={loginWithGoogle} disabled={loading}>
            {GOOGLE_ICON} Đăng ký với Google
          </button>

          <p className={styles.switchLink}>
            Đã có tài khoản?{' '}
            <button type="button" onClick={() => setTab('login')}>Đăng nhập</button>
          </p>
        </form>
      )}
    </div>
  )
}
