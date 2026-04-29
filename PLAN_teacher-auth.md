# Plan: Teacher Auth, Password Toggle & Google Role Assignment

> Tạo ngày: 2026-04-27

---

## Tóm tắt vấn đề

1. **Show/Hide password** — LoginPage thiếu toggle ẩn/hiện mật khẩu
2. **Teacher registration** — Chưa có luồng đăng ký giáo viên, cần chống học sinh giả mạo
3. **Google Sign-In + role** — Sau đăng nhập Google không biết user là GV hay HS

---

## Vấn đề 1 — Show/Hide Password

**Scope thay đổi:**
- `src/components/Input/Input.jsx` — thêm hỗ trợ slot icon bên phải dạng button
- `src/features/auth/LoginPage.jsx` — thêm state `showPass` / `showRPass`, truyền prop `type` động

**Logic:**
```jsx
const [showPass, setShowPass] = useState(false)

<Input
  label="Mật khẩu"
  type={showPass ? 'text' : 'password'}
  icon={
    <button type="button" onClick={() => setShowPass(v => !v)}>
      {showPass ? '🙈' : '👁'}
    </button>
  }
/>
```

**Áp dụng cho:** field password ở tab Đăng nhập + field password ở tab Đăng ký.

---

## Vấn đề 2 — Teacher Registration & Anti-impersonation

### Phân tích lựa chọn

| | Option | Độ phức tạp | Bảo mật | Phù hợp |
|---|---|---|---|---|
| A | Admin đổi role thủ công trên Firebase Console | Thấp | Cao | < 5 GV |
| **B** | **Mã xác thực giáo viên (Teacher Code)** | **Trung bình** | **Trung bình-cao** | **MVP — đề xuất** |
| C | Approval flow + trang Admin riêng | Cao | Cao nhất | Scale lớn |

### Chọn: Option B — Teacher Code

**Cơ chế hoạt động:**

1. Form đăng ký có toggle **Học sinh / Giáo viên**
2. Nếu chọn Giáo viên → hiện thêm field **Mã xác thực**
3. Khi submit: fetch document `config/app` trong Firestore, so sánh với field `teacherCode`
4. Khớp → tạo tài khoản với `role: 'teacher'`
5. Sai → hiển thị lỗi, không tạo tài khoản

**Cấu trúc Firestore:**
```
config/app
  teacherCode: "MGV-2025-IEC"    ← Admin đặt, đổi định kỳ
```

**Firestore Rule cho config:**
```js
match /config/{doc} {
  allow read:  if request.auth != null;   // cần đọc để verify
  allow write: if false;                  // chỉ Firebase Console mới sửa được
}
```

**Admin quản lý mã:**
- Vào Firebase Console → Firestore → collection `config` → document `app`
- Sửa field `teacherCode` khi cần đổi mã (đầu mỗi học kỳ)
- Không cần trang admin riêng

**Lưu ý bảo mật (Spark plan — không có Cloud Functions):**
- Mã được đọc client-side → có thể thấy qua DevTools nếu biết cách
- Giảm thiểu rủi ro: mã dài 10+ ký tự, chứa số + chữ hoa + ký tự đặc biệt
- Chỉ truyền mã qua kênh nội bộ (email BGH, họp giáo viên)
- Đổi mã sau mỗi đợt đăng ký hàng loạt

**Luồng đăng ký giáo viên:**
```
Chọn "Giáo viên"
  → Nhập: Họ tên, Email, Mật khẩu, Mã xác thực
  → Client fetch config/app.teacherCode
  → So sánh:
      Đúng  → signUp() với { role: 'teacher', grade: '' }
      Sai   → "Mã xác thực không đúng. Liên hệ BGH để lấy mã."
```

**Scope thay đổi:**
- `src/features/auth/LoginPage.jsx` — thêm role toggle + conditional field
- `src/services/user.service.js` — thêm `getTeacherCode()` (đọc `config/app`)
- `src/mvc/controllers/useAuthController.js` — validate teacher code trước khi gọi `register()`
- Firestore: tạo document `config/app` thủ công với field `teacherCode`

---

## Vấn đề 3 — Google Sign-In + Role Assignment

### Vấn đề

`signInWithGoogle()` hiện tại luôn tạo user với `role: 'student'`. Không có cách phân biệt GV/HS.

### Giải pháp: Onboarding Modal sau lần Google đăng nhập đầu tiên

**Logic:**
- Trong `auth.service.js > signInWithGoogle()`: kiểm tra Firestore doc có tồn tại chưa
- Nếu **doc chưa có** (new user) → KHÔNG tạo doc ngay, set flag `needsOnboarding: true` vào `useAuthStore`
- Nếu **doc đã có** (returning user) → bỏ qua, role đã set từ trước

**Onboarding Modal** hiện khi `needsOnboarding === true`:

```
┌─────────────────────────────────────────┐
│  🌱 Chào mừng bạn đến IEC Kindness!     │
│  Hoàn thiện hồ sơ để bắt đầu           │
│                                         │
│  Bạn là:                                │
│  [● Học sinh]  [○ Giáo viên]           │
│                                         │
│  Lớp học: [___________]  ← hiện nếu HS │
│  Mã GV:   [___________]  ← hiện nếu GV │
│                                         │
│             [Bắt đầu →]                 │
└─────────────────────────────────────────┘
```

- Submit → `createUserDocument()` với role + grade đã nhập
- GV vẫn cần nhập mã xác thực (cùng `teacherCode` như flow email)
- Sau khi tạo doc → set `needsOnboarding: false` → modal tự đóng

**Scope thay đổi:**
- `src/store/useAuthStore.js` — thêm field `needsOnboarding`
- `src/services/auth.service.js` — `signInWithGoogle()` kiểm tra doc tồn tại, không tự tạo nếu chưa có
- `src/features/auth/OnboardingModal.jsx` — NEW, modal hoàn thiện hồ sơ
- `src/App.jsx` hoặc `MainLayout.jsx` — render `<OnboardingModal>` khi `needsOnboarding === true`

---

## Thứ tự implement

| # | Task | File thay đổi chính | Ước tính |
|---|---|---|---|
| 1 | Show/hide password toggle | `Input.jsx`, `LoginPage.jsx` | ~20 phút |
| 2 | Role toggle + Teacher Code trong Register | `LoginPage.jsx`, `useAuthController.js` | ~40 phút |
| 3 | Tạo `config/app` doc trong Firestore + service | `user.service.js` (thêm `getTeacherCode`) | ~15 phút |
| 4 | Google onboarding modal | `useAuthStore.js`, `auth.service.js`, `OnboardingModal.jsx` | ~30 phút |

**Tổng ước tính: ~1.5 giờ**

---

## Ghi chú bổ sung

- **Nếu trường IEC có domain email riêng cho GV** (VD: `gv.iec.edu.vn`): có thể bỏ hoàn toàn teacher code, chỉ cần kiểm tra `email.endsWith('@gv.iec.edu.vn')` → tự động `role: 'teacher'`. Đơn giản hơn nhiều.
- **Tương lai (Phase 2):** Thêm `status: 'pending' | 'active'` vào user doc, GV đăng ký xong phải chờ admin duyệt. Cần trang `/admin` để duyệt. Phù hợp khi trường có > 20 GV.
- **Teacher code hiện tại nên là:** `MGV-[năm học]-[chuỗi random]`, VD: `MGV-2526-K9mX2`
