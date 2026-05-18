# KindnessSchool — Báo cáo tiến độ dự án

> Cập nhật: 2026-05-16 · Phiên bản 2.0

---

## 1. Tổng quan ý tưởng & Concept

### Bối cảnh & Vấn đề

Học sinh cần một kênh để chia sẻ hành động tốt, tham gia tích cực vào hoạt động cộng đồng. Các mạng xã hội thông thường (Facebook, TikTok) không phù hợp với môi trường học đường và thiếu cơ chế ghi nhận cụ thể.

### Giải pháp: Mạng xã hội học đường tích cực

**KindnessSchool** là nền tảng mạng xã hội học đường dành riêng cho học sinh và giáo viên, kết hợp cơ chế **gamification** (trò chơi hóa) để khuyến khích hành động tốt.

Triết lý cốt lõi:
> *"Mỗi hành động tốt đều được ghi nhận — không bị lãng quên."*

Mỗi khi học sinh đăng bài, bình luận hay nhận like, họ nhận được **Kindness Points (KP)** — điểm thưởng hiển thị công khai trên bảng xếp hạng toàn trường.

### Concept thiết kế

| Yếu tố | Mô tả |
|--------|-------|
| Phong cách | Tươi sáng, vui nhộn, phù hợp học sinh THPT |
| Màu chủ đạo | Xanh lá (`#22C55E`) — thân thiện, tự nhiên, tích cực |
| Màu nhấn | Indigo (`#6B6FD8`) — buttons, active states |
| Font | Inter / Segoe UI |
| Ngôn ngữ | Tiếng Việt 100% |

### Hệ thống danh hiệu Kindness Points (Plant Growth)

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

| Tầng | Công nghệ | Lý do chọn |
|------|-----------|------------|
| UI | React 19 + Vite 6 | Nhanh, modern, hot reload tốt |
| Global State | Zustand 5 | Nhẹ, không boilerplate |
| Database | Firebase Firestore | Real-time, serverless |
| Authentication | Firebase Auth | Email/pass + Google Sign-In |
| Media Storage | Firebase Storage | Blaze plan, `uploadBytesResumable`, progress bar |
| Deploy | Firebase Hosting | CDN toàn cầu, HTTPS, CI/CD qua GitHub Actions |
| Styling | CSS Modules | Scoped style, design system tự build |
| Routing | React Router v7 | Standard SPA |

### Cấu trúc dữ liệu Firestore (đã cập nhật)

```
users/{uid}
  displayName, email, photoURL, coverURL,
  role: "student" | "teacher" | "pending_teacher" | "admin",
  grade, totalPoints, createdAt

posts/{postId}
  authorId, authorName, authorRole, authorGrade, authorPhotoURL,
  content, mediaUrl, mediaType,
  likeCount, commentCount, editedAt?, createdAt
  └── likes/{uid}          ← doc tồn tại = đã like

comments/{commentId}
  postId, parentId?,         ← parentId cho reply (1 cấp)
  authorId, authorName, authorRole, authorPhotoURL,
  content, mediaUrl, mediaType,
  likeCount, createdAt       ← likeCount cho comment like
  └── likes/{uid}

notifications/{uid}/items/{notifId}
  type: "like"|"comment", fromUid, fromName,
  fromPhotoURL, postId, postSnippet, read, createdAt

config/app
  teacherCode: "MGV-2526-..."
```

---

## 3. Tính năng hiện tại — Trạng thái đầy đủ

### ✅ Đã hoàn thành & production-ready

#### Auth
- Đăng ký / đăng nhập email + password
- Google Sign-In với onboarding chọn role
- Quên mật khẩu (email reset)
- Show/hide password toggle
- Route bảo vệ — redirect `/login` nếu chưa đăng nhập
- Luồng giáo viên chờ duyệt (`pending_teacher` → `/pending`)

