/** Lấy chữ viết tắt từ tên (VD: "Nguyễn Văn A" → "NV") */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/** Format timestamp thành chuỗi thân thiện */
export function formatRelativeTime(date) {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  const diff = (Date.now() - d.getTime()) / 1000

  if (diff < 60)       return 'vừa xong'
  if (diff < 3600)     return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400)    return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800)   return `${Math.floor(diff / 86400)} ngày trước`

  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

/** Format số lớn: 1234 → "1.234" */
export function formatNumber(n = 0) {
  return n.toLocaleString('vi-VN')
}

/** Validate file upload phía client */
export function validateFile(file, { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES }) {
  const accepted = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES]
  if (!accepted.includes(file.type)) throw new Error('Định dạng không hỗ trợ (JPEG, PNG, GIF, MP4)')
  if (file.size > MAX_FILE_SIZE) throw new Error('File quá lớn (tối đa 10 MB)')
  return ACCEPTED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video'
}

const KINDNESS_TITLES = [
  { min: 0,   icon: '🌰', title: 'Hạt giống'       },
  { min: 20,  icon: '🌱', title: 'Mầm non'          },
  { min: 50,  icon: '🌿', title: 'Chồi non'         },
  { min: 100, icon: '🪴', title: 'Cây con'          },
  { min: 200, icon: '🌳', title: 'Cây xanh'         },
  { min: 400, icon: '🌲', title: 'Cây trưởng thành' },
  { min: 700, icon: '🌴', title: 'Cây cổ thụ'       },
]

export function getKindnessTitle(points = 0) {
  for (let i = KINDNESS_TITLES.length - 1; i >= 0; i--) {
    if (points >= KINDNESS_TITLES[i].min) return KINDNESS_TITLES[i]
  }
  return KINDNESS_TITLES[0]
}

export function getRoleLabel(role) {
  if (role === 'teacher')         return 'Giáo viên'
  if (role === 'admin')           return 'Quản trị viên'
  if (role === 'pending_teacher') return 'Chờ duyệt'
  return 'Học sinh'
}

export function getRoleClass(role, s) {
  if (role === 'teacher') return s.teacher
  if (role === 'admin')   return s.admin
  return s.student
}

/** Tính màu avatar từ tên (để consistent dù không có ảnh) */
const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8', border: '#1D4ED8' },
  { bg: '#FEE2E2', color: '#EF4444', border: '#EF4444' },
  { bg: '#FEF3C7', color: '#D97706', border: '#D97706' },
  { bg: '#DCFCE7', color: '#16A34A', border: '#16A34A' },
  { bg: '#EDE9FE', color: '#7C3AED', border: '#7C3AED' },
  { bg: '#FFF0E6', color: '#EA580C', border: '#EA580C' },
]

export function getAvatarColor(uid = '') {
  const idx = uid.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}
