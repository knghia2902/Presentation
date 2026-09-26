# Quy Luật Phủ Định Của Phủ Định - Prezi Spatial Presentation

Bài thuyết trình không gian đa chiều (Prezi Infinite Spatial Canvas) chủ đề: **"Quy Luật Phủ Định Của Phủ Định" (§748–761 Triết học Mác - Lênin)**.

Hỗ trợ lưu trữ dữ liệu thời gian thực trên **Cloudflare D1 (Serverless SQLite)** kết hợp cơ chế ngoại tuyến **LocalStorage + IndexedDB**, sẵn sàng triển khai trên **Cloudflare Pages**.

---

## 🚀 Tính Năng Chính

- **Infinite Spatial Canvas**: Điều hướng camera 2D/3D mượt mà qua 14 trạm kiến thức.
- **Tùy biến & Kéo thả 8 hướng**: Mỗi thẻ (card) có 8 chốt co giãn (Resize handles) và thanh nắm di chuyển (Drag handle).
- **Chỉnh sửa văn bản trực tiếp 100%**: Sửa tiêu đề, nội dung, huy hiệu A, B, A', sơ đồ xoáy ốc 3D.
- **Chèn & Dán ảnh (Ctrl+V)**: Dán trực tiếp từ bộ nhớ đệm (Clipboard/Snipping Tool) hoặc tải từ máy tính.
- **Thêm & Nhân bản & Xóa trạm**: Tự động đồng bộ với lộ trình danh sách trạm (Sidebar).
- **Lưu trữ đám mây Cloudflare D1**: Tự động đồng bộ lên cơ sở dữ liệu Cloudflare D1 thông qua Cloudflare Pages Functions (`/api/presentation`).
- **Chế độ Thuyết trình (Present Mode / F5)**: Tối giản thanh công cụ, nền trắng tinh khôi, lướt camera không gian 3D.

---

## 🌐 Hướng Dẫn Triển Khai Lên Cloudflare Pages

### Cách 1: Kết nối trực tiếp qua GitHub (Khuyên dùng)
1. Đẩy code lên GitHub repository: `https://github.com/knghia2902/Presentation.git`.
2. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Compute (Workers & Pages)** -> **Create application** -> Tab **Pages** -> **Connect to Git**.
3. Chọn repo `knghia2902/Presentation`.
4. Cấu hình Build Settings:
   - **Framework preset**: `None`
   - **Build command**: *(để trống)*
   - **Build output directory**: `.` (hoặc để trống)
5. Bấm **Save and Deploy**.

### Cách 2: Tạo và Kết nối Cơ Sở Dữ Liệu Cloudflare D1 (Lưu trữ trực tuyến)
1. Trong Cloudflare Dashboard: vào **Storage & Databases** -> **D1 SQL Database** -> bấm **Create database**.
2. Đặt tên database là `presentation-db` -> bấm **Create**.
3. Vào tab **Console** của database vừa tạo, dán đoạn mã sau từ file `schema.sql` và bấm **Execute**:
   ```sql
   CREATE TABLE IF NOT EXISTS presentations (
     id TEXT PRIMARY KEY,
     content TEXT,
     cards_layout TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```
4. Kết nối D1 với Cloudflare Pages:
   - Vào dự án Pages của bạn -> **Settings** -> **Functions** -> cuộn xuống mục **D1 database bindings**.
   - Bấm **Add binding**:
     - **Variable name**: `DB` *(viết hoa đúng 2 chữ cái)*
     - **D1 database**: chọn `presentation-db`
   - Bấm **Save**.
   - Vào tab **Deployments** -> bấm **Retry deployment** (hoặc tạo deployment mới) để Pages nhận binding mới.

---

## 💻 Chạy Thử Nghiệm Cục Bộ (Local Development)

```bash
# Cài đặt wrangler nếu chưa có
npm install -g wrangler

# Chạy thử nghiệm Cloudflare Pages cùng Functions cục bộ:
npx wrangler pages dev .
```

Hoặc chỉ cần mở trực tiếp file `index.html` trên trình duyệt để sử dụng với bộ nhớ cục bộ (LocalStorage + IndexedDB).

## 🎯 Quiz tương tác theo phòng

Quiz nằm tại [`/presentation/quiz/`](presentation/quiz/). Một người tạo phòng và bắt đầu ván; người chơi nhập mã phòng rồi chỉ chọn A/B/C/D. Mỗi câu tối đa 1.000 điểm, trả lời đúng và nhanh hơn được xếp cao hơn; hết thời gian hoặc không chọn đáp án thì nhận 0 điểm. Chế độ offline chỉ giữ kết quả đã có, không phát lại câu chưa chọn khi kết nối lại.

### Chạy local

```bash
npm install
npm test
npm run test:scoring
npm run test:backend
npm run test:audio

# Terminal 1: Worker Durable Object + D1 local
npx wrangler dev --config presentation/workers/wrangler.toml --local --port 8787

# Terminal 2: Pages + Functions, trỏ binding QUIZ_ROOM vào Worker local
npx wrangler pages dev . --do QUIZ_ROOM=QuizRoom@quiz-room-worker --port 8788
```

Mở `http://127.0.0.1:8788/presentation/quiz/`. Nếu trình duyệt chặn autoplay, bấm nút bật âm thanh; quiz vẫn hoạt động và thông báo vẫn hiện bằng chữ. Audio cố định, nhạc nền và SFX được khai báo trong [`presentation/quiz/audio/LICENSE.md`](presentation/quiz/audio/LICENSE.md); bốn câu tiếng Việt hiện là asset tạm để thay sau.

### D1 và ranh giới deploy

Schema chuẩn là [`migrations/0001_quiz.sql`](migrations/0001_quiz.sql). Chạy local bằng Wrangler; chỉ áp dụng remote sau khi kiểm tra đúng database:

```bash
npx wrangler d1 migrations apply presentation-db --local
npx wrangler d1 migrations apply presentation-db --remote
```

Pages giữ binding `DB` cho presentation và khai báo binding ngoài `QUIZ_ROOM` tới Worker `quiz-room-worker`. Worker riêng là nơi sở hữu Durable Object SQLite; không nhúng vòng đời Durable Object vào Pages. Các API chính là `POST /api/quiz/rooms`, WebSocket `/api/quiz/rooms/:roomCode/socket`, `POST /api/score`, và `GET /api/leaderboard`.

Phase 3 chỉ khóa mã nguồn, migration, contract test và hướng dẫn deploy; chưa tự ý mutate tài khoản Cloudflare, chạy migration remote hay publish live. Khi sẵn sàng phát hành, Phase 4 sẽ deploy Worker trước, kiểm tra binding Pages, áp dụng migration remote, rồi mới công bố QR/link phòng.
