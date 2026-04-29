# IEC-KindnessSchool — Báo cáo tiến độ dự án

> Cập nhật: 2026-04-29 · Phiên bản 1.2

---

## 1. Tổng quan ý tưởng & Concept

### Bối cảnh & Vấn đề

Trường IEC cần một kênh để khuyến khích học sinh chia sẻ hành động tốt, tham gia tích cực vào hoạt động cộng đồng. Các mạng xã hội thông thường (Facebook, TikTok) không phù hợp với môi trường học đường và thiếu cơ chế ghi nhận cụ thể.

### Giải pháp: Mạng xã hội học đường tích cực

**IEC-KindnessSchool** là nền tảng mạng xã hội nội bộ dành riêng cho học sinh và giáo viên trường IEC, kết hợp cơ chế **gamification** (trò chơi hóa) để khuyến khích hành động tốt.

Triết lý cốt lõi:
> *"Mỗi hành động tốt đều được ghi nhận — không bị lãng quên."*

Mỗi khi học sinh đăng bài, bình luận hay nhận like, họ nhận được **Kindness Points (KP)** — điểm thưởng hiển thị công khai trên bảng xếp hạng toàn trường. Điểm số cao không mang lại phần thưởng vật chất, nhưng tạo ra **sự nhận diện cộng đồng** — điều có giá trị thực sự với học sinh THPT.

### Concept thiết kế

| Yếu tố | Mô tả |
|--------|-------|
| Phong cách | Tươi sáng, vui nhộn, phù hợp học sinh THPT |
| Màu chủ đạo | Xanh lá (`#22C55E`) — thân thiện, tự nhiên, tích cực |
| Màu nhấn | Indigo (`#6B6FD8`) — buttons, active states |
| Nền trang | `#F5F5F5` (xám nhạt), card nền trắng |
| Font | Inter / Segoe UI |
| Hình dạng | Bo tròn nhiều (pill buttons, card radius 12–16px) |
| Ngôn ngữ | Tiếng Việt 100% |

### Hệ thống danh hiệu Kindness Points (Plant Growth)

Lấy cảm hứng từ quá trình phát triển của cây — mỗi học sinh bắt đầu từ một hạt giống và lớn lên qua từng cột mốc điểm:

| Điểm | Icon | Danh hiệu |
|------|------|-----------|
| 0 | 🌰 | Hạt giống |
| 20 | 🌱 | Mầm non |
| 50 | 🌿 | Chồi non |
| 100 | 🪴 | Cây con |
| 200 | 🌳 | Cây xanh |
| 400 | 🌲 | Cây trưởng thành |
| 700 | 🌴 | Cây cổ thụ |

---

## 2. Tech Stack & Kiến trúc

### Công nghệ sử dụng

| Tầng | Công nghệ | Lý do chọn |
|------|-----------|------------|
| UI | React 19 + Vite 6 | Nhanh, modern, hot reload tốt |
| Global State | Zustand 5 | Nhẹ, không boilerplate như Redux |
| Database | Firebase Firestore | Real-time, serverless, free tier đủ dùng |
| Authentication | Firebase Auth | Email/pass + Google Sign-In, tự hash password |
| Media Storage | Firebase Storage | Blaze plan — upload qua `uploadBytesResumable` SDK, hỗ trợ progress bar, Security Rules per-file |
| Deploy | Firebase Hosting | CDN toàn cầu, HTTPS tự động, custom domain miễn phí |
| Styling | CSS Modules | Scoped style, không cần Tailwind, tự build design system |
| Routing | React Router v7 | Standard cho React SPA |

### Cấu trúc dữ liệu Firestore

