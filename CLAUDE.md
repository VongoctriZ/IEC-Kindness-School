# KindnessSchool — CLAUDE.md

## Mandatory Rules

> Những quy tắc này áp dụng cho **mọi thay đổi**, không có ngoại lệ.

1. **Screenshot sau mỗi thay đổi lớn** — chụp màn hình kết quả thực tế và so sánh với design spec trước khi tiếp tục.
2. **Mobile-first** — mọi component và layout phải hoạt động tốt trên màn hình 375px trước khi mở rộng lên desktop. Không được ship UI chỉ test trên desktop.
3. **Scroll animations** — mọi section khi vào viewport phải có animation (fade-in-up là mặc định). Dùng `IntersectionObserver` + CSS class toggle, không dùng thư viện animation nặng.

---

## Project Overview

**KindnessSchool** là một mạng xã hội học đường mang phong cách gamification và tích cực.
Mỗi hành động tốt (đăng bài, bình luận, tương tác) được ghi nhận bằng điểm thưởng (Kindness Points),
hiển thị trên bảng xếp hạng và lan tỏa qua giao diện tươi sáng, vui nhộn.

- **Đối tượng:** Học sinh
- **Mục tiêu:** Khuyến khích hành động tích cực thông qua cơ chế điểm thưởng và nhận diện cộng đồng
- **Ngôn ngữ giao diện:** Tiếng Việt

### Tính năng

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Auth | Đăng nhập / đăng ký email, trang Profile | P0 |
| Feed | Home page: danh sách bài đăng, điểm tích lũy cá nhân, hạng cá nhân | P0 |
| Post | Tạo bài viết (text + media) | P0 |
| Leaderboard | Trang bảng xếp hạng riêng | P0 |
| Phân quyền | Giáo viên vs học sinh (Teacher/Student role) | P1 (để sau) |

---

## Quick Start

```bash
npm install
npm run dev          # dev server tại http://localhost:5173
npm run build        # production build
npm run preview      # preview build
```

**Env vars** (tạo file `.env` ở root, KHÔNG commit lên git — xem `.env.example`):

```
VITE_APP_NAME=KindnessSchool

# Firebase config (lấy từ Firebase Console > Project Settings > Your apps)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=    # VD: your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> Tất cả biến dùng trong Vite phải bắt đầu bằng `VITE_`. Firebase keys có thể public nhưng bảo vệ bằng Firestore Security Rules và Storage Rules — không commit `.env` lên git.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| UI | React 19 |
| Bundler | Vite 6 |
| Global State | Zustand 5 |
| Backend / DB | Firebase (Auth + Firestore) |
| Media Storage | Firebase Storage (Blaze plan — ảnh + video, upload qua SDK trực tiếp từ browser) |
| Deploy | Firebase Hosting (CDN toàn cầu, HTTPS tự động) |
| Styling | CSS Modules (không dùng Tailwind hay UI lib ngoài) |
| Routing | React Router v7 |

Không dùng UI component library bên ngoài — build component thuần từ design spec.
Không dùng Axios — Firebase dùng SDK riêng; Storage upload qua `uploadBytesResumable` (hỗ trợ progress).

---

## Design System

### Color Tokens

Định nghĩa tại `src/styles/tokens.css` dưới dạng CSS custom properties:

```css
:root {
  /* Brand */
  --color-primary:        #6B6FD8;   /* indigo — buttons, active states */
  --color-primary-hover:  #5558C8;
  --color-primary-light:  #EEEEFF;   /* secondary button bg */

  /* Accent */
  --color-accent:         #22C55E;   /* green — online dot, focus ring, nav focus */
  --color-accent-hover:   #16A34A;

  /* Surfaces */
  --color-bg:             #F5F5F5;   /* page background */
  --color-surface:        #FFFFFF;   /* card / modal surface */
  --color-nav-bg:         #F0FAF0;   /* navbar background (light green tint) */

  /* Text */
  --color-text-primary:   #1A1A2E;
  --color-text-secondary: #6B7280;
  --color-text-disabled:  #9CA3AF;

  /* Semantic */
  --color-error:          #EF4444;
  --color-error-light:    #FEE2E2;
  --color-success:        #22C55E;

  /* Shadows */
  --shadow-card:          0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-dropdown:      0 4px 16px rgba(0, 0, 0, 0.12);
}
```

### Typography

```css
:root {
  --font-family: 'Inter', 'Segoe UI', sans-serif;

  --text-xs:   0.75rem;   /* 12px — timestamps, helper text */
  --text-sm:   0.875rem;  /* 14px — secondary body */
  --text-base: 1rem;      /* 16px — body */
  --text-lg:   1.125rem;  /* 18px — card titles */
  --text-xl:   1.25rem;   /* 20px — section headings */
  --text-2xl:  1.5rem;    /* 24px — page headings */

  --font-normal: 400;
  --font-medium: 500;
  --font-bold:   700;
}
```

### Spacing & Shape

```css
:root {
  --radius-sm:   8px;
  --radius-md:   12px;    /* cards */
  --radius-lg:   16px;    /* modals */
  --radius-pill: 999px;   /* buttons, nav items, badges */

  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
}
```

---

## Component Catalog

Tất cả component nằm trong `src/components/`. Mỗi component có file `.jsx` và `.module.css` cùng tên.

### Button

```jsx
<Button
  variant="primary" | "secondary"   // default: "primary"
  size="large" | "medium" | "small" // default: "medium"
  icon={<Icon />}                   // optional left icon
  iconRight={<Icon />}              // optional right icon (e.g. chevron)
  disabled={false}
  onClick={fn}
