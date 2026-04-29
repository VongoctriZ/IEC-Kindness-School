import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, signInWithGoogle, signOutUser, sendPasswordReset } from '../../services/auth.service'

export function useAuthController() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const navigate = useNavigate()

  async function login(email, password) {
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/')
    } catch (e) {
      setError(mapError(e.code))
    } finally {
      setLoading(false)
    }
  }

  async function register(email, password, displayName, grade) {
    setLoading(true)
    setError('')
    try {
      await signUp(email, password, displayName, grade)
      navigate('/')
    } catch (e) {
      setError(mapError(e.code))
    } finally {
      setLoading(false)
    }
  }

  async function loginWithGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (e) {
      setError(mapError(e.code))
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(email) {
    setLoading(true)
    setError('')
    try {
      await sendPasswordReset(email)
      return true
    } catch (e) {
      setError(mapError(e.code))
      return false
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await signOutUser()
    navigate('/login')
  }

  return { loading, error, login, register, loginWithGoogle, resetPassword, logout }
}

function mapError(code) {
  const MAP = {
    'auth/user-not-found':          'Email không tồn tại',
    'auth/wrong-password':          'Mật khẩu không đúng',
    'auth/invalid-credential':      'Email hoặc mật khẩu không đúng',
    'auth/email-already-in-use':    'Email đã được sử dụng',
    'auth/weak-password':           'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
    'auth/invalid-email':           'Email không hợp lệ',
    'auth/too-many-requests':       'Quá nhiều lần thử. Vui lòng thử lại sau.',
    'auth/popup-closed-by-user':    'Đăng nhập Google bị huỷ',
    'auth/cancelled-popup-request': 'Đăng nhập Google bị huỷ',
    'auth/operation-not-allowed':   'Phương thức đăng nhập chưa được bật. Vào Firebase Console → Authentication → Sign-in method để bật.',
    'auth/network-request-failed':  'Lỗi mạng. Kiểm tra kết nối internet.',
    'auth/user-disabled':           'Tài khoản đã bị vô hiệu hoá.',
  }
  return MAP[code] ?? `Lỗi: ${code ?? 'không xác định'}. Vui lòng thử lại.`
}
