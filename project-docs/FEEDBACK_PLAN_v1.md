# Feedback Plan v1 — Đợt thử nghiệm đầu tiên

> Tài liệu này tổng hợp phân tích và kế hoạch xử lý 6 feedback từ người dùng.
> Thực hiện tuần tự theo thứ tự ưu tiên dưới đây.

---

## Tổng quan ưu tiên

| # | Feedback | Loại | Ưu tiên | Effort |
|---|---|---|---|---|
| F3 | Khoảng trắng sau khi đăng bài | Bug | 🔴 P0 | S |
| F4 | Xóa bài không xóa khỏi Firestore | Bug | 🔴 P0 | M |
| F1 | Mở rộng khối lớp 6–12, đa format | Feature | 🟡 P1 | M |
| F2 | Feed lazy loading / load more | Feature | 🟡 P1 | L |
| F5 | Bộ đếm cây trưởng thành | Feature | 🟡 P1 | M |
| F7 | Lọc theo tuần ở Ranking | Feature | 🟡 P1 | L |
| F6 | Tái cơ cấu điểm mốc | Enhancement | 🟢 P2 | S |

F5 + F6 liên quan chặt chẽ → thực hiện cùng nhau.

---

## F3 — Khoảng trắng sau khi đăng bài 🔴

### Root cause

Không có optimistic update khi tạo post. Luồng hiện tại:

1. User submit → `createPost()` gọi Firestore → chờ server
2. `serverTimestamp()` trả về sau (~100–500ms)
3. `onSnapshot` fire → post mới xuất hiện trên feed

Trong khoảng delay đó, nếu feed đang render lại, có thể tạo khoảng trắng layout.
`prependPost()` đã có sẵn trong store nhưng **không được gọi** sau khi create.

### Files cần sửa

| File | Vị trí | Thay đổi |
|---|---|---|
| `src/mvc/controllers/useFeedController.js` | `handleCreatePost` (lines ~33–47) | Gọi `prependPost(tempPost)` ngay sau khi `createPost` trả về postId |
| `src/store/usePostStore.js` | `prependPost` (lines 31–33) | Đã có sẵn, không cần sửa |

### Cách fix

```js
// useFeedController.js — handleCreatePost
const postId = await createPost(uid, profile, content, mediaUrl, mediaType)

// Optimistic: thêm vào store ngay, không chờ onSnapshot
prependPost({
  id: postId,
  authorId: uid,
  content,
  mediaUrl: mediaUrl ?? null,
  mediaType: mediaType ?? null,
  likeCount: 0,
  commentCount: 0,
  createdAt: { toDate: () => new Date() }, // local fallback timestamp
  authorName: profile.displayName,
  authorGrade: profile.grade,
  authorPhotoURL: profile.photoURL,
})
```

`onSnapshot` sau đó sẽ nhận document thật từ Firestore (cùng `id`) — store deduplicate tự nhiên vì filter `id`.

> **Lưu ý:** `createdAt` là local Date object tạm thời; khi `onSnapshot` fire sẽ replace bằng `Timestamp` thật từ server. Cần đảm bảo `PostCard` handle cả hai dạng khi gọi `.toDate()`.

---

## F4 — Xóa bài không xóa khỏi Firestore 🔴

### Root cause

`deletePost` service check `authorId !== uid` và throw nếu không phải tác giả:

```js
// src/services/post.service.js lines 111–115
if (!snap.exists() || snap.data().authorId !== uid) throw new Error('Không có quyền xoá')
```

Luồng lỗi khi giáo viên/admin xóa bài:
1. `removePost(postId)` → xóa khỏi local store (optimistic) ✅
2. `deletePost(postId, user.uid)` → throw vì `uid !== authorId` ❌
3. `catch(e)` chỉ `console.error(e)` — **không rollback** ❌
4. Firestore giữ nguyên → refresh → post xuất hiện lại

### Files cần sửa

