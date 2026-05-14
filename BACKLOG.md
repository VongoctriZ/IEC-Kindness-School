# IEC-KindnessSchool — Feature Backlog

> Cập nhật: 2026-05-14
> Dùng file này để track chi tiết từng tính năng sắp triển khai.
> Khi hoàn thành một task, đánh dấu checkbox và ghi ngày vào cột "Done".

---

## Trạng thái ký hiệu

| Ký hiệu | Nghĩa |
|---------|-------|
| 🔲 | Chưa bắt đầu |
| 🔄 | Đang làm |
| ✅ | Hoàn thành |
| ⏸ | Tạm hoãn |

---

## P0 — Cần thiết ngay

### 2.5 Chia sẻ bài viết
**Mục tiêu**: Cho phép người dùng chia sẻ bài viết ra ngoài hoặc copy link.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 2.5.1 | Nút "Chia sẻ" trên PostCard → dùng **Web Share API** (native share sheet trên mobile) | 🔲 | — |
| 2.5.2 | Fallback khi trình duyệt không hỗ trợ Web Share API → copy link vào clipboard | 🔲 | — |
| 2.5.3 | Toast thông báo "Đã copy link!" sau khi copy | 🔲 | — |
| 2.5.4 | Route `/post/:postId` để link chia sẻ có thể mở trực tiếp bài viết | 🔲 | — |

**Notes**:
- `navigator.share({ title, text, url })` — hoạt động tốt trên Android/iOS
- URL dạng `https://kindness-school.web.app/post/abc123`
- Fallback: `navigator.clipboard.writeText(url)`

---

### 3.1 Thông báo real-time (Bell icon)
**Mục tiêu**: User nhận thông báo khi có like/comment mới trên bài của mình.

> Collection `notifications/{uid}/items/{notifId}` đã có trong Firestore và đang được ghi
> khi có like/comment. Chỉ cần build UI.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 3.1.1 | Bell icon trên Navbar với badge số lượng chưa đọc | 🔲 | — |
| 3.1.2 | Dropdown/panel hiển thị 20 thông báo gần nhất | 🔲 | — |
| 3.1.3 | Click thông báo → navigate đến bài viết tương ứng | 🔲 | — |
| 3.1.4 | Mark as read khi mở dropdown (cập nhật field `read: true`) | 🔲 | — |
| 3.1.5 | "Đánh dấu tất cả đã đọc" | 🔲 | — |

**Notes**:
- `onSnapshot` trên `notifications/{uid}/items` để real-time
- Query: `where('read', '==', false)` để đếm badge
- `createNotification()` trong `notification.service.js` đã có, đang được gọi từ `toggleLike` và `addComment`

---

## P1 — Hoàn thiện trải nghiệm

### 3.2 Chỉnh sửa bài viết
**Mục tiêu**: Author có thể edit nội dung bài sau khi đăng.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 3.2.1 | Thêm option "Chỉnh sửa" vào menu "..." trên PostCard (bên cạnh Xoá) | 🔲 | — |
| 3.2.2 | Modal/inline editor hiện nội dung cũ, cho phép sửa text | 🔲 | — |
| 3.2.3 | `updatePost(postId, { content })` trong `post.service.js` | 🔲 | — |
| 3.2.4 | Hiển thị tag "đã chỉnh sửa" trên bài sau khi edit | 🔲 | — |
| 3.2.5 | Firestore Rules: chỉ author mới được update field `content` | 🔲 | — |

---

### 3.3 Comment nested (Reply)
**Mục tiêu**: Người dùng có thể reply vào comment cụ thể (1 cấp).

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 3.3.1 | Nút "Trả lời" trên mỗi comment | 🔲 | — |
| 3.3.2 | Reply hiện thụt lề dưới comment gốc | 🔲 | — |
| 3.3.3 | Schema: thêm field `parentId` vào comment document | 🔲 | — |
| 3.3.4 | `@mention` tên người được reply (optional) | 🔲 | — |

---

### 3.4 Tìm kiếm nâng cao
**Mục tiêu**: Filter kết quả search theo nhiều tiêu chí.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 3.4.1 | Filter user theo role (Học sinh / Giáo viên) | 🔲 | — |
| 3.4.2 | Filter user theo lớp học (10A, 11B, ...) | 🔲 | — |
| 3.4.3 | Filter bài viết theo khoảng thời gian (7 ngày, 30 ngày) | 🔲 | — |
| 3.4.4 | Sort kết quả (mới nhất / nhiều like nhất) | 🔲 | — |

---

## P2 — Gamification nâng cao

### 4.1 Streak điểm danh
**Mục tiêu**: Cộng điểm khi đăng nhập / đăng bài liên tiếp nhiều ngày.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 4.1.1 | Lưu `lastActiveDate` vào user document | 🔲 | — |
| 4.1.2 | Tính streak khi user đăng nhập: nếu hôm nay chưa check-in, tăng streak +1 | 🔲 | — |
| 4.1.3 | Hiển thị streak badge trên profile (🔥 3 ngày liên tiếp) | 🔲 | — |
| 4.1.4 | Thưởng +5 điểm mỗi ngày check-in, +20 điểm khi streak ≥ 7 | 🔲 | — |

---

### 4.2 Huy hiệu tự động mở khoá
**Mục tiêu**: Huy hiệu trên trang profile tự unlock dựa trên thống kê thật.

> Hiện tại badge data đang hardcode trong `ProfilePage.jsx`.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 4.2.1 | Định nghĩa điều kiện mở khoá cho từng huy hiệu trong `constants.js` | 🔲 | — |
| 4.2.2 | Hàm `checkBadges(profile, posts)` tính xem badge nào đã đạt | 🔲 | — |
| 4.2.3 | Hiển thị đúng locked/unlocked dựa trên data thật | 🔲 | — |
| 4.2.4 | Notification khi mở khoá huy hiệu mới | 🔲 | — |

---

### 4.3 Leaderboard theo tuần / tháng
**Mục tiêu**: Bảng xếp hạng lọc theo khoảng thời gian thay vì chỉ all-time.

| # | Sub-task | Trạng thái | Done |
|---|----------|-----------|------|
| 4.3.1 | Tab "Tuần này" / "Tháng này" / "Tất cả" trên LeaderboardPage | 🔲 | — |
| 4.3.2 | Lưu `weeklyPoints`, `monthlyPoints` (reset định kỳ bằng Cloud Function hoặc cron job) | 🔲 | — |
| 4.3.3 | Cân nhắc dùng Cloud Functions để reset tự động | 🔲 | — |

---

## Bugs / Tech Debt đã biết

| # | Vấn đề | Ưu tiên |
|---|--------|---------|
| B1 | `post.authorRole` là snapshot — không tự update khi role thay đổi (đã fix cho owner view, chưa fix cho người khác xem) | Medium |
| B2 | `approveTeacher()` chưa batch-update `authorRole` trong post documents | Medium |
| B3 | Leaderboard all-time dùng `limit(50)` — có thể miss user nếu > 50 người | Low |
| B4 | Không có rate limiting cho like/comment (người dùng có thể spam điểm) | Low |

---

## Ghi chú kỹ thuật

- **Notification service**: `src/services/notification.service.js` — `createNotification()` đã có
- **Firestore paths**: `notifications/{uid}/items/{notifId}` với fields `type`, `fromUid`, `fromName`, `postId`, `read`, `createdAt`
- **Post service**: `src/services/post.service.js` — thêm `updatePost()` khi cần
- **Web Share API**: kiểm tra `navigator.share !== undefined` trước khi gọi
