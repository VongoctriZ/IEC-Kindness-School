# 🌱 IEC-KindnessSchool

Mạng xã hội học đường gamification dành cho học sinh trường IEC.  
Mỗi hành động tốt được ghi nhận bằng **Kindness Points** và hiển thị trên bảng xếp hạng toàn trường.

---

## Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- Tài khoản [Firebase](https://console.firebase.google.com/) (dự án đã được tạo sẵn — xin thông tin từ trưởng nhóm)
- [Firebase CLI](https://firebase.google.com/docs/cli) (chỉ cần nếu muốn deploy)

---

## Cài đặt

```bash
# 1. Clone repo
git clone https://github.com/your-username/iec-kindness-school.git
cd iec-kindness-school

# 2. Cài dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env
```

Mở file `.env` vừa tạo và điền thông tin Firebase (lấy từ trưởng nhóm hoặc Firebase Console):

```
VITE_APP_NAME=IEC-KindnessSchool

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Lưu ý:** Không commit file `.env` lên git. File này đã được thêm vào `.gitignore`.

---

## Chạy local

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

---

## Seed dữ liệu mẫu (tuỳ chọn)

Nếu cần dữ liệu test sẵn trong Firestore:

**Bước 1:** Lấy file Firebase Admin SDK key từ trưởng nhóm (file JSON, không được chia sẻ công khai), đặt vào thư mục gốc của project.

**Bước 2:** Thêm vào `.env`:

```
FIREBASE_ADMIN_KEY_FILE=../ten-file-adminsdk.json
SEED_PASSWORD=mat_khau_tai_khoan_test
```

**Bước 3:** Chạy seed:

```bash
npm run seed
```

Script sẽ tạo 12 tài khoản mẫu (10 học sinh + 2 giáo viên), 20 bài viết và bình luận trong Firestore.

---

## Quy trình làm việc với Git (bắt buộc đọc)

> Push thẳng lên `master` = deploy thẳng ra production. Làm sai sẽ làm hỏng app cho toàn bộ học sinh đang dùng.

### Nguyên tắc

| Việc được làm | Việc KHÔNG được làm |
|---|---|
| Tạo branch mới cho mỗi tính năng/fix | ~~Push thẳng lên `master`~~ |
| Mở Pull Request, chờ review | ~~Merge PR của chính mình~~ |
| Test local trước khi push | ~~Push code chưa chạy được~~ |
| Commit message rõ ràng | ~~`git push -f` (force push)~~ |

### Quy trình chuẩn

```bash
# 1. Luôn bắt đầu từ master mới nhất
git checkout master
git pull

# 2. Tạo branch mới (đặt tên theo tính năng)
git checkout -b feature/ten-tinh-nang
# hoặc: fix/mo-ta-loi

# 3. Code, test local (npm run dev), kiểm tra không có lỗi console

# 4. Commit
git add .
git commit -m "mô tả ngắn gọn thay đổi"

# 5. Push branch lên GitHub
git push origin feature/ten-tinh-nang

# 6. Mở Pull Request trên GitHub → chờ trưởng nhóm review
```

### Khi PR được approve

Trưởng nhóm merge vào `master` → GitHub Actions tự động build và deploy lên `https://kindness-school.web.app`.

### Xem kết quả deploy

- **GitHub** → tab **Actions** để xem tiến trình build
- Nếu build thất bại → xem log lỗi, fix rồi push lại lên branch → CI tự chạy lại

---

## CI/CD — Tự động deploy

Project dùng **GitHub Actions** để tự động deploy:

| Sự kiện | Kết quả |
|---------|---------|
| Push lên `master` | Deploy thẳng ra production |
| Mở Pull Request vào `master` | Deploy vào URL preview tạm thời để review |

### Setup lần đầu (trưởng nhóm thực hiện)

Chỉ cần thêm **1 secret** tại `GitHub repo → Settings → Secrets and variables → Actions → New repository secret`:

| Secret | Lấy ở đâu |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Project Settings → Service accounts → **Generate new private key** → copy toàn bộ nội dung file JSON |

> Các biến `VITE_FIREBASE_*` đã được đặt thẳng trong file workflow vì chúng không phải secret thật sự — Firebase client config được nhúng vào JS bundle và ai vào website cũng đọc được. Security đến từ Firestore Security Rules, không phải từ việc giấu API key.

---

## Build & Deploy thủ công (khi cần)

```bash
npm run build
firebase login
firebase deploy
```

URL production: `https://kindness-school.web.app`

---

## Cấu trúc thư mục

```
src/
├── components/     # UI components dùng chung
├── features/       # Tính năng theo trang (feed, auth, profile, ranking, search, notifications)
├── services/       # Firebase SDK calls (auth, post, user, storage, notification, search)
├── store/          # Zustand global state
├── mvc/
│   ├── controllers/   # Custom hooks xử lý logic
│   └── views/         # Layout wrappers
├── routes/         # AppRouter, ProtectedRoute
├── lib/            # utils, constants
└── styles/         # CSS variables (tokens.css), globals
```

## Tech stack

| | |
|---|---|
| UI | React 19 + Vite 6 |
| State | Zustand 5 |
| Backend | Firebase (Auth + Firestore + Storage + Hosting) |
| Styling | CSS Modules |
| Routing | React Router v7 |

---

## Tài liệu thêm

- [`CLAUDE.md`](CLAUDE.md) — design system, coding guidelines, Firestore schema
- [`ROADMAP.md`](ROADMAP.md) — tiến độ và kế hoạch phát triển
- [`PROJECT_REPORT.md`](PROJECT_REPORT.md) — báo cáo tổng hợp cho nhóm
