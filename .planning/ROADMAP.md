# Roadmap: Bài Thuyết Trình — Quy Luật Phủ Định Của Phủ Định

**Created:** 2026-09-22
**Granularity:** Coarse (3-5 phases)
**Execution:** Parallel

## Milestone 1: v1.0 — Bài thuyết trình hoàn chỉnh + Mini Game

### Phase 1: Web Slide (Prezi-style)
**Goal:** Tạo 12 slide web-based với reveal.js, hiệu ứng giống Prezi, nội dung đúng giáo trình
**Requirements:** SLIDE-01, SLIDE-02, SLIDE-03, SLIDE-04, SLIDE-05, SLIDE-06
**Deliverables:**
- `presentation/slides/index.html` — 12 slide reveal.js (16.8KB, 283 lines)
- `presentation/slides/style.css` — Custom dark academia theme (10KB, 524 lines)
- `presentation/slides/script.js` — Animations + spiral diagram (6.8KB, 195 lines)
**Status:** ✅ Complete (2026-09-22)

---

### Phase 2: Nội dung nói + Phản biện
**Goal:** Tạo script nói đồng nhất với slide và bộ câu phản biện cho Q&A
**Requirements:** SCRP-01, SCRP-02, SCRP-03, ARGS-01, ARGS-02, ARGS-03
**Deliverables:**
- `presentation/speaker-notes.md` — Script nói chi tiết cho 12 slide
- `presentation/counter-arguments.md` — 10-15 câu phản biện + đáp án
**Dependencies:** Phase 1 (cần biết cấu trúc slide)
**Status:** Not Started

---

### Phase 3: Quiz Webapp + Backend
**Goal:** Tạo webapp quiz gamified 20 câu với timer, scoring, leaderboard
**Requirements:** QUIZ-01~07, BACK-01~04
**Deliverables:**
- `presentation/quiz/index.html` — Quiz UI
- `presentation/quiz/style.css` — Gamified styling
- `presentation/quiz/app.js` — Game logic
- `presentation/quiz/questions.json` — 20 câu hỏi
- `presentation/workers/api.js` — Cloudflare Worker
- `presentation/workers/schema.sql` — D1 schema
**Status:** Not Started

---

### Phase 4: Deploy + Tích hợp
**Goal:** Deploy toàn bộ lên Cloudflare Pages, tạo D1, QR code
**Requirements:** DPLY-01, DPLY-02, DPLY-03
**Deliverables:**
- Cloudflare Pages live site
- D1 database cho leaderboard
- QR code link quiz nhúng vào slide cuối
- `presentation/wrangler.toml` — Config
**Dependencies:** Phase 1, Phase 3
**Status:** Not Started

---

## Phase Summary

| Phase | Name | Requirements | Dependencies | Status |
|-------|------|-------------|-------------|--------|
| 1 | Web Slide (Prezi-style) | SLIDE-01~06 | None | ✅ Complete |
| 2 | Nội dung nói + Phản biện | SCRP-01~03, ARGS-01~03 | Phase 1 | Not Started |
| 3 | Quiz Webapp + Backend | QUIZ-01~07, BACK-01~04 | None | Not Started |
| 4 | Deploy + Tích hợp | DPLY-01~03 | Phase 1, 3 | Not Started |

**Parallel opportunities:** Phase 1 và Phase 3 có thể chạy song song (không phụ thuộc nhau).

---
*Roadmap created: 2026-09-22*
*Last updated: 2026-09-22 after initial creation*
