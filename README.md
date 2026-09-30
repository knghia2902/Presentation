# Quy Luật Phủ Định Của Phủ Định — Prezi Spatial Presentation

Bài thuyết trình không gian đa chiều (Prezi Infinite Spatial Canvas) về **Quy luật phủ định của phủ định** trong Triết học Mác–Lênin.

## Tính năng

- Điều hướng camera không gian qua các trạm kiến thức.
- Kéo thả, co giãn, xoay và sắp xếp các khung nội dung.
- Chỉnh sửa văn bản trực tiếp.
- Dán hoặc tải ảnh từ máy tính.
- Thêm, nhân bản và xóa trạm.
- Lưu dữ liệu cục bộ bằng LocalStorage/IndexedDB.
- Đồng bộ dữ liệu lên Cloudflare D1 qua `/api/presentation`.
- Chế độ trình chiếu toàn màn hình.

## Chạy cục bộ

Có thể mở trực tiếp `index.html` hoặc chạy Pages Functions:

```bash
npx wrangler pages dev .
```

## Triển khai Cloudflare Pages

- Framework preset: `None`
- Build command: để trống
- Build output directory: `.`

Nếu dùng lưu trữ đám mây, cấu hình binding D1 tên `DB` trỏ tới database `presentation-db`. Schema nằm trong `schema.sql`.