#### Feed & Bài viết
- Xem feed real-time (`onSnapshot`), mới nhất lên đầu
- Đăng bài text + ảnh/video (Firebase Storage, progress bar)
- **Chỉnh sửa bài** — menu "···", modal editor, thay đổi/xoá media, tag "đã chỉnh sửa"
- Like bài — toggle, cộng `+2` KP cho tác giả, optimistic update
- Xoá bài — author / giáo viên / admin
- **Chia sẻ bài** — Web Share API (native sheet mobile) hoặc copy link + toast "✅ Đã copy link!"
- **Route `/post/:postId`** — mở bài trực tiếp từ link chia sẻ, real-time

#### Bình luận (đã thiết kế lại)
- Xem / đăng bình luận (text), cộng `+5` KP
- **Reply 1 cấp** — nút "Trả lời", @mention tự điền, thụt lề 36px
- **Like comment** — toggle, subcollection `likes/{uid}`, optimistic update
- **Layout kiểu Facebook** — bubble co theo nội dung, footer (timestamp · Trả lời · ❤️) nằm ngoài bubble
- Xoá bình luận — author hoặc giáo viên
- Phân trang "Xem thêm" (5 comment/trang)
- **Rate limiting** — cooldown 8 giây giữa các lần gửi, countdown hiển thị trong input

#### Hồ sơ (Profile)
- Xem hồ sơ cá nhân (`/profile`) và người khác (`/profile/:uid`)
- Chỉnh sửa: tên, lớp học, avatar, ảnh bìa
- Tab bài viết, lịch sử điểm (placeholder), huy hiệu (placeholder)
- Thống kê: tổng điểm, xếp hạng, danh hiệu cây

#### Bảng xếp hạng (Leaderboard)
- Top 200 học sinh real-time (`onSnapshot`)
- Podium top 3 🥇🥈🥉
- Lọc theo khối lớp, tìm kiếm theo tên
- **Rank chính xác** — dùng count query thay vì giới hạn 50

#### Tìm kiếm
- SearchDropdown Navbar — debounce 300ms, top 4 users + top 4 posts
- SearchPage `/search`:
  - Tab **Người dùng** — filter vai trò (Học sinh / Giáo viên), tìm theo tên/lớp
  - Tab **Bài viết** — filter thời gian (7 ngày / 30 ngày), sort (Mới nhất / Nhiều like)
  - Click bài viết → mở PostDetailPage

#### Thông báo
- Bell icon real-time — badge đếm chưa đọc
- Dropdown 30 thông báo gần nhất
- **Click thông báo → nhảy thẳng đến bài viết** (`/post/:postId`)
- Mark as read khi mở dropdown / "Đánh dấu đọc tất"

#### Phân quyền & Admin
- Role: `student` / `teacher` / `pending_teacher` / `admin`
- Admin page: duyệt/từ chối giáo viên chờ
- `approveTeacher()` **batch-update `authorRole`** trong toàn bộ posts ngay khi duyệt
- Giáo viên xoá post/comment vi phạm

#### Bảo mật & Hạ tầng
- Firestore Rules — `totalPoints` chỉ cho phép increment đúng mức
- Storage Rules — chỉ owner ghi vào path của mình
- File validation — type + size phía client
- ErrorBoundary — bắt lỗi React toàn cục
- CI/CD GitHub Actions — push master → build → deploy production tự động

---

## 4. Timeline

```
Sprint 1-6 (đến 2026-04-29)
  Auth, Feed, Profile, Leaderboard, Notifications, Search cơ bản,
  Media Upload, Firestore/Storage Rules, CI/CD, GitHub

Sprint 7 — P0/P1 Features (2026-05-16)
  ├── Chia sẻ bài viết (Web Share API + clipboard + toast)
  ├── Route /post/:postId + PostDetailPage
  ├── Fix notification link → /post/:postId
  ├── Chỉnh sửa bài (menu···, modal, edit media, tag "đã chỉnh sửa")
  ├── Reply comment (parentId, thụt lề, @mention)
  └── Advanced search (filter role, time, sort)

Sprint 8 — UX & Bug Fixes (2026-05-16)
  ├── Redesign comment layout kiểu Facebook
  ├── Like comment (subcollection likes, optimistic update)
  ├── Fix reply layout (commentBlock ngoài flex row)
  ├── [B1+B2] approveTeacher batch-update authorRole posts
  ├── [B3] getUserRank count query, LEADERBOARD_SIZE → 200
  └── [B4] Comment rate limiting cooldown 8s
```