```
users/{uid}
  displayName, email, photoURL, coverURL,
  role: "student" | "teacher",
  grade, totalPoints, createdAt

posts/{postId}
  authorId, content, mediaUrl, mediaType,
  likeCount, commentCount, createdAt
  └── likes/{uid}          ← doc tồn tại = đã like
  └── (comments là collection riêng)

comments/{commentId}
  postId, authorId, content, mediaUrl, mediaType, createdAt

notifications/{uid}/items/{notifId}
  type: "like"|"comment", fromUid, fromName,
  fromPhotoURL, postId, postSnippet, read, createdAt

config/app
  teacherCode: "MGV-2526-..."    ← mã xác thực giáo viên
```

---

## 3. Danh sách tính năng (Use Cases) hiện tại

### Đã hoàn thành ✅

#### Auth (Xác thực)
- **Đăng ký tài khoản** — email + mật khẩu, tự tạo user document trong Firestore
- **Đăng nhập** — email/password
- **Google Sign-In** — tích hợp OAuth, tự tạo profile nếu chưa có
- **Quên mật khẩu** — gửi email reset qua Firebase Auth
- **Đăng xuất**
- **Route bảo vệ** — redirect về `/login` nếu chưa đăng nhập

#### Feed (Trang chủ)
- **Xem danh sách bài viết** — real-time với `onSnapshot`, mới nhất lên đầu
- **Đăng bài viết** — text + ảnh/video (upload lên Firebase Storage)
- **Like bài viết** — toggle like, cộng điểm `+2` cho tác giả
- **Xoá bài viết** — chỉ tác giả hoặc giáo viên
- **Mini leaderboard sidebar** — top 5 điểm cao nhất
- **Cách kiếm điểm sidebar** — hiển thị bảng quy đổi điểm

#### Bình luận
- **Xem bình luận** — mở rộng/thu gọn dưới mỗi post
- **Đăng bình luận** — text + ảnh/video, cộng điểm `+5`
- **Xoá bình luận** — tác giả hoặc giáo viên

#### Hồ sơ (Profile)
- **Xem hồ sơ cá nhân** — tại `/profile`
- **Xem hồ sơ người khác** — tại `/profile/:uid`
- **Chỉnh sửa hồ sơ** — tên hiển thị, lớp học, avatar, ảnh bìa
- **Tab bài viết** — xem toàn bộ bài đã đăng
- **Tab lịch sử điểm** — (dữ liệu mẫu, chờ tích hợp `pointHistory`)
- **Tab huy hiệu** — (dữ liệu mẫu tĩnh)
- **Thống kê** — tổng điểm, xếp hạng, số bài, lượt like
- **Danh hiệu cây** — hiển thị tier dựa trên điểm (🌰→🌴)

#### Bảng xếp hạng (Leaderboard)
- **Top 50 học sinh** — real-time `onSnapshot`, sắp xếp theo điểm
- **Podium top 3** — hình ảnh bục 🥇🥈🥉
- **Bảng đầy đủ** — progress bar tương đối, link đến profile
- **Lọc theo lớp/khối** — client-side filter
- **Tìm kiếm trong leaderboard** — client-side filter theo tên
- **Hạng cá nhân** — hiển thị trong hero section
- **Danh hiệu cây** — hiện tại tier dưới tên mỗi user

#### Tìm kiếm
- **SearchDropdown** — mở từ nút trên Navbar, debounce 300ms
- **Tìm đồng thời** — Promise.all: top 4 users + top 4 posts
- **Điều hướng** — click user → profile; Enter/Xem tất cả → `/search?q=...`
- **SearchPage** — trang kết quả đầy đủ, 2 tab (Học sinh / Bài viết)

#### Thông báo (Notifications)
- **Bell icon real-time** — badge số chưa đọc
- **Dropdown 30 thông báo gần nhất** — like, comment
- **Mark all read** — khi mở dropdown
- **Tự gửi thông báo** — khi ai đó like hoặc comment bài của bạn (không tự thông báo cho mình)