>
  Label
</Button>
```

- Primary: `--color-primary` fill, white text, `--radius-pill`
- Secondary: transparent bg, `--color-primary` border + text
- Disabled: opacity 0.4, no pointer events

### Input

```jsx
<Input
  label="Label"
  placeholder="Placeholder"
  helperText="Helper text"
  maxLength={120}          // shows char count when set
  error="Error message"    // red border + helper
  disabled={false}
  icon={<Icon />}          // right icon
  value={val}
  onChange={fn}
/>
```

### Avatar (User Info)

```jsx
<Avatar
  src="url"
  name="Nguyễn Văn A"
  subtext="Lớp 10A1"       // optional
  size="large" | "medium" | "small"  // default: "medium"
  online={true | false}    // shows green/gray dot
/>
```

- Border: 2px solid `--color-primary`
- Online dot: `--color-accent` (green) khi active, `--color-text-disabled` khi inactive

### NavItem

```jsx
<NavItem
  icon={<Icon />}
  label="Home"
  active={false}
  disabled={false}
  onClick={fn}
/>
```

- Shape: pill (`--radius-pill`), bg trắng, subtle shadow
- Active/Focus: border 2px `--color-accent`

### Navbar

```jsx
<Navbar />
```

Tự lấy auth state từ `useAuthStore`. Gồm: Logo trái, nav items giữa (Home/Upload/Ranking), Avatar phải.
Navbar background: `--color-nav-bg`.

### Card (PostCard)

```jsx
<PostCard
  post={postObject}
  onLike={fn}
  onComment={fn}
  onDelete={fn}   // chỉ hiện nếu là author
/>
```

PostCard hiển thị: Avatar + tên + subtext + timestamp → nội dung text → media (ảnh/video) → like count + comment count.
Comment lồng bên dưới dùng `CommentCard` (layout nhỏ hơn, không có nested comment).

### Media

```jsx
<Media
  src="url"
  type="image" | "video"
  context="post" | "comment"   // post: full width, comment: thumbnail
/>
```

### Modal

```jsx
<Modal isOpen={bool} onClose={fn} title="Title">
  {children}
</Modal>
```

Backdrop click đóng modal. Focus trap khi mở.

### Spinner

```jsx
<Spinner size="sm" | "md" | "lg" />
```

---

## Architecture

### Folder Structure

```
src/
├── components/          # UI primitives (Button, Input, Avatar, Card, Navbar, NavItem, Modal, Spinner, Media)
├── features/
│   ├── feed/            # FeedPage, PostList, PostComposer
│   ├── ranking/         # LeaderboardPage, LeaderboardTable, MedalBadge
│   └── profile/         # ProfilePage, UserStats, UserPostList
├── mvc/
│   ├── models/          # post.model.js, user.model.js, comment.model.js (data shapes / JSDoc types)
│   ├── controllers/     # useAuthController.js, useFeedController.js, usePostController.js, usePointsController.js
│   └── views/           # MainLayout.jsx, AuthLayout.jsx (layout wrappers)
├── services/            # firebase.js (init), auth.service.js, post.service.js, user.service.js, storage.service.js
├── store/               # useAuthStore.js, usePostStore.js, usePointStore.js (Zustand)
├── routes/              # AppRouter.jsx, ProtectedRoute.jsx
├── lib/                 # constants.js, utils.js
├── styles/              # tokens.css, globals.css, animations.css
└── assets/              # logo, icons
```

### Data Flow

```
User action
  → Controller hook (useXxxController)
    → Service call (xxx.service.js → Firebase SDK)
      → Zustand store update
        → React re-render
```

### Firebase Init

File `src/services/firebase.js` — khởi tạo một lần, export các instance:

```js
import { initializeApp } from 'firebase/app'
import { getAuth }        from 'firebase/auth'
import { getFirestore }   from 'firebase/firestore'