---

## 5. Đánh giá sẵn sàng — Ship hay Pilot trước?

### Tổng kết tình trạng hiện tại

| Hạng mục | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Core features | ✅ Đầy đủ | Auth, Feed, Like, Comment, Profile, Leaderboard |
| Social features | ✅ Đầy đủ | Share, Edit, Reply, Search nâng cao, Notification |
| Mobile-first | ✅ | Thiết kế 375px trước |
| CI/CD | ✅ | Tự động build + deploy qua GitHub Actions |
| Known bugs | ✅ Đã fix | B1–B4 đã resolve |
| Bảo mật | ⚠️ Cơ bản | Firestore Rules đủ dùng, điểm cộng client-side |
| Content moderation | ⚠️ Thủ công | Giáo viên xoá thủ công, chưa có filter tự động |
| Email verification | ❌ Chưa có | Ai cũng có thể đăng ký bằng email bất kỳ |
| Badges thực tế | ❌ Chưa có | Đang hardcode, P2 backlog |
| Push notification | ❌ Chưa có | Chỉ in-app bell icon |

---

### Khuyến nghị: Pilot 2 tuần trước khi ship toàn trường

**Lý do không nên ship thẳng ngay:**

1. **Email không xác thực** — học sinh có thể đăng ký bằng email giả hoặc email của người khác. Cần ít nhất 1 tuần kiểm soát danh sách tài khoản trong môi trường nhỏ trước.
2. **Nội dung chưa được kiểm duyệt tự động** — Môi trường học đường cần giáo viên làm quen với việc xoá bài vi phạm trước khi có 500 học sinh đồng thời.
3. **Điểm cộng client-side** — Vẫn có thể bị can thiệp qua DevTools. Chưa đủ nghiêm trọng để block launch, nhưng nên quan sát ở quy mô nhỏ trước.
4. **Chưa test thực tế trên thiết bị học sinh** — Các thiết bị Android giá rẻ, iOS cũ, màn hình nhỏ có thể có render khác.

---

### Kế hoạch 3 giai đoạn

#### Giai đoạn 1 — Pilot nội bộ (Tuần 1–2)
> **Quy mô:** 1 lớp thí điểm (~35 học sinh) + 2–3 giáo viên phụ trách

**Checklist trước khi mở:**
- [ ] Tạo tài khoản admin (1 người)
- [ ] Tạo tài khoản giáo viên thật (approve qua AdminPage)
- [ ] Đặt `teacherCode` trong Firestore `config/app`
- [ ] Xoá toàn bộ dữ liệu test (post, comment, user seed)
- [ ] Test Google Sign-In với domain production (`kindness-school.web.app`)
- [ ] Test upload ảnh/video trên điện thoại Android + iOS
- [ ] Thông báo học sinh về quy tắc sử dụng

**Thu thập trong tuần pilot:**
- Bài viết spam/không phù hợp xuất hiện không?
- Điểm bất thường (ai đó farm comment liên tục)?
- Lỗi UI trên thiết bị thực tế?
- Tốc độ load trên mạng trường (WiFi yếu)?

#### Giai đoạn 2 — Beta toàn trường (Tuần 3–4)
> **Quy mô:** Toàn bộ người dùng

Mở rộng sau khi pilot ổn định. Giáo viên đã quen với việc kiểm duyệt nội dung.

**Nâng cấp ưu tiên sau pilot:**
- Xác thực email khi đăng ký (Firebase Auth email verification — 1 ngày làm)
- Giới hạn đăng ký chỉ email trường (VD: `@school.edu.vn`) nếu có domain riêng
- Thông báo push (Firebase Cloud Messaging) — tùy chọn

#### Giai đoạn 3 — Full Launch
> Production ổn định, bàn giao cho trường tự vận hành

---

### Nếu bắt buộc phải ship thẳng

Nếu không thể pilot trước (deadline từ nhà trường), checklist tối thiểu:

