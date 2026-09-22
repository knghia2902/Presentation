# Phase 1: Web Slide (Prezi-style) - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Tạo 12 slide web-based về "Quy luật phủ định của phủ định" (Triết học Mác-Lênin) dùng reveal.js với hiệu ứng Prezi (zoom/pan canvas tự do), theme dark academia, responsive. Nội dung bám sát giáo trình §748-761.

</domain>

<decisions>
## Implementation Decisions

### Cấu trúc 12 slide
- **D-01:** Bố cục kiểu story — 1 bìa, 1 dẫn nhập, lý thuyết xen kẽ ví dụ, ý nghĩa, tổng kết, Q&A
- **D-02:** Chi tiết bố cục:
  - Slide 1: Trang bìa — Tiêu đề + tên nhóm
  - Slide 2: Dẫn nhập — Vì sao cần hiểu phủ định?
  - Slide 3: Phủ định biện chứng — Khái niệm + 2 đặc trưng
  - Slide 4: Tính khách quan + Tính kế thừa
  - Slide 5: Kế thừa biện chứng
  - Slide 6: Phủ định của phủ định — Quá trình
  - Slide 7: Đường xoáy ốc (sơ đồ minh họa animation)
  - Slide 8: Ví dụ 1 — Hạt lúa (tự nhiên)
  - Slide 9: Ví dụ 2 — Xã hội/tư tưởng (+ ví dụ thực tế: iPhone, công nghệ)
  - Slide 10: 4 Ý nghĩa phương pháp luận
  - Slide 11: Tổng kết + Nhấn mạnh
  - Slide 12: Q&A + QR Code quiz
- **D-03:** Hỗn hợp text — slide lý thuyết có 3-4 bullet points, slide ví dụ/sơ đồ visual-first (ít chữ, hình lớn)
- **D-04:** Tiếng Việt hoàn toàn — kể cả tiêu đề, bullet, không giữ thuật ngữ gốc
- **D-05:** Thêm ví dụ thực tế ngoài giáo trình (iPhone, công nghệ, xã hội...) bên cạnh ví dụ chính thống

### Hiệu ứng Prezi
- **D-06:** Canvas tự do dùng r-frame-zoom plugin (KHÔNG dùng nested sections mặc định của reveal.js)
- **D-07:** Camera hỗn hợp — bay thẳng giữa slide cùng nhóm, zoom ra toàn cảnh khi chuyển nhóm lớn
- **D-08:** Overview mode bật — nhấn ESC xem bản đồ toàn bộ slide, click chọn slide
- **D-09:** Transition mượt 800-1000ms, ease-in-out, cảm giác "bay" như Prezi gốc

### Sơ đồ đường xoáy ốc
- **D-10:** Animation theo bước — click/phím mũi tên hiện từng vòng xoắn, sync với lời nói
- **D-11:** 3 vòng: Khẳng định → Phủ định → Phủ định của phủ định, mỗi vòng lên cao hơn
- **D-12:** Ưu tiên visual ấn tượng tối đa — phức tạp hay nặng không quan trọng

### Phong cách trình bày
- **D-13:** Dark academia chuẩn — nền tối (#1a1a2e), chữ cream/gold, phong cách nghiêm túc học thuật
- **D-14:** Font: Playfair Display cho tiêu đề, Be Vietnam Pro (Google Fonts) cho body tiếng Việt
- **D-15:** Progress bar thanh mỏng dưới cùng, màu gold nhạt
- **D-16:** Fragment animation — bullet xuất hiện từng cái khi click

### Agent's Discretion
- Công nghệ vẽ sơ đồ xoáy ốc: agent tự chọn cách ấn tượng nhất (SVG + CSS 3D + JS đều OK)
- Chi tiết cách triển khai r-frame-zoom plugin: agent tự cấu hình vị trí canvas tối ưu
- Chi tiết camera transition: agent chọn cách bay/zoom ấn tượng nhất

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Nội dung giáo trình
- `Tài liệu/7.2021. GIAO TRINH TRIET HOC MAC - LENIN (không chuyên).docx` — Giáo trình chính, §748-761 về Quy luật phủ định của phủ định
- `Tài liệu/Tài liệu triết Mac-leni - Quy luật phủ định của phủ định.pdf` — Tài liệu bổ sung (PDF scan, chưa đọc được text)

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — SLIDE-01~06 requirements cho phase này
- `.planning/ROADMAP.md` — Phase structure và deliverables

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Chưa có code nào — dự án mới hoàn toàn, greenfield

### Established Patterns
- Chưa có patterns — phase 1 sẽ thiết lập patterns cho các phase sau

### Integration Points
- Slide 12 sẽ chứa QR code link đến quiz (Phase 3 deliverable)
- Speaker notes (Phase 2) sẽ gắn vào các slide này

</code_context>

<specifics>
## Specific Ideas

- Phong cách Prezi gốc — camera bay tự do trên canvas, zoom mượt mà
- Đường xoáy ốc phải "xịn, đỉnh" — ấn tượng tối đa, không tiếc complexity
- Ví dụ thực tế gần gũi: iPhone (phát triển qua các thế hệ = phủ định của phủ định), công nghệ, xã hội
- Toàn bộ bài thuyết trình ~20 phút

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-Web Slide (Prezi-style)*
*Context gathered: 2026-09-22*