const app = initializeApp({ /* VITE_ env vars */ })

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)   // Firebase Storage (Blaze plan)
```

### Auth Pattern

- Dùng `firebase/auth` — email/password auth
- `onAuthStateChanged` listener trong `useAuthStore` để sync trạng thái đăng nhập
- `ProtectedRoute` check `useAuthStore.user !== null` trước khi render
- Sau khi đăng ký thành công, tự tạo document `users/{uid}` trong Firestore với role mặc định `"student"`

---

## Feature Specs

### Kindness Points

| Hành động | Điểm |
|---|---|
| Đăng bài mới | +10 |
| Bình luận | +5 |
| Nhận like trên bài | +2 |
| Đăng ký lần đầu | +20 |

Điểm được cộng trực tiếp trong Firestore bằng `increment()` ngay sau khi action thành công phía client.
Dùng Firestore transaction hoặc `runTransaction` để tránh race condition khi nhiều user like cùng lúc.

```js
// ví dụ cộng điểm khi đăng bài
await updateDoc(doc(db, 'users', uid), {
  totalPoints: increment(POINTS_PER_POST)
})
```

### Ranking & Leaderboard

- Query Firestore: `collection('users')` order by `totalPoints` desc, limit 10
- Dùng `onSnapshot` để leaderboard tự cập nhật real-time
- Huy chương: 🥇 hạng 1 · 🥈 hạng 2 · 🥉 hạng 3
- Home page hiển thị: hạng cá nhân của user đang đăng nhập + tổng điểm

### Media Upload Flow (Firebase Storage)

1. User chọn file — client validate type + size ngay lập tức (không đợi upload)
2. `uploadPostMedia(uid, file, onProgress)` trong `storage.service.js` dùng `uploadBytesResumable` gửi lên Firebase Storage tại path `posts/{uid}/{timestamp}.{ext}`
3. Khi upload xong, `getDownloadURL()` trả về URL CDN HTTPS — lưu vào Firestore post document
4. Avatar / cover tương tự, path `avatars/{uid}/avatar` / `covers/{uid}/cover`
5. Security Rules trong `storage.rules` đảm bảo chỉ owner mới ghi được vào path của mình

**Firebase Storage paths:**
```
avatars/{uid}/avatar      → ảnh đại diện
covers/{uid}/cover        → ảnh bìa profile
posts/{uid}/{timestamp}   → media bài viết (ảnh + video)
```

---

## Coding Guidelines

### Naming

- Components: `PascalCase` (Button.jsx, PostCard.jsx)
- Hooks / controllers: `camelCase` bắt đầu bằng `use` (useFeedController.js)
- CSS Module classes: `camelCase` (`.cardWrapper`, `.avatarRing`)
- Constants: `SCREAMING_SNAKE_CASE` (MAX_FILE_SIZE, POINTS_PER_POST)
- Files: kebab-case cho non-component (auth.service.js, use-auth-controller.js là sai — dùng camelCase)

### Comments

Không thêm comment trừ khi lý do (WHY) không tự hiển nhiên từ code. Không mô tả WHAT code làm.

### CSS Modules

- Mỗi component có file `.module.css` riêng
- Không dùng inline styles trừ giá trị động (width tính theo JS)
- Dùng CSS vars từ `tokens.css`, không hardcode màu hay kích thước
- **Mobile-first**: viết styles cho 375px trước, dùng `min-width` media queries để mở rộng
- Media query breakpoints: `768px` (tablet) · `1280px` (desktop)

### Scroll Animations

Dùng `IntersectionObserver` — không dùng thư viện.
Định nghĩa class trong `src/styles/animations.css`:

```css
.fadeInUp {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fadeInUp.visible {
  opacity: 1;
  transform: translateY(0);
}
```

Hook tái sử dụng `src/hooks/useScrollReveal.js` — nhận `ref`, toggle class `visible` khi vào viewport.
Áp dụng cho: PostCard, LeaderboardRow, ProfileStat, mọi section heading.

### Security

- Không commit `.env` — thêm vào `.gitignore`
- Không log token ra console
- Validate file upload (type + size) ở client VÀ server
- Sanitize HTML nếu render user content (tránh XSS)

### Import Order

1. React và thư viện ngoài
2. Store / services / hooks
3. Components
4. CSS Module (luôn cuối cùng)

---

## Firestore Schema

### Collection: `users`

```
users/{uid}
  displayName : string
  email       : string
  photoURL    : string | null
  role        : "student" | "teacher"   // default "student"
  totalPoints : number                  // dùng increment(), không ghi đè
  createdAt   : Timestamp
```

### Collection: `posts`

```
posts/{postId}
  authorId    : string (uid)
  content     : string
  mediaUrl    : string | null
  mediaType   : "image" | "video" | null
  likeCount   : number
  commentCount: number
  createdAt   : Timestamp
```

Sub-collection: `posts/{postId}/likes/{uid}` — document tồn tại = user đã like.

### Collection: `comments`

```
comments/{commentId}
  postId    : string
  authorId  : string (uid)
  content   : string
  mediaUrl  : string | null
  mediaType : "image" | "video" | null
  createdAt : Timestamp
```

### Collection: `pointHistory` (tùy chọn, để audit)

```
pointHistory/{docId}
  uid      : string
  action   : "post" | "comment" | "like_received" | "register"
  points   : number
  refId    : string (postId hoặc commentId)
  createdAt: Timestamp
```

### Firestore Security Rules (tóm tắt)

- `users/{uid}`: read = authenticated; write = chỉ owner (uid == request.auth.uid), ngoại trừ `totalPoints` — chỉ ghi qua client SDK với rule cho phép increment
- `posts`: read = authenticated; create = authenticated; update/delete = chỉ author
- `comments`: read = authenticated; create = authenticated; delete = chỉ author
- `pointHistory`: read = owner; create = authenticated (server-side nếu dùng Cloud Functions)