```
✅ Đã có sẵn — không cần làm gì thêm:
   - Core features hoạt động đầy đủ
   - Mobile-first layout
   - CI/CD tự động
   - Bug B1-B4 đã fix

⚠️ Phải làm trước khi mở (1–2 giờ):
   1. Xoá data test trong Firestore
   2. Tạo tài khoản admin + giáo viên thật
   3. Test Google Sign-In trên domain production
   4. Dặn ít nhất 1 giáo viên online kiểm duyệt nội dung ngày đầu

📋 Chấp nhận rủi ro có thể xử lý sau:
   - Email giả → xoá tài khoản vi phạm thủ công qua Firebase Console
   - Điểm spam → reset totalPoints qua Firebase Console nếu phát hiện
   - Bugs nhỏ → fix và deploy trong ngày (CI/CD sẵn sàng)
```

---

## 6. Firebase & Hạ tầng

### Ước tính chi phí

Với quy mô ~1.000 học sinh, ~500 bài viết/tháng:

| Dịch vụ | Ước tính/tháng | Chi phí |
|---------|---------------|---------|
| Firestore reads/writes | ~300.000 reads, ~80.000 writes | Miễn phí (quota: 50k reads/ngày) |
| Storage | ~5 GB ảnh/video tích lũy | Miễn phí (5 GB free) |
| Hosting bandwidth | ~2 GB | Miễn phí (10 GB free) |
| **Tổng** | | **~$0/tháng** |

> ⚠️ Nếu học sinh upload nhiều video: Storage có thể vượt 5GB sau 2–3 tháng (~$0.026/GB thêm). Khuyến nghị giới hạn video 30 giây hoặc chỉ cho phép ảnh trong giai đoạn đầu.

### CI/CD Pipeline

```
Push lên master
  → GitHub Actions: npm ci → npm run build → firebase deploy
    → Production live tại kindness-school.web.app
      (tự động, không cần thao tác thủ công)
```

---

## 7. Backlog còn lại (P2)

| Tính năng | Mức độ | Ghi chú |
|-----------|--------|---------|
| Xác thực email khi đăng ký | Cao | Ngăn email giả — 1 ngày làm |
| Huy hiệu tự động (dựa trên data thật) | Trung bình | Cần `pointHistory` collection |
| Streak điểm danh | Thấp | +5 KP/ngày login |
| Leaderboard theo tuần/tháng | Thấp | Cần Cloud Functions reset định kỳ |
| Push notification | Thấp | Firebase Cloud Messaging |
| Điểm thưởng server-side | Thấp | Cloud Functions — chống hack DevTools |
| Giới hạn đăng ký theo email domain | Trung bình | Nếu trường có `@iec.edu.vn` |

---

## 8. Thông tin cho developer tiếp theo

### Chạy local

```bash
git clone https://github.com/VongoctriZ/KindnessSchool
cd Web-project
npm install
cp .env.example .env   # điền VITE_FIREBASE_* từ Firebase Console
npm run dev            # http://localhost:5173
```

### Cấu trúc thư mục

```
src/
├── components/     # Button, Avatar, PostCard, Navbar, Modal, CommentSection...
├── features/       # auth, feed, profile, ranking, search, notifications, post, admin
├── services/       # firebase.js, auth/post/user/storage/notification/search.service.js
├── store/          # useAuthStore, usePostStore, usePointStore (Zustand)
├── mvc/
│   ├── controllers/   # useFeedController, usePointsController
│   └── views/         # MainLayout, AuthLayout
├── routes/         # AppRouter.jsx, ProtectedRoute.jsx
├── lib/            # constants.js, utils.js
└── styles/         # tokens.css, globals.css, animations.css
```

### Quy tắc code

- **CSS Modules** — dùng CSS vars từ `tokens.css`, không hardcode màu
- **Mobile-first** — 375px trước, `min-width` media query để mở rộng
- **Không comment thừa** — chỉ khi WHY không tự hiển nhiên
- **Import order**: React/lib → store/services → components → CSS

---

*v1.0: 2026-04-28 — Sprint 6 (GitHub + CI/CD)*
*v2.0: 2026-05-16 — Sprint 7+8 (P0/P1 features, comment redesign, bug fixes B1–B4)*
