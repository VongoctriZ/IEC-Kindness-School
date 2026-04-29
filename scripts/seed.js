/**
 * Seed script — đẩy dữ liệu mẫu lên Firebase Firestore
 * Chạy: npm run seed
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Đặt tên file key vào FIREBASE_ADMIN_KEY_FILE trong .env, hoặc truyền qua terminal:
// FIREBASE_ADMIN_KEY_FILE=../your-key.json node scripts/seed.js
const keyFile = process.env.FIREBASE_ADMIN_KEY_FILE
if (!keyFile) {
  console.error('❌ Cần set FIREBASE_ADMIN_KEY_FILE=<path-to-adminsdk.json>')
  process.exit(1)
}

const serviceAccount = JSON.parse(
  readFileSync(path.join(__dirname, keyFile), 'utf8'),
)

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db        = admin.firestore()
const Timestamp = admin.firestore.Timestamp

// ── Helpers ────────────────────────────────────────────────────────────────
function ts(daysAgo, hour = 10, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return Timestamp.fromDate(d)
}

// ── USERS ──────────────────────────────────────────────────────────────────
const USERS = [
  { uid: 'u01', displayName: 'Hoàng Thị Linh',  email: 'linh.ht@iec.edu.vn',   role: 'student', grade: '12A1', totalPoints: 520, createdAt: ts(120) },
  { uid: 'u02', displayName: 'Bùi Minh Đức',    email: 'duc.bm@iec.edu.vn',    role: 'student', grade: '12A3', totalPoints: 480, createdAt: ts(118) },
  { uid: 'u03', displayName: 'Trần Ngọc Hà',    email: 'ha.tn@iec.edu.vn',     role: 'student', grade: '11B1', totalPoints: 445, createdAt: ts(115) },
  { uid: 'u04', displayName: 'Phạm Khánh An',   email: 'an.pk@iec.edu.vn',     role: 'student', grade: '10A2', totalPoints: 390, createdAt: ts(110) },
  { uid: 'u05', displayName: 'Võ Lâm Anh',      email: 'anh.vl@iec.edu.vn',    role: 'student', grade: '10B1', totalPoints: 355, createdAt: ts(108) },
  { uid: 'u06', displayName: 'Đinh Hồng Sơn',   email: 'son.dh@iec.edu.vn',    role: 'student', grade: '11A2', totalPoints: 315, createdAt: ts(100) },
  { uid: 'u07', displayName: 'Nguyễn Văn An',   email: 'an.nv@iec.edu.vn',     role: 'student', grade: '10A1', totalPoints: 285, createdAt: ts(95)  },
  { uid: 'u08', displayName: 'Ngô Hải Yến',     email: 'yen.nh@iec.edu.vn',    role: 'student', grade: '11A1', totalPoints: 260, createdAt: ts(90)  },
  { uid: 'u09', displayName: 'Lê Thị Bảo',      email: 'bao.lt@iec.edu.vn',    role: 'student', grade: '11B2', totalPoints: 230, createdAt: ts(85)  },
  { uid: 'u10', displayName: 'Phạm Tuấn Khải',  email: 'khai.pt@iec.edu.vn',   role: 'student', grade: '10A3', totalPoints: 200, createdAt: ts(80)  },
  { uid: 'u11', displayName: 'Cô Minh Nguyệt',  email: 'nguyet.m@iec.edu.vn',  role: 'teacher', grade: '',     totalPoints: 180, createdAt: ts(180) },
  { uid: 'u12', displayName: 'Thầy Trọng Đức',  email: 'duc.t@iec.edu.vn',     role: 'teacher', grade: '',     totalPoints: 150, createdAt: ts(175) },
]

// ── POSTS ──────────────────────────────────────────────────────────────────
const POSTS = [
  {
    id: 'p01', authorId: 'u09', authorName: 'Lê Thị Bảo', authorRole: 'student',
    authorGrade: '11B2', authorPhotoURL: null,
    content: 'Hôm nay mình đã dành gần 3 tiếng giúp em lớp 9 ôn thi Toán. Thấy vui lắm khi em ấy dần hiểu bài và tự giải được bài khó! 🎉 Hy vọng em thi tốt nhé!',
    mediaUrl: null, mediaType: null, likeCount: 47, commentCount: 12, createdAt: ts(0, 8, 23),
  },
  {
    id: 'p02', authorId: 'u10', authorName: 'Phạm Tuấn Khải', authorRole: 'student',
    authorGrade: '10A3', authorPhotoURL: null,
    content: 'Sáng nay mình nhặt được ví của một bác lớn tuổi trên sân trường, đã mang trả bác ngay. Bác vui lắm và cảm ơn mãi 🙏 Làm việc tốt mà không cần ai biết mới là thật sự ý nghĩa!',
    mediaUrl: null, mediaType: null, likeCount: 89, commentCount: 24, createdAt: ts(0, 12, 10),
  },
  {
    id: 'p03', authorId: 'u11', authorName: 'Cô Minh Nguyệt', authorRole: 'teacher',
    authorGrade: '', authorPhotoURL: null,
    content: 'Hôm nay lớp 11A1 tự tổ chức dọn dẹp và trang trí lớp học thật đẹp mà không cần cô nhắc nhở. Cô tự hào về các em lắm! Đây chính là tinh thần trách nhiệm mà cô mong muốn thấy 🌟',
    mediaUrl: null, mediaType: null, likeCount: 112, commentCount: 35, createdAt: ts(1, 15, 30),
  },
  {
    id: 'p04', authorId: 'u07', authorName: 'Nguyễn Văn An', authorRole: 'student',
    authorGrade: '10A1', authorPhotoURL: null,
    content: 'Mình vừa quyên góp 23 cuốn sách cũ cho thư viện trường! Nếu bạn nào có sách không dùng nữa hãy để lại box ở cổng trường nhé 📦🙏 Cùng nhau xây dựng tủ sách chung cho trường mình!',
    mediaUrl: null, mediaType: null, likeCount: 64, commentCount: 18, createdAt: ts(1, 16, 45),
  },
  {
    id: 'p05', authorId: 'u01', authorName: 'Hoàng Thị Linh', authorRole: 'student',
    authorGrade: '12A1', authorPhotoURL: null,
    content: 'Hôm nay mình và nhóm bạn đã nhặt rác trong khuôn viên trường sau giờ tan học. Góp phần nhỏ giữ gìn môi trường xanh sạch đẹp cho cả trường! Ai muốn tham gia lần sau cứ nhắn mình nhé 🌿',
    mediaUrl: null, mediaType: null, likeCount: 78, commentCount: 22, createdAt: ts(2, 17, 0),
  },
  {
    id: 'p06', authorId: 'u03', authorName: 'Trần Ngọc Hà', authorRole: 'student',
    authorGrade: '11B1', authorPhotoURL: null,
    content: 'Hôm qua mình phát hiện bạn cùng lớp bị ốm và không có ai đưa về. Mình đã ở lại chăm sóc bạn và sau đó nhờ phụ huynh đưa bạn về nhà. Mong bạn ấy nhanh khỏe 💪',
    mediaUrl: null, mediaType: null, likeCount: 93, commentCount: 28, createdAt: ts(2, 9, 15),
  },
  {
    id: 'p07', authorId: 'u02', authorName: 'Bùi Minh Đức', authorRole: 'student',
    authorGrade: '12A3', authorPhotoURL: null,
    content: 'Mình vừa hoàn thành 3 buổi dạy kèm miễn phí Tiếng Anh cho 5 em học sinh khó khăn ở xóm trọ gần nhà. Thấy các em tiến bộ từng ngày mà lòng vui lắm! 📚✨',
    mediaUrl: null, mediaType: null, likeCount: 135, commentCount: 41, createdAt: ts(3, 11, 20),
  },
  {
    id: 'p08', authorId: 'u08', authorName: 'Ngô Hải Yến', authorRole: 'student',
    authorGrade: '11A1', authorPhotoURL: null,
    content: 'Tặng áo mưa cho bác bảo vệ trường vì hôm nay trời mưa to mà bác không mang áo mưa đi. Bác cảm ơn mình mãi, mình cảm thấy ấm lòng lắm 🙏☔',
    mediaUrl: null, mediaType: null, likeCount: 54, commentCount: 15, createdAt: ts(3, 14, 30),
  },
  {
    id: 'p09', authorId: 'u04', authorName: 'Phạm Khánh An', authorRole: 'student',
    authorGrade: '10A2', authorPhotoURL: null,
    content: 'Chi hội lớp 10A2 hôm nay đã tổ chức thành công buổi bán đồ ăn vặt gây quỹ cho bạn Minh Khoa đang điều trị bệnh. Góp được 2,3 triệu! Cảm ơn tất cả mọi người đã ủng hộ ❤️',
    mediaUrl: null, mediaType: null, likeCount: 187, commentCount: 52, createdAt: ts(4, 16, 0),
  },
  {
    id: 'p10', authorId: 'u05', authorName: 'Võ Lâm Anh', authorRole: 'student',
    authorGrade: '10B1', authorPhotoURL: null,
    content: 'Hôm nay trên đường đi học, mình phát hiện một bạn nhỏ bị ngã xe đạp. Mình dừng lại băng bó vết thương cho bạn và gọi điện báo cho phụ huynh của bạn. Thật may là bạn không sao! 🏥',
    mediaUrl: null, mediaType: null, likeCount: 72, commentCount: 19, createdAt: ts(5, 7, 45),
  },
  {
    id: 'p11', authorId: 'u12', authorName: 'Thầy Trọng Đức', authorRole: 'teacher',
    authorGrade: '', authorPhotoURL: null,
    content: 'Xúc động khi chứng kiến các em 12A3 tự nguyện ở lại sau giờ học để trang trí phòng thi cho các em khối dưới. Đây là truyền thống tốt đẹp mà thầy mong các thế hệ sau sẽ tiếp nối! 🌟',
    mediaUrl: null, mediaType: null, likeCount: 98, commentCount: 31, createdAt: ts(5, 17, 30),
  },
  {
    id: 'p12', authorId: 'u06', authorName: 'Đinh Hồng Sơn', authorRole: 'student',
    authorGrade: '11A2', authorPhotoURL: null,
    content: 'Mình vừa hoàn thành 10 buổi phụ đạo miễn phí Vật Lý cho các bạn yếu trong lớp. Kết quả kiểm tra giữa kỳ, cả 8 bạn đều đạt điểm trên trung bình! Vui hơn cả khi được điểm cao 😊',
    mediaUrl: null, mediaType: null, likeCount: 156, commentCount: 47, createdAt: ts(6, 20, 0),
  },
  {
    id: 'p13', authorId: 'u01', authorName: 'Hoàng Thị Linh', authorRole: 'student',
    authorGrade: '12A1', authorPhotoURL: null,
    content: 'Cuối tuần vừa rồi mình cùng CLB Xanh tham gia trồng 50 cây xanh tại công viên gần trường. Mỗi cây mình trồng là một lời hứa với thiên nhiên và thế hệ tương lai 🌱',
    mediaUrl: null, mediaType: null, likeCount: 201, commentCount: 63, createdAt: ts(7, 9, 0),
  },
  {
    id: 'p14', authorId: 'u09', authorName: 'Lê Thị Bảo', authorRole: 'student',
    authorGrade: '11B2', authorPhotoURL: null,
    content: 'Hôm nay mình và các bạn đã đến thăm Mái ấm trẻ em có hoàn cảnh khó khăn ở quận 9. Mang theo sách vở, quần áo và đồ chơi cho các em. Nhìn nụ cười của các em mà thấy cuộc sống thật ý nghĩa 💕',
    mediaUrl: null, mediaType: null, likeCount: 244, commentCount: 78, createdAt: ts(10, 16, 30),
  },
  {
    id: 'p15', authorId: 'u03', authorName: 'Trần Ngọc Hà', authorRole: 'student',
    authorGrade: '11B1', authorPhotoURL: null,
    content: 'Mình phát hiện bạn cùng bàn quên đồ dùng học tập từ hôm qua. Sáng nay mình mua thêm một bộ dụng cụ vẽ để tặng bạn trước giờ Mỹ Thuật. Bạn ấy vui lắm! 🎨',
    mediaUrl: null, mediaType: null, likeCount: 67, commentCount: 21, createdAt: ts(12, 8, 0),
  },
  {
    id: 'p16', authorId: 'u02', authorName: 'Bùi Minh Đức', authorRole: 'student',
    authorGrade: '12A3', authorPhotoURL: null,
    content: 'Hôm nay mình giúp một cụ già qua đường ở đoạn giao lộ gần trường. Cụ không nhìn thấy rõ đèn tín hiệu. Đơn giản thôi nhưng thấy ý nghĩa lắm! Nhớ quan tâm đến người lớn tuổi xung quanh mình nhé 👴',
    mediaUrl: null, mediaType: null, likeCount: 88, commentCount: 26, createdAt: ts(14, 7, 30),
  },
  {
    id: 'p17', authorId: 'u07', authorName: 'Nguyễn Văn An', authorRole: 'student',
    authorGrade: '10A1', authorPhotoURL: null,
    content: 'Hôm qua mình dành 2 tiếng hướng dẫn bạn cùng lớp giải các bài Vật Lý khó. Thấy vui khi bạn ấy hiểu ra! Chia sẻ kiến thức không bao giờ làm mình mất đi điều gì cả 🎉',
    mediaUrl: null, mediaType: null, likeCount: 42, commentCount: 11, createdAt: ts(15, 15, 10),
  },
  {
    id: 'p18', authorId: 'u08', authorName: 'Ngô Hải Yến', authorRole: 'student',
    authorGrade: '11A1', authorPhotoURL: null,
    content: 'Mình và nhóm bạn đã dọn dẹp khu vực hành lang tầng 2 và 3 sau giờ học. Trường sạch đẹp hơn rồi! Chỉ mất 30 phút thôi nhưng kết quả thật sự đáng tự hào 🧹✨',
    mediaUrl: null, mediaType: null, likeCount: 56, commentCount: 16, createdAt: ts(18, 17, 0),
  },
  {
    id: 'p19', authorId: 'u04', authorName: 'Phạm Khánh An', authorRole: 'student',
    authorGrade: '10A2', authorPhotoURL: null,
    content: 'Hôm nay mình nhường chỗ ngồi của mình cho bạn bị gãy chân đang phải đứng học. Mình đứng học được mà, bạn ấy cần hơn. Những việc nhỏ như thế này mới làm nên sự khác biệt trong lớp học 💪',
    mediaUrl: null, mediaType: null, likeCount: 73, commentCount: 20, createdAt: ts(20, 10, 45),
  },
  {
    id: 'p20', authorId: 'u05', authorName: 'Võ Lâm Anh', authorRole: 'student',
    authorGrade: '10B1', authorPhotoURL: null,
    content: 'Vừa hoàn thành chương trình "Bữa sáng yêu thương" — phát 50 suất bánh mì cho các bạn học sinh có hoàn cảnh khó khăn ở gần trường. Cảm ơn các bạn đã góp tay cùng mình! 🥖❤️',
    mediaUrl: null, mediaType: null, likeCount: 312, commentCount: 89, createdAt: ts(25, 6, 30),
  },
]

// ── COMMENTS ──────────────────────────────────────────────────────────────
const COMMENTS = [
  { postId: 'p01', authorId: 'u07', authorName: 'Nguyễn Văn An',  authorRole: 'student', authorPhotoURL: null, content: 'Bạn thật tuyệt vời! Mình cũng đang cần tìm người dạy kèm Toán cho em mình đây 💪', createdAt: ts(0, 9, 0) },
  { postId: 'p01', authorId: 'u03', authorName: 'Trần Ngọc Hà',   authorRole: 'student', authorPhotoURL: null, content: 'Cảm ơn bạn đã chia sẻ! Hành động đẹp quá 🌟', createdAt: ts(0, 9, 30) },
  { postId: 'p01', authorId: 'u11', authorName: 'Cô Minh Nguyệt', authorRole: 'teacher', authorPhotoURL: null, content: 'Cô tự hào về em! Đây đúng là tinh thần của học sinh IEC 🥰', createdAt: ts(0, 10, 0) },
  { postId: 'p02', authorId: 'u01', authorName: 'Hoàng Thị Linh', authorRole: 'student', authorPhotoURL: null, content: 'Bạn thật thà và tốt bụng quá! Mình học được nhiều từ bạn 😊', createdAt: ts(0, 13, 0) },
  { postId: 'p02', authorId: 'u06', authorName: 'Đinh Hồng Sơn',  authorRole: 'student', authorPhotoURL: null, content: 'Làm việc tốt không cần ai biết — câu này chuẩn lắm bạn ơi!', createdAt: ts(0, 13, 30) },
  { postId: 'p03', authorId: 'u01', authorName: 'Hoàng Thị Linh', authorRole: 'student', authorPhotoURL: null, content: 'Lớp 11A1 quá tuyệt! Cô Nguyệt dạy giỏi mà còn có học sinh ngoan nữa 🌟', createdAt: ts(1, 16, 0) },
  { postId: 'p03', authorId: 'u02', authorName: 'Bùi Minh Đức',   authorRole: 'student', authorPhotoURL: null, content: 'Phải học lớp 11A1 mới được nha mọi người 😄', createdAt: ts(1, 16, 30) },
  { postId: 'p03', authorId: 'u12', authorName: 'Thầy Trọng Đức', authorRole: 'teacher', authorPhotoURL: null, content: 'Thầy cũng tự hào lắm khi nghe tin này! Tinh thần tập thể rất đáng khích lệ!', createdAt: ts(1, 17, 0) },
  { postId: 'p04', authorId: 'u05', authorName: 'Võ Lâm Anh',     authorRole: 'student', authorPhotoURL: null, content: 'Mình sẽ mang sách đến nộp ngay tuần này! Cảm ơn bạn đã khởi xướng 📚', createdAt: ts(1, 17, 30) },
  { postId: 'p07', authorId: 'u11', authorName: 'Cô Minh Nguyệt', authorRole: 'teacher', authorPhotoURL: null, content: 'Em Đức thật đáng ngưỡng mộ! Cô rất tự hào khi học sinh IEC có tấm lòng như vậy ❤️', createdAt: ts(3, 12, 0) },
  { postId: 'p07', authorId: 'u04', authorName: 'Phạm Khánh An',  authorRole: 'student', authorPhotoURL: null, content: 'Bạn là tấm gương sáng của trường mình! Mình cũng muốn tham gia dạy kèm với bạn được không?', createdAt: ts(3, 12, 30) },
  { postId: 'p09', authorId: 'u11', authorName: 'Cô Minh Nguyệt', authorRole: 'teacher', authorPhotoURL: null, content: 'Cô tự hào về lớp 10A2! Đây mới là ý nghĩa thực sự của tập thể lớp học 💕', createdAt: ts(4, 17, 0) },
  { postId: 'p09', authorId: 'u01', authorName: 'Hoàng Thị Linh', authorRole: 'student', authorPhotoURL: null, content: 'Wow gây quỹ được nhiều quá! Các bạn 10A2 quá đỉnh ❤️', createdAt: ts(4, 17, 30) },
  { postId: 'p09', authorId: 'u06', authorName: 'Đinh Hồng Sơn',  authorRole: 'student', authorPhotoURL: null, content: 'Cảm ơn lớp 10A2 vì đã làm gương cho cả trường!', createdAt: ts(4, 18, 0) },
  { postId: 'p13', authorId: 'u12', authorName: 'Thầy Trọng Đức', authorRole: 'teacher', authorPhotoURL: null, content: 'Trồng cây là trồng tương lai! Thầy sẽ vận động thêm giáo viên cùng tham gia lần sau.', createdAt: ts(7, 10, 0) },
  { postId: 'p13', authorId: 'u08', authorName: 'Ngô Hải Yến',    authorRole: 'student', authorPhotoURL: null, content: 'Mình muốn tham gia đợt tới! Bạn cho mình xin liên hệ CLB Xanh nhé 🌿', createdAt: ts(7, 10, 30) },
  { postId: 'p14', authorId: 'u02', authorName: 'Bùi Minh Đức',   authorRole: 'student', authorPhotoURL: null, content: 'Hành động ý nghĩa lắm bạn ơi! Mình cũng muốn đi lần sau. Thông báo cho mình nhé!', createdAt: ts(10, 17, 0) },
  { postId: 'p20', authorId: 'u03', authorName: 'Trần Ngọc Hà',   authorRole: 'student', authorPhotoURL: null, content: '"Bữa sáng yêu thương" — cái tên hay quá! Cảm ơn bạn và nhóm đã làm điều này cho cộng đồng 🙏', createdAt: ts(25, 7, 0) },
  { postId: 'p20', authorId: 'u11', authorName: 'Cô Minh Nguyệt', authorRole: 'teacher', authorPhotoURL: null, content: 'Cô sẽ đề xuất hoạt động này cho Ban Giám Hiệu để làm thường xuyên hơn. Các em thật tuyệt vời!', createdAt: ts(25, 8, 0) },
]

// ── LIKES (ai like bài nào) ────────────────────────────────────────────────
// Mỗi entry: postId → [uid của các người đã like]
const LIKES = {
  p01: ['u01','u02','u03','u04','u05','u06','u07','u08'],
  p02: ['u01','u02','u03','u04','u05','u06','u07','u08','u09','u11','u12'],
  p03: ['u01','u02','u03','u04','u05','u06','u07','u08','u09','u10','u12'],
  p04: ['u01','u02','u03','u05','u06','u08','u09','u10','u11','u12'],
  p05: ['u01','u02','u03','u04','u06','u07','u08','u09','u10','u11'],
  p07: ['u01','u02','u03','u04','u05','u06','u08','u09','u10','u11','u12'],
  p09: ['u01','u02','u03','u05','u06','u07','u08','u09','u10','u11','u12'],
  p12: ['u01','u02','u03','u04','u05','u07','u08','u09','u10','u11','u12'],
  p13: ['u02','u03','u04','u05','u06','u07','u08','u09','u10','u11','u12'],
  p14: ['u01','u02','u03','u04','u05','u06','u07','u08','u10','u11','u12'],
  p20: ['u01','u02','u03','u04','u05','u06','u07','u08','u09','u10','u11','u12'],
}

// ── SEED FUNCTIONS ─────────────────────────────────────────────────────────

// Đặt SEED_PASSWORD trong .env hoặc truyền qua terminal khi chạy script
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Change_me_123!'

async function seedAuthUsers() {
  process.stdout.write('⏳ Seeding Firebase Auth accounts... ')
  let created = 0, skipped = 0
  for (const u of USERS) {
    try {
      await admin.auth().createUser({
        uid:           u.uid,
        email:         u.email,
        password:      SEED_PASSWORD,
        displayName:   u.displayName,
        emailVerified: true,
      })
      created++
    } catch (e) {
      if (e.code === 'auth/uid-already-exists' || e.code === 'auth/email-already-exists') {
        skipped++   // user đã tồn tại từ lần seed trước — bỏ qua
      } else {
        throw e
      }
    }
  }
  console.log(`✅ ${created} created, ${skipped} already existed`)
}

async function seedUsers() {
  process.stdout.write('⏳ Seeding Firestore user docs... ')
  const batch = db.batch()
  for (const { uid, ...data } of USERS) {
    batch.set(db.collection('users').doc(uid), data)
  }
  await batch.commit()
  console.log(`✅ ${USERS.length} users`)
}

async function seedPosts() {
  process.stdout.write('⏳ Seeding posts... ')
  const batch = db.batch()
  for (const { id, ...data } of POSTS) {
    batch.set(db.collection('posts').doc(id), data)
  }
  await batch.commit()
  console.log(`✅ ${POSTS.length} posts`)
}

async function seedComments() {
  process.stdout.write('⏳ Seeding comments... ')
  const batch = db.batch()
  for (const comment of COMMENTS) {
    batch.set(db.collection('comments').doc(), comment)
  }
  await batch.commit()
  console.log(`✅ ${COMMENTS.length} comments`)
}

async function seedLikes() {
  process.stdout.write('⏳ Seeding likes... ')
  let total = 0
  for (const [postId, uids] of Object.entries(LIKES)) {
    const batch = db.batch()
    for (const uid of uids) {
      const ref = db.collection('posts').doc(postId).collection('likes').doc(uid)
      batch.set(ref, { uid, createdAt: ts(0) })
      total++
    }
    await batch.commit()
  }
  console.log(`✅ ${total} likes`)
}

async function main() {
  console.log('\n🌱 Bắt đầu seed dữ liệu cho kindness-school...\n')
  try {
    await seedAuthUsers()
    await seedUsers()
    await seedPosts()
    await seedComments()
    await seedLikes()
    console.log('\n✅ Seed hoàn tất!')
    console.log(`🔑 Mật khẩu chung cho tất cả tài khoản seed: ${SEED_PASSWORD}`)
    console.log('👉 Chạy `npm run dev` để xem kết quả tại http://localhost:5173\n')
  } catch (e) {
    if (e.message?.includes('no configuration corresponding')) {
      console.error('\n❌ Firebase Authentication chưa được bật!')
      console.error('   → Vào Firebase Console → Authentication → Get started → Sign-in method → Email/Password → Enable')
    } else {
      console.error('\n❌ Seed thất bại:', e.message)
    }
    process.exit(1)
  }
  process.exit(0)
}

main()
