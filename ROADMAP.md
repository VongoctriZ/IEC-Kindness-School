# IEC-KindnessSchool — Roadmap phát triển

> Cập nhật lần cuối: 2026-04-29 (sprint 6)

---

## Giai đoạn 1 — Hoàn thiện core `trước khi deploy` (tuần 1–2)

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 1.1 | Google Sign-In hoạt động đầy đủ | ✅ Code xong | Cần bật trong Firebase Console |
| 1.2 | Quên mật khẩu (reset qua email) | ✅ Xong | `sendPasswordResetEmail` Firebase |
| 1.3 | Chỉnh sửa hồ sơ (tên, lớp, avatar) | ✅ Xong | `EditProfileModal` + Firebase Storage upload |
| 1.4 | Upload ảnh bìa profile | ✅ Xong | `uploadCover()` → `coverURL` trong Firestore (Firebase Storage CDN) |
| 1.5 | Bảo mật Firestore (lock totalPoints) | ✅ Xong | Rules giới hạn increment theo mức +2/+5/+10/+20; teacher delete mọi post/comment |
| 1.6 | ErrorBoundary toàn cục | ✅ Xong | `ErrorBoundary` wrap App ở `main.jsx` |

---

## Giai đoạn 2 — Tính năng xã hội (tuần 3–7) `sau khi có user thật`

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 2.1 | Thông báo real-time | ✅ Xong | Bell icon Navbar, dropdown 30 notif, mark-all-read; trigger khi like/comment |
| 2.2 | Xem profile người khác | ✅ Xong | Avatar là Link, Leaderboard row là Link, route `/profile/:uid` |
| 2.3 | Tìm kiếm bài viết / user | ✅ Xong | `SearchPage` tại `/search`; client-side filter, debounce 350ms |
| 2.4 | Phân quyền Giáo viên | ✅ Xong | Teacher xoá comment/post qua Firestore Rules + nút 🗑 trong UI |
| 2.5 | Chia sẻ bài viết | ⏳ Chưa bắt đầu | Web Share API + copy link |
| 2.6 | Facebook / Zalo Sign-In | ⏳ Chưa bắt đầu | Sau Google ổn định |

---

## Giai đoạn 3 — Deploy production (tuần 8+)

### Checklist trước khi deploy

- [x] `npm run build` sạch, không lỗi
- [ ] Google Sign-In hoạt động với domain thật (thêm vào Firebase Console → Authentication → Authorized domains)
- [x] Firebase Storage đã bật, `storage.rules` đã deploy
- [x] `VITE_FIREBASE_STORAGE_BUCKET` set đúng trong môi trường hosting (inline trong workflow)
- [x] Firestore Rules đã deploy (`firebase deploy --only firestore,storage`)
- [x] Tất cả env vars `VITE_FIREBASE_*` được set trên hosting — inline trong `.github/workflows/deploy.yml`
- [x] GitHub Actions CI/CD cấu hình xong — auto deploy khi push lên `master`
- [ ] Lighthouse Performance > 80
- [ ] Test trên điện thoại Android 375px (mobile-first)
- [ ] Thử tải đồng thời ≥ 10 user

### Lệnh deploy

```bash
npm run build
firebase deploy --only hosting      # → kindness-school.web.app
```

### Domain cho sinh viên

| Lựa chọn | Chi phí | Cách làm |
|---|---|---|
| `kindness-school.web.app` | Miễn phí | Firebase Hosting mặc định |
| `kindness.iec.edu.vn` | Miễn phí (nhờ IT trường) | CNAME trỏ về Firebase, thêm custom domain trong Firebase Console |
| `kindnessiec.site` | ~200k/năm | Mua domain, add vào Firebase Hosting |

---

## Ước tính timeline

```
Tuần 1–2  ── Giai đoạn 1: Google login, reset pass, edit profile, bảo mật
Tuần 3    ── Test nội bộ 5–10 người, fix bug thực tế
Tuần 4    ── Deploy Firebase Hosting, thử nghiệm lớp đầu tiên
Tuần 5–7  ── Giai đoạn 2: notifications, search, phân quyền GV
Tuần 8    ── Mở rộng toàn trường + domain riêng
```

---

## Ghi chú kỹ thuật

- **Password**: Firebase Authentication tự hash — không cần làm gì thêm
- **Race condition signup**: Đã fix bằng `subscribeToUserProfile` (onSnapshot)
- **Comment count**: `commentCount` trên post document tăng qua `increment()` khi có bình luận thật; seed data có thể lệch — chấp nhận được
- **Like count**: Tương tự comment count, seed data không đảm bảo chính xác
- **Media storage**: Dùng **Firebase Storage** (Blaze plan). Upload qua `uploadBytesResumable` SDK, hỗ trợ progress bar. File lưu theo path `avatars/{uid}/avatar`, `covers/{uid}/cover`, `posts/{uid}/{timestamp}`
- **Firebase plan**: Đã nâng cấp lên **Blaze (pay-as-you-go)** — mở khoá Storage + Hosting. Ước tính chi phí ~$0/tháng với quy mô trường IEC
- **Deploy**: Firebase Hosting đã cấu hình (`firebase.json` + `.firebaserc`). Lệnh: `npm run build && firebase deploy`
- **Git**: Đã khởi tạo repository, `.gitignore` bảo vệ `.env`, admin SDK key, và thư mục design/screenshots