| File | Vị trí | Thay đổi |
|---|---|---|
| `src/services/post.service.js` | `deletePost` (lines 111–115) | Nhận thêm `role` param, bỏ qua check authorId nếu `role === 'teacher'` |
| `src/mvc/controllers/useFeedController.js` | `handleDelete` (lines 62–70) | Truyền `user.role` vào service; thêm rollback khi fail |
| `firestore.rules` | rule `posts` | Cho phép teacher/admin delete bất kỳ post |

### Cách fix

**service:**
```js
export async function deletePost(postId, uid, role) {
  const snap = await getDoc(doc(db, 'posts', postId))
  if (!snap.exists()) throw new Error('Bài viết không tồn tại')
  const isAuthor = snap.data().authorId === uid
  const isPrivileged = role === 'teacher' || role === 'admin'
  if (!isAuthor && !isPrivileged) throw new Error('Không có quyền xoá')
  await deleteDoc(doc(db, 'posts', postId))
}
```

**controller (với rollback):**
```js
const handleDelete = useCallback(async (postId) => {
  if (!user) return
  const snapshot = getPosts()        // lấy current posts trước khi xóa
  removePost(postId)                 // optimistic
  try {
    await deletePost(postId, user.uid, user.role)
  } catch (e) {
    setPosts(snapshot)               // rollback
    console.error('[handleDelete]', e.message)
  }
}, [user])
```

**Firestore rules (cập nhật rule `posts`):**
```
allow delete: if request.auth.uid == resource.data.authorId
           || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
              in ['teacher', 'admin'];
```

---

## F1 — Mở rộng khối lớp 6–12, đa format 🟡

### Phân tích hiện trạng

```js
// LeaderboardPage.jsx lines 10–11
const CLASS_FILTERS = ['Tất cả', 'Khối 10', 'Khối 11', 'Khối 12']

// Filter logic lines 22–26
u.grade?.startsWith(classFilter.replace('Khối ', ''))
// → "Khối 10" → startsWith("10") — chỉ đúng với "10A1", "10B2"
// → KHÔNG match "IS-10", "10.1" nếu startsWith("10") fail
```

Grade là freeform string. Tiền tố (nếu có) là tên viết tắt của trường — **không hardcode** vì mỗi trường có thể khác nhau (IS, TH, TN, ...). Logic chỉ cần extract số khối.

| Format | Ví dụ | Khối |
|---|---|---|
| `{k}{class}` | `6A1`, `12B2` | 6, 12 |
| `{k}.{n}` | `6.1`, `11.3` | 6, 11 |
| `{prefix}-{k}` | `IS-6`, `TH-10` | 6, 10 |
| `{prefix}-{k}.{n}` | `IS-6.1`, `TN-11.2` | 6, 11 |

### Files cần sửa

| File | Thay đổi |
|---|---|
| `src/lib/constants.js` | Thêm `GRADE_BLOCKS = [6,7,8,9,10,11,12]` |
| `src/lib/utils.js` | Thêm hàm `extractGradeBlock(grade): number \| null` |
| `src/features/ranking/LeaderboardPage.jsx` | Dùng `GRADE_BLOCKS` + `extractGradeBlock` |
| `src/features/auth/OnboardingModal.jsx` | Cập nhật placeholder ví dụ format |
| `src/features/profile/EditProfileModal.jsx` | Cập nhật placeholder ví dụ format |

### Cách fix

```js
// src/lib/utils.js — thêm hàm này
// Regex chỉ match số khối (6–12) tại word boundary — không phụ thuộc tiền tố trường
// VD: "6A1"→6, "6.1"→6, "IS-6"→6, "TH-10.1"→10, "12B2"→12
export function extractGradeBlock(grade) {
  if (!grade) return null
  const match = grade.match(/(?<![0-9])([6-9]|1[0-2])(?![0-9])/)
  return match ? parseInt(match[1], 10) : null
}
```

> Dùng lookahead/lookbehind `(?<![0-9])...(?![0-9])` thay vì `\b` để tránh false-positive khi số khối nằm trong chuỗi số dài hơn (VD: tránh match `6` trong `16`).

