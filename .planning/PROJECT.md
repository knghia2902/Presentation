# Bài Thuyết Trình — Quy Luật Phủ Định Của Phủ Định

## What This Is

Dự án tạo bộ tài liệu thuyết trình hoàn chỉnh về **Quy luật phủ định của phủ định** trong Triết học Mác-Lênin, phục vụ buổi thuyết trình trên lớp. Bao gồm web slide phong cách Prezi, mini game quiz 20 câu hỏi trên webapp, script nói cho từng slide, và câu phản biện cho Q&A. Đối tượng là lớp học tổng hợp nhiều trình độ.

## Core Value

Bài thuyết trình phải truyền tải rõ ràng nội dung quy luật phủ định của phủ định, đồng nhất giữa slide và nội dung nói, đồng thời mini game quiz giúp mọi người tương tác và ghi nhớ kiến thức.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Web slide 12 trang phong cách Prezi (reveal.js) với hiệu ứng zoom/pan
- [ ] Nội dung slide đúng theo giáo trình Triết học Mác-Lênin 2021
- [ ] Script nói (speaker notes) đồng nhất với từng slide
- [ ] Mini game quiz webapp với 20 câu trắc nghiệm 4 đáp án
- [ ] Timer đếm ngược, tính điểm, bảng xếp hạng realtime
- [ ] Responsive — chạy được trên điện thoại
- [ ] Deploy trên Cloudflare Pages + D1
- [ ] Câu phản biện chuẩn bị cho Q&A (10-15 câu)
- [ ] Tiếng Việt hoàn toàn

### Out of Scope

- Ứng dụng mobile native — web responsive là đủ
- Hệ thống đăng nhập/xác thực — chỉ cần nhập tên
- Đa ngôn ngữ — chỉ Tiếng Việt
- Video/audio nhúng trong slide — tập trung vào nội dung text + animation
- AI-generated content — dùng nội dung từ giáo trình chính thống

## Context

- **Nguồn tài liệu**: Giáo trình Triết học Mác-Lênin 2021 (không chuyên), phần §748-761
- **Nội dung đã trích xuất**: Phủ định biện chứng, tính khách quan, tính kế thừa, kế thừa biện chứng, đường xoáy ốc, quá trình phủ định của phủ định, 4 ý nghĩa phương pháp luận
- **Tài liệu bổ sung**: File PDF "Tài liệu triết Mac-leni" (scan, chưa đọc được text)
- **NotebookLM**: Đã tạo thử nội dung nhưng không đồng nhất giữa slide và script nói
- **Phong cách tham khảo**: Prezi.com — slide phi tuyến, zoom, pan

## Constraints

- **Tech stack**: HTML/CSS/JS (reveal.js), Cloudflare Workers + D1
- **Ngôn ngữ**: Tiếng Việt hoàn toàn
- **Nội dung**: Phải bám sát giáo trình Triết học Mác-Lênin 2021
- **Thiết bị**: Phải responsive cho mobile (quiz trên điện thoại)
- **Deploy**: Cloudflare Pages + D1 (user đã chọn)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dùng reveal.js cho slide | Thư viện JS tạo slide giống Prezi, miễn phí, mạnh mẽ | — Pending |
| Quiz offline-first (localStorage) + D1 backend | Đảm bảo hoạt động ngay cả khi chưa setup D1 | — Pending |
| Trắc nghiệm 4 đáp án | Phù hợp lớp tổng hợp nhiều trình độ | — Pending |
| Coarse granularity (3-5 phases) | Dự án nhỏ, không cần chia quá nhỏ | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-22 after initialization*
