---
status: testing
phase: 01-web-slide-prezi-style
source:
  - 01-SUMMARY.md
  - 02-SUMMARY.md
  - 03-SUMMARY.md
started: "2026-09-22T09:08:00.000Z"
updated: "2026-09-22T09:47:00.000Z"
---

## Current Test

number: 1
name: Mật độ lưới chấm (Dot-Grid) & Giao diện trình chiếu Present Mode
expected: |
  Mở file `presentation/slides/index.html` trong trình duyệt (hoặc nhấn Ctrl+F5 refresh).
  1. Nền canvas có mật độ chấm lưới (dot grid) dày, mịn và khoảng cách 11px chuẩn xác như Hình 1 bạn gửi.
  2. Bấm nút "Thuyết trình" ở góc trên bên phải: Toàn bộ thanh Topbar, Sidebar và Bottombar được ẩn đi, đưa màn hình về chế độ trình chiếu sạch sẽ giống hệt Hình 2.
  3. Cạnh phải xuất hiện cụm nút tròn đen nổi bật (Nút Home ngôi nhà để về toàn cảnh Overview, nút mũi tên chuyển trạm và nút X thoát).
  4. Người dùng có thể trình chiếu bằng cách bấm các nút này hoặc dùng phím mũi tên / phím Space / phím ESC một cách trực quan, mượt mà.
awaiting: user response

## Tests

### 1. Mật độ lưới chấm (Dot-Grid) & Giao diện trình chiếu Present Mode
expected: Mở file `presentation/slides/index.html` trong trình duyệt. Mật độ lưới chấm mịn đúng tỷ lệ 11px như Hình 1; khi bấm "Thuyết trình", giao diện chuyển sang chế độ toàn cảnh sạch sẽ với cụm nút tròn điều hướng bên phải giống hệt Hình 2.
result: [pending]

### 2. Tư liệu hình ảnh & Lớp texture bản thảo nghệ thuật
expected: Bản thảo bút tích tiếng Đức, vệt màu nước loang và giấy ghi chú cổ điển hiển thị rõ ràng, đi kèm chân dung các triết gia (Karl Marx, Hegel, tượng cổ điển), đồ họa tiến hóa và ví dụ thực tế phong phú.
result: [pending]

### 3. Tương tác Click-to-Zoom trực tiếp trên Canvas
expected: Khi đang ở góc nhìn toàn cảnh (Overview), click chuột trực tiếp vào bất kỳ thẻ bài học hoặc cụm chủ đề nào trên canvas thì camera sẽ tự động lao vào phóng to chính giữa thẻ đó.
result: [pending]

### 4. Sơ đồ đường xoáy ốc 3D trong không gian Prezi (Trạm 08)
expected: Khi di chuyển hoặc click vào Trạm 08 (Sơ đồ Xoáy ốc 3D), camera zoom sâu vào khung; sơ đồ xoáy ốc 3 vòng (A, B, A') vẽ nét sinh động theo thời gian, đi kèm các nhãn chú thích ý nghĩa triết học.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

[none yet]
