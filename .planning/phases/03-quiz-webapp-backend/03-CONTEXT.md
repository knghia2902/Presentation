# Phase 3: Quiz Webapp + Backend - Context

**Gathered:** 2026-09-25T16:31:48+07:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase này xây dựng webapp quiz realtime theo phòng cho 20 câu hỏi Triết học Mác-Lênin. Một người tạo phòng và điều khiển lượt chơi; những người khác tham gia bằng mã phòng, trả lời trên điện thoại và xem kết quả/leaderboard. Hệ thống bao gồm giao diện gamified, timer chung, tính điểm, hiệu ứng/âm thanh/voice, API lưu điểm và cơ chế xử lý mất kết nối. Không dùng tên thương hiệu “Kahoot” trong sản phẩm.

</domain>

<decisions>
## Implementation Decisions

### Luồng phòng và lượt chơi
- **D-01:** Quiz realtime theo phòng có mã tham gia; không dùng tên “Kahoot”.
- **D-02:** Một câu hỏi hiển thị trên mỗi màn hình.
- **D-03:** Người chơi chỉ chọn đáp án, không quay lại sửa câu.
- **D-04:** Chủ phòng tạo phòng và bắt đầu quiz; chủ phòng có thể bật chuyển câu tự động theo timer hoặc chuyển câu thủ công, và có thể kết thúc quiz.
- **D-05:** Sau mỗi lượt, hệ thống khóa câu hiện tại; người chơi không tự điều khiển việc chuyển câu.

### Timer, tính điểm và phản hồi
- **D-06:** Dùng một timer chung cho cả phòng, 30 giây cho mỗi câu.
- **D-07:** Một câu đúng có thể đạt tối đa 1.000 điểm; điểm giảm đều theo thời gian từ 1.000 về 0.
- **D-08:** Không chọn đáp án trước khi hết 30 giây thì nhận 0 điểm.
- **D-09:** Sau mỗi câu hiển thị đáp án đúng, giải thích ngắn và leaderboard tạm thời; sau đó hệ thống tự chuyển hoặc chủ phòng chuyển tiếp.

### Danh tính người chơi và leaderboard
- **D-10:** Người chơi chỉ nhập biệt danh, không cần tài khoản.
- **D-11:** Nếu biệt danh trùng, tự thêm hậu tố để phân biệt, ví dụ `Minh` và `Minh #2`.
- **D-12:** Ưu tiên leaderboard của phòng hiện tại; có thể lưu thêm top điểm chung.
- **D-13:** Nếu bằng tổng điểm, người có tổng thời gian trả lời nhanh hơn xếp trên.

### Mất kết nối và lưu dữ liệu
- **D-14:** Chỉ lưu các kết quả đã ghi nhận khi còn online; câu chưa chọn trước lúc mất kết nối bị bỏ qua và không tính điểm. Khi kết nối lại, người chơi tiếp tục các câu tiếp theo, không hồi phục điểm cho câu bỏ lỡ.
- **D-15:** Nếu chủ phòng mất kết nối, tạm dừng phòng và timer; người chơi thấy thông báo chờ chủ phòng kết nối lại.
- **D-16:** Nếu một người chơi mất kết nối, đánh dấu người đó offline nhưng phòng vẫn tiếp tục cho những người khác; câu bỏ lỡ của người đó tính 0 điểm.

### Âm thanh, hiệu ứng và voice
- **D-17:** Có nhạc nền nhẹ và hiệu ứng âm thanh cho các trạng thái đúng/sai/hết giờ; có nút bật/tắt nhạc và tự hạ âm lượng khi voice phát.
- **D-18:** Voice xuất hiện ở mở đầu phòng, bắt đầu quiz, hết giờ và kết quả cuối; không đọc khi chỉ chuyển câu.
- **D-19:** Sau mỗi câu chỉ đọc một câu ngắn báo người trả lời đúng và nhanh nhất, ví dụ: “Nguyễn Minh trả lời đúng và nhanh nhất!”. Nếu không ai đúng, dùng câu thông báo tương ứng.
- **D-20:** Khi kết thúc quiz, voice đọc top 5 người xếp hạng; không đọc top 5 sau từng câu.
- **D-21:** Ưu tiên cách kết hợp: audio tạo sẵn bằng model open-source/free cho câu cố định; `SpeechSynthesis` cho tên người chơi và top 5 động để giảm độ trễ. Planner/researcher được phép kiểm tra model/giấy phép và chọn phương án tương đương nếu phù hợp hơn.