```js
// LeaderboardPage.jsx
import { GRADE_BLOCKS } from '../../lib/constants'
import { extractGradeBlock } from '../../lib/utils'

const CLASS_FILTERS = ['Tất cả', ...GRADE_BLOCKS.map(k => `Khối ${k}`)]

// filter
const matchClass = classFilter === 'Tất cả'
  || extractGradeBlock(u.grade) === parseInt(classFilter.replace('Khối ', ''), 10)
```

---

## F2 — Feed lazy loading / load more 🟡

### Phân tích hiện trạng

```js
// post.service.js lines 23–29
export function subscribeToPosts(callback, onError, n = FEED_PAGE_SIZE) {  // FEED_PAGE_SIZE = 20
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(n))
  return onSnapshot(q, ...)
}
```

Fixed limit = 20, không có pagination.

### Design được chọn: Hybrid real-time + cursor pagination

- **Real-time** (`onSnapshot`): luôn subscribe N bài mới nhất (N có thể tăng theo scroll)
- **Load more**: tăng giá trị `n` trong query → Firestore trả về nhiều hơn, listener vẫn live

Cách đơn giản nhất: tăng `limit(n)` khi user nhấn "Xem thêm" hoặc scroll đến cuối.

### Files cần sửa

| File | Thay đổi |
|---|---|
| `src/lib/constants.js` | `FEED_PAGE_SIZE = 20`, `FEED_LOAD_MORE_SIZE = 10` |
| `src/store/usePostStore.js` | Thêm `feedLimit` state, action `increaseLimit` |
| `src/mvc/controllers/useFeedController.js` | Re-subscribe khi `feedLimit` thay đổi; expose `loadMore`, `hasMore` |
| `src/services/post.service.js` | `subscribeToPosts(callback, onError, n)` — đã nhận `n`, không cần sửa |
| `src/features/feed/FeedPage.jsx` | Thêm "Xem thêm" button hoặc IntersectionObserver trigger |

### Cách fix (store + controller)

```js
// usePostStore.js — thêm
feedLimit: FEED_PAGE_SIZE,
increaseLimit: () => set(s => ({ feedLimit: s.feedLimit + FEED_LOAD_MORE_SIZE })),
```

```js
// useFeedController.js — re-subscribe khi limit thay đổi
const feedLimit = usePostStore(s => s.feedLimit)
const increaseLimit = usePostStore(s => s.increaseLimit)

useEffect(() => {
  const unsub = subscribeToPosts(setPosts, setError, feedLimit)
  return unsub
}, [feedLimit])  // re-subscribe khi limit tăng

const loadMore = useCallback(() => increaseLimit(), [increaseLimit])
// hasMore: nếu posts.length === feedLimit thì có thể còn
const hasMore = posts.length >= feedLimit
```

```jsx
// FeedPage.jsx — cuối danh sách
{hasMore && (
  <button onClick={loadMore} className={styles.loadMoreBtn}>
    Xem thêm bài viết
  </button>
)}
```

> **Tùy chọn nâng cao:** Dùng `IntersectionObserver` để auto-trigger `loadMore()` khi button vào viewport — không cần user click, giống infinite scroll. Dùng lại hook `useScrollReveal` đã có.

---

## F5 + F6 — Bộ đếm cây trưởng thành & Tái cơ cấu điểm 🟡

### F6: Thresholds mới

Thresholds hiện tại quá thấp (max 700 pts). Cơ cấu mới với **chu kỳ harvest = 1 000 điểm**:

| Stage | Icon | Điểm trong chu kỳ | Điểm cũ | Ghi chú |
|---|---|---|---|---|
| Hạt giống | 🌰 | 0 | 0 | Bắt đầu chu kỳ |
| Mầm non | 🌱 | 50 | 20 | |
| Chồi non | 🌿 | 150 | 50 | |
| Cây con | 🪴 | 320 | 100 | |
| Cây xanh | 🌳 | 600 | 200 | |
| **Cây trưởng thành** | 🌲 | **1 000** | 400 | Harvest → reset chu kỳ |

**Cây cổ thụ — Achievement riêng (không trong chu kỳ):**