#### Phân quyền Giáo viên
- **Role system** — `student` / `teacher` trong Firestore
- **Teacher delete** — giáo viên xoá bất kỳ post/comment vi phạm
- **Firestore Rules** — bảo vệ server-side, `isTeacher()` dùng `get()` để check role

#### Bảo mật
- **Firestore Rules** — `totalPoints` chỉ cho phép increment đúng mức (+2, +5, +10, +20)
- **ErrorBoundary** — bắt lỗi React toàn cục, hiện thông báo thân thiện
- **File validation** — kiểm tra định dạng + dung lượng phía client trước khi upload

### Chưa làm / Backlog ⏳

| Tính năng | Ghi chú |
|-----------|---------|
| Show/Hide password toggle | Cần thêm vào LoginPage |
| Đăng ký tài khoản giáo viên | Teacher code + toggle UI (plan đã có trong `PLAN_teacher-auth.md`) |
| Google Sign-In → chọn role | Onboarding modal sau lần đầu đăng nhập Google |
| Chia sẻ bài viết | Web Share API + copy link |
| Facebook / Zalo Sign-In | Sau khi Google ổn định |
| `pointHistory` thực tế | Thay dữ liệu mẫu bằng collection thật |
| Huy hiệu thực tế | Tính toán dựa trên hành động thật |
| Trang Admin | Duyệt giáo viên, thống kê toàn trường |

---

## 4. Tiến độ dự án — Timeline từ đầu đến nay

```
Sprint 0 — Khởi tạo
├── Setup Vite + React 19 + CSS Modules
├── Design system: tokens.css, globals.css
├── Component primitives: Button, Input, Avatar, NavItem, Spinner
├── Firebase init (Auth + Firestore)
└── AppRouter, ProtectedRoute, Zustand stores

Sprint 1 — Core Auth & Feed
├── LoginPage (đăng nhập + đăng ký)
├── FeedPage với PostCard
├── PostModal (đăng bài)
├── Tích điểm cơ bản (+10 đăng bài, +5 comment, +2 like)
└── LeaderboardPage (cơ bản)

Sprint 2 — Profile & Polish
├── ProfilePage (tabs: posts, history, badges)
├── EditProfileModal
├── Fix layout avatar bị ảnh bìa đè
├── CommentSection với like/comment count đồng bộ
└── ForgotPassword flow

Sprint 3 — Media & Security
├── Thử Firebase Storage → phát hiện không có free tier trên Spark plan
├── Di chuyển tạm sang Cloudinary (unsigned XHR upload, không cần backend)
├── Avatar upload, Cover upload, Post media upload hoạt động
├── ErrorBoundary toàn cục
└── Firestore Security Rules (totalPoints lock, teacher delete)

Sprint 4 — Social Features
├── 2.1 Thông báo real-time (NotifBell + notification.service)
├── 2.2 Avatar → Link điều hướng profile người khác
├── 2.3 Search: SearchDropdown trên Navbar + SearchPage tại /search
├── 2.4 Teacher role: xoá post/comment vi phạm
└── Kindness Points title system (🌰 → 🌴)

Sprint 5 — Firebase Upgrade & Deploy Setup
├── Nâng cấp Firebase lên Blaze plan
├── Di chuyển Storage: Cloudinary → Firebase Storage (uploadBytesResumable)
├── Thêm storage.rules + cập nhật firebase.json
├── Cập nhật firebase.js: thêm storageBucket + export storage
├── Firebase Hosting cấu hình xong (.firebaserc, firebase.json)
└── Git init + .gitignore (bảo vệ .env, admin SDK key, design assets)

Sprint 6 — GitHub & CI/CD
├── Push toàn bộ project lên GitHub (87 files)
├── Fix bảo mật seed script: đọc admin key path + password từ env thay vì hardcode
├── Tạo .env.example — template cho thành viên mới clone repo
├── Tạo README.md — hướng dẫn cài đặt, git workflow, CI/CD cho toàn nhóm
├── Tạo .github/workflows/deploy.yml — GitHub Actions tự động deploy:
│   ├── Push lên master → deploy production (live channel)
│   └── Mở PR vào master → deploy preview URL để review
└── Xác nhận: chỉ cần 1 GitHub Secret (FIREBASE_SERVICE_ACCOUNT); VITE_* inline trong workflow
```

