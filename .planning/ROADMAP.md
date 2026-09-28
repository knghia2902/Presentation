# Roadmap: Quiz Triết học

**Created:** 2026-09-22
**Last updated:** 2026-09-28
**Scope:** Chỉ quiz realtime; phần slide/trình chiếu đã chuyển sang Prezi và không còn thuộc project này.

## Milestone 1: v1.0 — Quiz Triết học public

### Phase 1: Quiz Webapp + Backend

**Goal:** Quiz gamified 20 câu với timer, scoring, phòng realtime, âm thanh và leaderboard.

**Status:** ✅ Complete (2026-09-26)

**Deliverables:**

- `presentation/quiz/index.html` — Quiz UI
- `presentation/quiz/style.css` — Light responsive UI
- `presentation/quiz/app.js` — Client game logic, reconnect và audio
- `presentation/quiz/questions.json` — Question bank
- `presentation/workers/api.js` — Cloudflare Worker entrypoint
- `presentation/workers/quiz-room.js` — Durable Object room lifecycle
- SQLite storage của Durable Object — trạng thái phòng và kết quả local

### Phase 2: Public access

**Goal:** Public hóa quiz bằng Cloudflare Tunnel với hostname ổn định và root route hiển thị quiz.

**Status:** ✅ Complete (2026-09-28)

**Deliverables:**

- `quiz.natime.vn` — Public quiz hostname
- Cloudflare Tunnel `quiz-natime` — trỏ tới local Pages server `127.0.0.1:8788`
- Root route `https://quiz.natime.vn/` — phục vụ trực tiếp giao diện quiz
- `functions/_middleware.js` — route quiz theo hostname

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Quiz Webapp + Backend | ✅ Complete |
| 2 | Public access | ✅ Complete |

## Removed from scope

- Web slide/editor Prezi-style trong repository.
- Speaker notes và bộ phản biện trong repository.
- API lưu presentation và bảng dữ liệu `presentations`.
- Deploy/tích hợp slide và QR code vào slide.

Slide chính thức được thực hiện và trình chiếu trên Prezi bên ngoài project này.