| Điều kiện | Hiển thị |
|---|---|
| `matureTreeCount >= 3` (≥ 3 000 tổng điểm) | 🌴 Cây cổ thụ — badge trên profile + leaderboard |
| `matureTreeCount >= 5` (≥ 5 000 tổng điểm) | 🌴🌟 Đại Thụ — badge nâng cao (tùy chọn mở rộng sau) |

**Quy tắc:**
- **Chu kỳ harvest = 1 000 điểm** (Cây trưởng thành): mỗi lần đạt 1 000 `cyclePoints` → `matureTreeCount++` + `cyclePoints` reset về 0
- `totalPoints` không bao giờ reset — dùng cho leaderboard all-time
- **Cây cổ thụ** là achievement dựa trên `matureTreeCount`, không nằm trong thanh tiến độ chu kỳ

### F5: Thiết kế bộ đếm

**Firestore — thêm field vào `users/{uid}`:**
```
matureTreeCount : number   // default 0, increment khi harvest
cyclePoints     : number   // điểm trong chu kỳ hiện tại (0..999)
```

> `totalPoints` vẫn giữ nguyên (cộng dồn mãi) → dùng cho leaderboard.
> `cyclePoints` dùng riêng cho thanh tiến độ.

**Logic harvest (trong `user.service.js`):**
```js
export async function addPoints(uid, points) {
  const userRef = doc(db, 'users', uid)
  await runTransaction(db, async tx => {
    const snap = await tx.get(userRef)
    const current = snap.data().cyclePoints ?? 0
    const newCycle = current + points
    const harvests = Math.floor(newCycle / MATURE_TREE_THRESHOLD)  // 1000
    const remainder = newCycle % MATURE_TREE_THRESHOLD

    tx.update(userRef, {
      totalPoints:     increment(points),
      cyclePoints:     remainder,
      matureTreeCount: increment(harvests),
    })
  })
}
```

### Files cần sửa

| File | Thay đổi |
|---|---|
| `src/lib/constants.js` | Thêm `MATURE_TREE_THRESHOLD = 1000` |
| `src/lib/utils.js` | Cập nhật `KINDNESS_TITLES` array; sửa `getLevelInfo` dùng `cyclePoints` |
| `src/mvc/models/user.model.js` | Thêm `matureTreeCount`, `cyclePoints` vào JSDoc + `buildUserDoc` |
| `src/services/user.service.js` | Refactor `addPoints` thành transaction với harvest logic |
| `src/components/KindnessProgress/KindnessProgress.jsx` | Nhận `cyclePoints` thay `totalPoints`; thêm hiển thị `matureTreeCount` |
| `src/features/feed/FeedPage.jsx` | Truyền `user.cyclePoints` + `user.matureTreeCount` vào component |
| `src/features/profile/ProfilePage.jsx` | Tương tự; hiển thị Cây cổ thụ title nếu đủ điều kiện |

### UI bộ đếm (KindnessProgress)

```
🌲 × 3   [████████░░] 450 / 1000
         Cây xanh → Cây trưởng thành
```

- `🌲 × 3` = đã harvest 3 cây trưởng thành
- Thanh tiến độ dựa trên `cyclePoints`
- Nếu `matureTreeCount >= 2`: hiển thị badge "🌴 Cây cổ thụ" bên cạnh tên

---

---

## F7 — Lọc theo tuần ở Ranking 🟡

### Phân tích

Leaderboard hiện tại chỉ có all-time ranking (query theo `totalPoints`). Cần thêm tab **Tuần này** để tổng kết hàng tuần trong môi trường học đường.

### Design: pointHistory bắt buộc + client aggregation

`pointHistory` collection đã được định nghĩa trong schema (hiện là "tùy chọn") — **chuyển thành bắt buộc** để hỗ trợ weekly ranking.

Luồng:
1. Mỗi action cộng điểm (`addPoints`) → ghi một document vào `pointHistory`
2. Khi hiển thị Tuần này → query `pointHistory` với `createdAt >= startOfWeek`, group by `uid`, sum `points`
3. Merge với user data để lấy `displayName`, `grade`, `photoURL`