### Trạng thái hiện tại

| Giai đoạn | Trạng thái |
|-----------|-----------|
| Phase 1 — Core features | ✅ Hoàn thành |
| Phase 2 — Social features | ✅ 4/6 tính năng xong |
| Phase 3 — Deploy | ✅ CI/CD tự động qua GitHub Actions — production live tại `kindness-school.web.app` |

---

## 5. Kế hoạch Deploy

### Checklist trước khi deploy

**Kỹ thuật:**
- [x] `npm run build` sạch, không warning/error
- [ ] Google Sign-In hoạt động với domain thật (thêm vào Firebase Console → Authentication → Authorized domains)
- [x] Firebase Storage đã bật, `storage.rules` đã deploy
- [x] Firestore + Storage Rules deploy: `firebase deploy --only firestore,storage`
- [x] Tất cả env vars `VITE_FIREBASE_*` được set — inline trong GitHub Actions workflow
- [x] CI/CD tự động qua GitHub Actions (`.github/workflows/deploy.yml`)
- [ ] Test trên điện thoại Android/iOS 375px

**Nội dung:**
- [ ] Xoá seed data / dữ liệu test nếu có
- [ ] Tạo tài khoản giáo viên thật trước khi mở cho học sinh
- [ ] Đặt `teacherCode` trong Firestore `config/app`

### Quy trình deploy lên Firebase Hosting

**1. Cài Firebase CLI (một lần duy nhất):**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # chọn dist/ làm public folder, SPA: yes
```

**2. Mỗi lần deploy:**
```bash
npm run build
firebase deploy --only hosting
```

URL sau khi deploy: `https://[project-id].web.app`

### Tùy chọn domain

| Lựa chọn | Chi phí | Ghi chú |
|----------|---------|---------|
| `[project-id].web.app` | Miễn phí | Firebase Hosting mặc định, dùng ngay |
| `kindness.iec.edu.vn` | Miễn phí (nhờ IT trường) | CNAME trỏ về Firebase Hosting |
| `kindnessiec.site` | ~200k/năm | Mua domain thương mại |

---

## 6. Firebase Blaze Plan — Đã nâng cấp ✅

### Trạng thái

Dự án đã được nâng cấp lên **Firebase Blaze (pay-as-you-go)**. Tất cả dịch vụ Firebase hiện hoạt động trong cùng một nền tảng:

| Dịch vụ | Trạng thái | Ghi chú |
|---------|-----------|---------|
| Firebase Auth | ✅ Hoạt động | Email/pass + Google Sign-In |
| Firebase Firestore | ✅ Hoạt động | Database chính, real-time |
| Firebase Storage | ✅ Hoạt động | Lưu avatar, ảnh bìa, media bài viết |
| Firebase Hosting | ✅ Cấu hình xong | Sẵn sàng deploy |

### Ước tính chi phí thực tế

Với quy mô ~1.000 học sinh, ~500 bài viết/tháng:

| Dịch vụ | Ước tính/tháng | Chi phí |
|---------|---------------|---------|
| Firestore reads/writes | ~200.000 reads, ~50.000 writes | Miễn phí (trong free quota) |
| Storage | ~2 GB ảnh/video | Miễn phí (5 GB free) |
| Hosting | ~1 GB bandwidth | Miễn phí (10 GB free) |
| **Tổng** | | **~$0/tháng** |

> Blaze chỉ tính tiền khi vượt free quota. Với quy mô trường IEC, dự kiến nằm trong giới hạn miễn phí.

### Bước tiếp theo — Cloud Functions (tùy chọn tương lai)

