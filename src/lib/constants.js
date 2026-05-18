export const POINTS = {
  POST:          10,
  COMMENT:        5,
  LIKE_RECEIVED:  2,
  REGISTER:      20,
}

export const ROLES = {
  STUDENT:         'student',
  TEACHER:         'teacher',
  PENDING_TEACHER: 'pending_teacher',
  ADMIN:           'admin',
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10 MB

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm']

export const FEED_PAGE_SIZE      = 20
export const FEED_LOAD_MORE_SIZE = 10
export const LEADERBOARD_SIZE    = 200

export const MATURE_TREE_THRESHOLD = 1000
export const ANCIENT_TREE_COUNT    = 3    // matureTreeCount >= 3 → Cây cổ thụ

export const GRADE_BLOCKS = [6, 7, 8, 9, 10, 11, 12]