**Tính toán `startOfWeek`:** Tuần tính từ thứ Hai (Monday) 00:00:00 giờ địa phương.

### Files cần sửa / tạo

| File | Thay đổi |
|---|---|
| `src/lib/utils.js` | Thêm `getStartOfWeek(): Date` |
| `src/services/user.service.js` | `addPoints()` → bổ sung ghi `pointHistory` document |
| `src/services/ranking.service.js` | Tạo mới: `getWeeklyRanking(n)` query + aggregate |
| `src/features/ranking/LeaderboardPage.jsx` | Thêm tab "Tất cả thời gian / Tuần này"; gọi service tương ứng |
| `src/features/ranking/LeaderboardPage.module.css` | Styles cho tab switcher |

### Cách fix

```js
// src/lib/utils.js
export function getStartOfWeek() {
  const now = new Date()
  const day = now.getDay()                    // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day      // Monday = day 1
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}
```

```js
// src/services/ranking.service.js (mới)
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function getWeeklyRanking(n = 20) {
  const since = Timestamp.fromDate(getStartOfWeek())
  const q = query(
    collection(db, 'pointHistory'),
    where('createdAt', '>=', since),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)

  // Aggregate: uid → { totalWeeklyPoints, uid }
  const map = {}
  snap.docs.forEach(d => {
    const { uid, points } = d.data()
    map[uid] = (map[uid] ?? 0) + points
  })

  // Sort và lấy top N
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([uid, weeklyPoints]) => ({ uid, weeklyPoints }))
}
```

```jsx
// LeaderboardPage.jsx — thêm tab
const [rankMode, setRankMode] = useState('alltime')   // 'alltime' | 'weekly'

// Hiển thị khác nhau theo mode
// alltime: dùng users từ onSnapshot (đã có)
// weekly: gọi getWeeklyRanking(), merge với user profiles
```

> **Composite index Firestore:** Query `pointHistory` với `where createdAt >= ...` + `orderBy createdAt` cần index — tạo qua Firebase Console hoặc `firestore.indexes.json`.

### Firestore rules — pointHistory

```
match /pointHistory/{docId} {
  allow read: if request.auth != null;     // weekly ranking cần read all
  allow create: if request.auth.uid == request.resource.data.uid;
}
```

---

## Thứ tự thực hiện

```
[1] F3 — Fix khoảng trắng (optimistic prependPost)           ~30 min
[2] F4 — Fix delete bug (service + controller + rules)        ~45 min
[3] F6 — Đổi KINDNESS_TITLES thresholds                      ~15 min
[4] F5 — Bộ đếm matureTreeCount + harvest logic              ~60 min
[5] F1 — Mở rộng khối lớp 6–12                               ~30 min
[6] F2 — Feed load more / lazy loading                        ~60 min
[7] F7 — Weekly ranking (pointHistory + tab UI)               ~90 min
```

---

## Kiểm thử

| Item | Test case |
|---|---|
| F3 | Đăng bài → post xuất hiện ngay, không có delay/khoảng trắng |
| F4 | Giáo viên xóa bài → bài biến mất; refresh → bài không xuất hiện lại |
| F4 | Delete fail (network off) → bài quay lại feed (rollback) |
| F1 | Filter "Khối 6" lọc đúng "6A1", "6.1", "IS-6", "IS-6.1" |
| F2 | Cuộn hết 20 bài → nút "Xem thêm" xuất hiện → nhấn → load thêm 10 |
| F5 | Cộng đủ 1000 cyclePoints → matureTreeCount +1, progress về 0 |
| F5 | matureTreeCount >= 3 → hiển thị badge 🌴 Cây cổ thụ |
| F6 | Thresholds mới [0, 50, 150, 320, 600, 1000] áp dụng đúng |
| F7 | Tab "Tuần này" hiển thị đúng điểm từ thứ Hai đến hiện tại |
| F7 | Đăng bài → pointHistory được ghi → xuất hiện trong weekly ranking |
