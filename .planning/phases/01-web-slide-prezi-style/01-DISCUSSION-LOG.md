# Phase 1: Web Slide (Prezi-style) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-22
**Phase:** 1-Web Slide (Prezi-style)
**Areas discussed:** Cấu trúc 12 slide, Hiệu ứng Prezi, Sơ đồ đường xoáy ốc, Phong cách trình bày

---

## Cấu trúc 12 slide

### Bố cục tổng thể

| Option | Description | Selected |
|--------|-------------|----------|
| Kiểu giáo trình | 1 mở đầu, 10 nội dung theo thứ tự §748-761, 1 kết thúc | |
| Kiểu story | 1 mở, giới thiệu, 3-4 lý thuyết, 2-3 ví dụ, ý nghĩa, tổng kết, Q&A | ✓ |
| Kiểu tập trung | 2 mở+giới thiệu, 6 lý thuyết, 2 ví dụ, 2 kết luận | |

**User's choice:** "recommand đi" → Agent recommended kiểu story, user confirmed "OK, dùng bố cục này"

### Mật độ text

| Option | Description | Selected |
|--------|-------------|----------|
| Nhiều text | 4-6 ý gạch đầu dòng, bám sát giáo trình | |
| Ít text | 2-3 keyword + diagram/icon lớn | |
| Hỗn hợp | Slide lý thuyết nhiều text, slide ví dụ visual-first | ✓ |

**User's choice:** "recommand" → Agent recommended hỗn hợp

### Ngôn ngữ

| Option | Description | Selected |
|--------|-------------|----------|
| Tiếng Việt hoàn toàn | Kể cả tiêu đề, bullet | ✓ |
| Giữ thuật ngữ gốc | Tiêu đề Việt, từ khóa chuyên môn giữ gốc | |

**User's choice:** Tiếng Việt hoàn toàn

### Ví dụ minh họa

| Option | Description | Selected |
|--------|-------------|----------|
| Thêm ví dụ ngoài giáo trình | iPhone, công nghệ, xã hội | ✓ |
| Chỉ ví dụ trong giáo trình | Hạt lúa, chủ nghĩa Mác | |

**User's choice:** Có thêm ví dụ ngoài giáo trình cho sinh động

---

## Hiệu ứng Prezi

### Kiểu di chuyển

| Option | Description | Selected |
|--------|-------------|----------|
| Nested sections | Reveal.js mặc định, slide ngang/dọc + zoom | |
| Canvas tự do | r-frame-zoom plugin, slide bất kỳ vị trí | ✓ |

**User's choice:** Canvas tự do (giống Prezi hơn)

### Camera transition

| Option | Description | Selected |
|--------|-------------|----------|
| Bay thẳng | Camera bay thẳng giữa slide | |
| Bay qua trung tâm | Zoom ra toàn cảnh rồi zoom vào slide mới | |
| Hỗn hợp | Bay thẳng cùng nhóm, zoom ra khi chuyển nhóm | ✓ |

**User's choice:** "mình không rành, nhưng cần xịn, đỉnh" → Agent recommended hỗn hợp

### Overview mode

| Option | Description | Selected |
|--------|-------------|----------|
| Có overview | ESC xem toàn bộ slide dạng bản đồ | ✓ |
| Không cần | Chuyển tuần tự | |

**User's choice:** Có overview

### Tốc độ transition

| Option | Description | Selected |
|--------|-------------|----------|
| Mượt mà | 800-1000ms, ease-in-out | ✓ |
| Nhanh gọn | 400-500ms | |

**User's choice:** Mượt mà — cảm giác "bay" như Prezi

---

## Sơ đồ đường xoáy ốc

### Công nghệ

| Option | Description | Selected |
|--------|-------------|----------|
| SVG animation | SVG + CSS/SMIL animation, nhẹ đẹp | |
| Canvas + JS | JavaScript, step-by-step, mở rộng hơn | |
| CSS 3D transform | Perspective + rotateY, ấn tượng nhưng phức tạp | |
| Agent quyết định | Chọn cách ấn tượng nhất | ✓ |

**User's choice:** "Phức tạp hay nặng không quan trọng, miễn sao ấn tượng, xịn là được"

### Trigger animation

| Option | Description | Selected |
|--------|-------------|----------|
| Tự động chạy | Animation chạy khi vào slide | |
| Theo bước | Click/phím mũi tên hiện từng vòng | ✓ |

**User's choice:** Theo bước — sync với lời nói

### Số vòng xoắn

| Option | Description | Selected |
|--------|-------------|----------|
| 3 vòng | Khẳng định → Phủ định → Phủ định của phủ định | ✓ |
| 4+ vòng | Thêm vòng nhấn mạnh phát triển liên tục | |

**User's choice:** "Recommand" → Agent recommended 3 vòng (đúng chuẩn giáo trình)

---

## Phong cách trình bày

### Theme

| Option | Description | Selected |
|--------|-------------|----------|
| Dark academia chuẩn | Nền tối #1a1a2e, chữ cream/gold, font serif | ✓ |
| Dark modern | Nền đen, chữ trắng, sans-serif, minimalist | |
| Dark neon | Nền tối + accent neon, font hiện đại | |

**User's choice:** "Phong cách phù hợp với nội dung" → Agent recommended dark academia (phù hợp triết học)

### Font

| Option | Description | Selected |
|--------|-------------|----------|
| Be Vietnam Pro | Google Fonts, miễn phí, dấu tiếng Việt đẹp | ✓ |
| Inter/Source Sans Pro | Rộng hơn nhưng dấu Việt kém hơn | |

**User's choice:** Be Vietnam Pro

### Progress indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Progress bar | Thanh mỏng dưới cùng | ✓ |
| Số trang góc | Góc dưới phải | |
| Không cần | Prezi style không số trang | |

**User's choice:** "recommand" → Agent recommended progress bar (gold nhạt, đúng theme)

### Fragment animation

| Option | Description | Selected |
|--------|-------------|----------|
| Có fragment | Bullet xuất hiện từng cái khi click | ✓ |
| Không | Hiện hết cùng lúc | |

**User's choice:** "recommand" → Agent recommended có fragment (giúp tập trung cho nội dung trừu tượng)

---

## Agent's Discretion

- Công nghệ vẽ sơ đồ xoáy ốc — user ủy quyền chọn cách ấn tượng nhất
- Chi tiết r-frame-zoom plugin config — user không rành kỹ thuật
- Camera transition chi tiết — user yêu cầu "xịn, đỉnh"

## Deferred Ideas

None — discussion stayed within phase scope
