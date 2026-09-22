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
