# Quiz Triết học

## What This Is

Webapp quiz realtime bằng tiếng Việt cho bài **Quy luật phủ định của phủ định** trong Triết học Mác–Lênin. Slide và phần trình chiếu được thực hiện trên Prezi bên ngoài; repository này chỉ phụ trách quiz.

## Core Value

Giúp lớp ôn và kiểm tra kiến thức nhanh qua phòng chơi realtime, chấm điểm theo độ đúng và tốc độ, có leaderboard rõ ràng.

## Validated Requirements

- 20 câu trắc nghiệm 4 đáp án.
- Timer và tối đa 1.000 điểm mỗi câu.
- Phòng host/player realtime qua WebSocket.
- Bảng xếp hạng theo phòng.
- Offline/reconnect và xử lý phiên phòng.
- Âm thanh, nhạc nền, SFX và voice cue có thể bật tắt.
- Responsive trên máy tính và điện thoại.
- Tiếng Việt hoàn toàn.
- Public hostname `quiz.natime.vn` qua Cloudflare Tunnel.

## Out of Scope

- Web slide/editor hoặc trình chiếu Prezi-style trong repository.
- Speaker notes và bộ phản biện.
- Hệ thống đăng nhập/xác thực tài khoản.
- Đa ngôn ngữ.
- Video/audio nhúng trong slide.
- AI-generated content.

## Technical Context

- **Frontend:** HTML/CSS/JavaScript tại `presentation/quiz/`.
- **Backend:** Cloudflare Pages Functions và SQLite-backed Durable Object.
- **Local:** Pages server `127.0.0.1:8788` và Worker local `127.0.0.1:8787`.
- **Public:** `https://quiz.natime.vn/` qua tunnel `quiz-natime`.
- **Nội dung:** Giáo trình Triết học Mác–Lênin 2021, phần §748–761.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Quiz là sản phẩm duy nhất của repository | Slide đã chuyển sang Prezi và không cần duy trì editor riêng |
| Dùng phòng realtime | Phù hợp hình thức host bắt đầu quiz và người chơi join bằng mã |
| Chấm điểm theo đúng + nhanh | Tạo động lực trả lời nhanh nhưng vẫn ưu tiên tính chính xác |
| Cloudflare Tunnel cho public access | Có hostname `quiz.natime.vn` mà không cần đổi kiến trúc local hiện tại |

---
*Last updated: 2026-09-28 after switching project scope to quiz-only.*