Hiện tại điểm thưởng được cộng client-side (có thể bị can thiệp qua DevTools). Khi cần bảo mật cao hơn, có thể thêm Cloud Functions:

```
onPostCreated   → +10 điểm cho tác giả (server-side)
onCommentCreated → +5 điểm
onLikeAdded     → +2 điểm cho tác giả bài
```

Đây là nâng cấp bảo mật, không phải yêu cầu bắt buộc để launch.

---

## 7. CI/CD — GitHub Actions

### Quy trình tự động

```
Developer push lên branch feature/...
  → Mở Pull Request vào master
    → GitHub Actions chạy: npm ci → npm run build → deploy preview URL
      → Review + approve
        → Merge vào master
          → GitHub Actions tự deploy production: kindness-school.web.app
```

### Cấu hình (`.github/workflows/deploy.yml`)

| Sự kiện | Kết quả |
|---------|---------|
| Push lên `master` | Deploy thẳng production (live channel) |
| Mở PR vào `master` | Deploy preview URL tạm thời để review |

### Secret duy nhất cần thiết

Chỉ cần 1 GitHub Secret tại `repo → Settings → Secrets and variables → Actions`:

| Secret | Nội dung |
|--------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | Toàn bộ nội dung file JSON từ Firebase Console → Project Settings → Service accounts → Generate new private key |

> `VITE_FIREBASE_*` không phải secret thật — được nhúng thẳng vào JS bundle, ai vào website cũng thấy. Security thực sự đến từ Firestore/Storage Rules. Vì vậy các giá trị này được inline trong workflow file, không cần lưu thành GitHub Secret.

### Cập nhật Service Account

Nếu cần đổi quyền quản trị Firebase: chỉ cần cập nhật giá trị `FIREBASE_SERVICE_ACCOUNT` trong GitHub Secrets — pipeline tự dùng key mới cho lần deploy tiếp theo.

---

## 8. Thông tin kỹ thuật cho thành viên mới

### Chạy project local

```bash
git clone [repo-url]
cd Web-project
npm install

# Tạo file .env từ template (KHÔNG commit .env lên git)
cp .env.example .env
# Mở .env và điền các giá trị VITE_FIREBASE_* từ Firebase Console

npm run dev   # → http://localhost:5173
```

**Deploy lên Firebase Hosting:**
```bash
npm run build
firebase deploy          # deploy hosting + firestore rules + storage rules
firebase deploy --only hosting   # chỉ deploy app
```

### Cấu trúc thư mục chính

```
src/
├── components/     # UI dùng chung (Avatar, Button, PostCard, Navbar...)
├── features/       # Tính năng theo trang (feed, auth, profile, ranking, search, notifications)
├── services/       # Giao tiếp với Firebase (Auth, Firestore, Storage)
├── store/          # Zustand stores (useAuthStore)
├── mvc/
│   ├── controllers/   # Custom hooks xử lý logic (useFeedController, usePointsController)
│   └── views/         # Layout wrappers (MainLayout, AuthLayout)
├── routes/         # AppRouter, ProtectedRoute
├── lib/            # utils.js (getInitials, formatRelativeTime, getKindnessTitle...)
└── styles/         # tokens.css (CSS variables toàn dự án)
```

### Quy tắc code quan trọng

- **CSS Modules** — mỗi component có file `.module.css` riêng, dùng CSS vars từ `tokens.css`
- **Không hardcode màu** — luôn dùng `var(--color-*)`, `var(--r-*)`, `var(--text-*)`
- **Không comment thừa** — chỉ comment khi lý do không tự hiển nhiên từ code
- **Import order**: React/lib → store/services → components → CSS
- **Mobile-first**: viết styles 375px trước, mở rộng bằng `min-width` media query

---

*File được tạo 2026-04-28, cập nhật lần cuối 2026-04-29 (Sprint 6 — GitHub + CI/CD GitHub Actions).*
