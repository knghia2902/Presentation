# Requirements: Bài Thuyết Trình — Quy Luật Phủ Định Của Phủ Định

**Defined:** 2026-09-22
**Core Value:** Bài thuyết trình rõ ràng, đồng nhất giữa slide và nội dung nói, mini game quiz giúp tương tác và ghi nhớ

## v1 Requirements

### Slide (SLIDE)

- [ ] **SLIDE-01**: 12 slide web-based sử dụng reveal.js với hiệu ứng zoom/pan giống Prezi
- [ ] **SLIDE-02**: Nội dung bám sát giáo trình Triết học Mác-Lênin 2021 (§748-761)
- [ ] **SLIDE-03**: Theme tối (dark academia), typography tiếng Việt đẹp
- [ ] **SLIDE-04**: Overview mode (xem toàn cảnh) và navigation trực quan
- [ ] **SLIDE-05**: Responsive — hiển thị tốt trên desktop và mobile
- [ ] **SLIDE-06**: Animation đường xoáy ốc minh họa quy luật

### Script nói (SCRP)

- [ ] **SCRP-01**: Script nói chi tiết cho từng slide, đồng nhất với nội dung trên slide
- [ ] **SCRP-02**: Thời lượng dự kiến cho mỗi slide (~20 phút tổng)
- [ ] **SCRP-03**: Ghi chú về ngữ điệu, nhấn mạnh, và thời điểm chuyển slide

### Quiz Webapp (QUIZ)

- [ ] **QUIZ-01**: 20 câu trắc nghiệm 4 đáp án (A/B/C/D) về nội dung quy luật
- [ ] **QUIZ-02**: Timer đếm ngược 30 giây cho mỗi câu
- [ ] **QUIZ-03**: Tính điểm: +10đ mỗi câu đúng, bonus thời gian
- [ ] **QUIZ-04**: Màn hình nhập tên → Quiz → Kết quả → Bảng xếp hạng
- [ ] **QUIZ-05**: Hiệu ứng confetti khi đúng, shake khi sai
- [ ] **QUIZ-06**: Responsive — chơi được trên điện thoại
- [ ] **QUIZ-07**: Giải thích đáp án sau mỗi câu

### Backend (BACK)

- [ ] **BACK-01**: Cloudflare Worker API lưu điểm (POST /api/score)
- [ ] **BACK-02**: API bảng xếp hạng top 20 (GET /api/leaderboard)
- [ ] **BACK-03**: Cloudflare D1 database lưu scores
- [ ] **BACK-04**: LocalStorage fallback khi offline

### Phản biện (ARGS)

- [ ] **ARGS-01**: 10-15 câu hỏi phản biện thường gặp với đáp án chi tiết
- [ ] **ARGS-02**: Trích dẫn giáo trình trong mỗi câu trả lời
- [ ] **ARGS-03**: Chiến lược trả lời cho từng dạng câu hỏi

### Deploy (DPLY)

- [ ] **DPLY-01**: Deploy slide + quiz lên Cloudflare Pages
- [ ] **DPLY-02**: Tạo Cloudflare D1 database cho leaderboard
- [ ] **DPLY-03**: URL có thể chia sẻ (QR code cho quiz)

## v2 Requirements

### Nâng cao

- **ADV-01**: Multiplayer realtime quiz (WebSocket)
- **ADV-02**: Thêm dạng câu hỏi Đúng/Sai, Điền từ
- **ADV-03**: Export slide sang PDF
- **ADV-04**: Dark/Light mode toggle
- **ADV-05**: Analytics — thống kê câu trả lời đúng/sai

## Out of Scope

| Feature | Reason |
|---------|--------|
| Ứng dụng mobile native | Web responsive đủ cho use case |
| Hệ thống đăng nhập | Quá phức tạp, chỉ cần nhập tên |
| Đa ngôn ngữ | Chỉ phục vụ lớp Việt |
| Video/audio nhúng | Focus nội dung text + animation |
| AI-generated content | Phải bám sát giáo trình chính thống |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SLIDE-01~06 | Phase 1 | Pending |
| SCRP-01~03 | Phase 2 | Pending |
| QUIZ-01~07 | Phase 3 | Pending |
| BACK-01~04 | Phase 3 | Pending |
| ARGS-01~03 | Phase 2 | Pending |
| DPLY-01~03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-22*
*Last updated: 2026-09-22 after initial definition*