### the agent's Discretion
- Chi tiết bố cục UI, màu sắc và cách thể hiện mã phòng miễn vẫn rõ trên điện thoại.
- Cách tạo mã phòng, giới hạn số người và cơ chế chống gửi điểm giả, miễn không yêu cầu đăng nhập.
- Công thức giảm điểm cụ thể theo từng mili-giây/giây, miễn câu đúng nhanh nhất đạt tối đa 1.000 và hết 30 giây không trả lời là 0.
- Cách triển khai realtime phù hợp với Cloudflare và codebase hiện tại, miễn chủ phòng/người chơi/mất kết nối tuân thủ các quyết định trên.
- Cách chọn model open-source/free và fallback voice, sau khi kiểm tra giấy phép, độ trễ và khả năng chạy với Cloudflare.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap, requirements and source content
- `.planning/ROADMAP.md` — Phase 3 goal, deliverables and phase dependencies.
- `.planning/REQUIREMENTS.md` — QUIZ-01~07 and BACK-01~04; note that realtime room and audio decisions below extend the original quiz scope.
- `.planning/PROJECT.md` — project constraints: HTML/CSS/JS, Cloudflare Pages + D1, Vietnamese UI, no login.
- `C:/Users/Administrator/Downloads/Triết học Mác Lenin - Nhóm 8 - 20 câu hỏi.docx` — source for the 20 quiz questions and answer key.

### Existing implementation and deployment patterns
- `presentation/slides/index.html` — existing presentation entry point and quiz-related visual hooks.
- `presentation/slides/script.js` — existing browser-side interaction, local persistence and presentation behavior patterns.
- `presentation/slides/style.css` — existing visual theme and quiz card styling.
- `functions/api/presentation.js` — existing Cloudflare Pages Function pattern for GET/POST with D1 binding `DB`.
- `wrangler.toml` — existing Pages/D1 configuration and `DB` binding.
- `schema.sql` — existing D1 schema pattern; quiz schema must coexist with the `presentations` table.
- `README.md` — existing Cloudflare Pages/D1 setup and LocalStorage/IndexedDB fallback guidance.

### Voice research references
- `https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis` — browser speech synthesis API for dynamic Vietnamese names and rankings.
- `https://github.com/diyism/piper_tts` — open-source/local TTS reference with a Vietnamese voice option; verify voice-model license before shipping.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `presentation/slides/script.js` already contains browser-side state and persistence logic; quiz state and fallback storage should follow the same defensive style where appropriate.
- `presentation/slides/style.css` contains the existing visual language and quiz-card styles that can be adapted without changing the Prezi presentation.
- `functions/api/presentation.js` provides a working Pages Function + D1 binding pattern for new quiz endpoints.

### Established Patterns
- The repository is a static HTML/CSS/JS Cloudflare Pages app with Pages Functions rather than a framework build.
- Existing persistence uses Cloudflare D1 with LocalStorage/IndexedDB fallback and explicit `DB` binding checks.
- User-facing content is Vietnamese and must remain responsive for phones.

### Integration Points
- Add quiz UI under `presentation/quiz/` as listed in the roadmap.
- Add quiz/realtime API or room handlers under the existing Pages Functions/Workers structure, preserving the `DB` binding convention.
- Extend D1 schema without breaking the existing `presentations` table.
- Phase 4 will deploy and expose the quiz URL/QR code, so Phase 3 should provide a stable route and documented API contract.

</code_context>

<specifics>
## Specific Ideas

- The desired interaction is similar to a host-led room quiz: one person creates a room and starts the game, while other participants join with a code and only answer.
- The product must not use the name “Kahoot”. Use neutral Vietnamese terms such as “Phòng chơi”, “Mã phòng”, “Chủ phòng” and “Người chơi”.
- Voice should be short and purposeful: announce the correct fastest respondent after each question, then read the top five only at the final result.

</specifics>

<deferred>
## Deferred Ideas

None — the realtime room behavior and audio/voice requirements were explicitly brought into this Phase 3 discussion by the user.

</deferred>

---

*Phase: 3-Quiz Webapp + Backend*
*Context gathered: 2026-09-25T16:31:48+07:00*
