# Requirements: Quiz Triết học

**Defined:** 2026-09-22
**Last updated:** 2026-09-28
**Core Value:** Tạo một quiz realtime rõ ràng, nhanh và vui để lớp ôn kiến thức Triết học.

## v1 Requirements

### Quiz Webapp (QUIZ)

- [x] **QUIZ-01**: 20 câu trắc nghiệm 4 đáp án A/B/C/D
- [x] **QUIZ-02**: Timer cho mỗi câu
- [x] **QUIZ-03**: Tối đa 1.000 điểm mỗi câu; đúng và nhanh được xếp cao hơn
- [x] **QUIZ-04**: Host tạo phòng, player join bằng mã, host bắt đầu và kết thúc ván
- [x] **QUIZ-05**: Bảng xếp hạng theo phòng realtime
- [x] **QUIZ-06**: Responsive trên máy tính và điện thoại
- [x] **QUIZ-07**: Hiển thị đáp án đúng, giải thích và trạng thái trả lời
- [x] **QUIZ-08**: Offline/reconnect không làm mất phiên hợp lệ
- [x] **QUIZ-09**: Nhạc nền, SFX và voice cue có thể bật tắt

### Backend (BACK)

- [x] **BACK-01**: Pages Functions cho create/join/snapshot/score/leaderboard
- [x] **BACK-02**: Durable Object giữ trạng thái phòng và WebSocket realtime
- [x] **BACK-03**: SQLite-backed Durable Object lưu phòng, người chơi, câu trả lời và kết quả
- [x] **BACK-04**: Server-authoritative scoring và token xác thực phiên

### Public access (PUBLIC)

- [x] **PUBLIC-01**: Hostname `quiz.natime.vn` qua Cloudflare Tunnel
- [x] **PUBLIC-02**: Root `https://quiz.natime.vn/` hiển thị trực tiếp quiz
- [x] **PUBLIC-03**: Local development có thể chạy bằng Wrangler ở port 8788

## Out of Scope

| Feature | Reason |
|---------|--------|
| Web slide/editor hoặc trình chiếu Prezi-style | Đã chuyển sang Prezi bên ngoài repository |
| Speaker notes và bộ phản biện | Không thuộc sản phẩm quiz |
| Ứng dụng mobile native | Web responsive đủ cho use case |
| Hệ thống đăng nhập | Chỉ cần nhập tên và mã phòng |
| Đa ngôn ngữ | Chỉ phục vụ lớp Việt |
| AI-generated content | Nội dung bám giáo trình chính thống |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUIZ-01~09 | Phase 1 | Complete |
| BACK-01~04 | Phase 1 | Complete |
| PUBLIC-01~03 | Phase 2 | Complete |

**Coverage:** 15/15 requirements complete.
