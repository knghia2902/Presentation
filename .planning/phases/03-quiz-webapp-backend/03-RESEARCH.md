# Phase 3: Quiz Webapp + Backend - Research

**Researched:** 2026-09-25
**Domain:** Static Vietnamese quiz client on Cloudflare Pages, Pages Functions, Durable Objects/WebSockets, D1 persistence, reconnect semantics, and browser TTS
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

None — the realtime room behavior and audio/voice requirements were explicitly brought into this Phase 3 discussion by the user.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUIZ-01 | 20 câu trắc nghiệm 4 đáp án A/B/C/D | DOCX extraction and question-data pattern; server keeps answer key authoritative. |
| QUIZ-02 | Timer đếm ngược 30 giây cho mỗi câu | Server-authoritative `questionStartedAt`/`deadlineAt`; clients render remaining time. |
| QUIZ-03 | Tính điểm theo locked 1,000-point time decay | Deterministic scoring formula and duplicate/late-answer guards. |
| QUIZ-04 | Nhập tên → Quiz → Kết quả → Leaderboard | Room state machine: lobby → question → reveal → finished. |
| QUIZ-05 | Confetti khi đúng, shake khi sai | CSS/native client effects triggered by authoritative result messages. |
| QUIZ-06 | Chơi được trên điện thoại | Separate static mobile-first quiz route and responsive touch controls. |
| QUIZ-07 | Giải thích đáp án sau mỗi câu | Reveal payload includes correct option and short explanation. |
| BACK-01 | Cloudflare Worker API lưu điểm | Pages Functions handle HTTP API; external Worker hosts the Durable Object and writes D1. |
| BACK-02 | GET leaderboard top 20 | D1 prepared query for global top 20; live room leaderboard comes from the room DO. |
| BACK-03 | D1 stores scores | Add versioned D1 migration beside the existing `presentations` table. |
| BACK-04 | LocalStorage fallback khi offline | Store only UI/session metadata and last snapshot; do not queue missed answers as valid submissions. |
</phase_requirements>

## Summary

The existing project is a static HTML/CSS/JS Cloudflare Pages application. `[VERIFIED: local files — .planning/PROJECT.md, wrangler.toml, functions/api/presentation.js, README.md]` It already uses a `DB` D1 binding, Pages Functions, LocalStorage, and IndexedDB fallback patterns, but there is no quiz route, no realtime worker, no package manifest, and no test infrastructure. `[VERIFIED: local files — targeted repository scan on 2026-09-25]`

Use one SQLite-backed Durable Object instance per room as the authoritative state machine and WebSocket fan-out layer. `[CITED: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/]` Bind that external Worker into the Pages project; Cloudflare explicitly documents that a Pages project can bind to a Durable Object but cannot create and deploy the Durable Object Worker inside the Pages project itself. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]` Keep D1 for durable completed results and global leaderboard queries, not for per-second room coordination. `[CITED: https://developers.cloudflare.com/d1/worker-api/d1-database/]`

Make the server authoritative for phase transitions, the shared 30-second clock, answer acceptance, score decay, duplicate prevention, host permissions, disconnect policy, and tie-break ordering. The client should render state, optimistically show local UI feedback only after a server result, and reconnect with a capability token. `[ASSUMED]` The strongest implementation fit is a small Pages Function proxy plus an external quiz-room Worker using the recommended hibernatable WebSocket API, because it preserves the current static app while giving each room a single coordination point. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/websockets/]`

**Primary recommendation:** Add `presentation/quiz/` as a standalone mobile-first client, add Pages Function HTTP/WebSocket proxy routes, deploy a separate `QuizRoom` Durable Object Worker, and use versioned D1 migrations for final scores and leaderboards; use pre-generated licensed audio for fixed phrases and browser `SpeechSynthesis` (`vi-VN`) for dynamic names/rankings.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Room lifecycle and host controls | API / Backend — `QuizRoom` Durable Object | Browser / Client | A single DO instance per room supplies serialized coordination for host/player commands. `[CITED: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/]` |
| Live participant state and broadcast | API / Backend — hibernatable WebSocket DO | Browser / Client | DO WebSockets are designed for multi-client room coordination; the browser only renders authoritative events. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/websockets/]` |
| Timer, answer acceptance, scoring, tie-break | API / Backend | Browser / Client | The server must use its own receipt time and reject late/duplicate answers; client timers are display-only. `[ASSUMED]` |
| Durable score and global leaderboard | Database / Storage — D1 | API / Backend | D1 is the existing bound SQL store and supports prepared statements; final writes belong behind backend validation. `[CITED: https://developers.cloudflare.com/d1/worker-api/prepared-statements/]` |
| Mobile quiz screens and effects | Browser / Client | CDN / Static | The repo is static HTML/CSS/JS and already contains reusable CSS visual conventions. `[VERIFIED: local files — presentation/slides/index.html, style.css, script.js]` |
| Fixed and dynamic Vietnamese voice | Browser / Client + CDN / Static | API / Backend | Fixed audio can be shipped as static assets; dynamic names/top-five speech should be synthesized at the client device. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance]` |

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Cloudflare Pages + Pages Functions | Existing project compatibility date `2024-09-22`; confirm current deployment behavior before deploy | Serve static quiz UI and HTTP proxy/API routes | Existing `wrangler.toml` and `functions/api/presentation.js` already use this model. `[VERIFIED: local files — wrangler.toml and functions/api/presentation.js]` Pages Functions expose bindings through `context.env`. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]` |
| Cloudflare Durable Objects, SQLite-backed `QuizRoom` | Platform API; use current Wrangler configuration syntax | One authoritative actor per room, WebSocket fan-out, room state, host pause/resume | Cloudflare recommends Durable Objects for strongly consistent coordination and recommends hibernatable WebSockets for idle cost efficiency. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/websockets/]` `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/]` |
| Cloudflare D1 via `DB` binding | Existing binding name `DB` | Final result persistence and top-20/global leaderboard queries | Existing config already binds `presentation-db` as `DB`; prepared statements with `bind()` are the documented SQL pattern. `[VERIFIED: local file — wrangler.toml]` `[CITED: https://developers.cloudflare.com/d1/worker-api/prepared-statements/]` |
| Browser WebSocket API | Built-in | Client room connection | It is broadly supported and exposes open/message/error/close events; use the standard API rather than non-standard `WebSocketStream`. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API]` |
| Browser Web Speech API | Built-in | Dynamic Vietnamese names and top-five announcements | `SpeechSynthesis` exposes voice discovery, queueing, cancelation, and `voiceschanged`; `SpeechSynthesisUtterance` exposes `lang`, `voice`, `rate`, and `volume`. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]` `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance]` |

### Supporting

| Tool / API | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| `vitest` [WARNING: package-legitimacy verdict SUS — human-verify before install] | Registry latest `5.0.2` on 2026-09-25 | Unit tests for scoring, state transitions, token/validation helpers | Use after creating a minimal package manifest; no test framework exists in the repo. `[CITED: https://developers.cloudflare.com/workers/testing/vitest-integration/]` |
| `@cloudflare/vitest-plugin` [WARNING: package-legitimacy verdict SUS — human-verify before install] | Registry latest `1.2.7` on 2026-09-25 | Run Workers/Pages tests inside the Workers runtime with local bindings | Use for D1 and Durable Object integration tests. `[CITED: https://developers.cloudflare.com/workers/testing/vitest-integration/]` |
| `wrangler` [WARNING: package-legitimacy verdict SUS — human-verify before install] | Registry latest `4.140.0` on 2026-09-25 | Local Pages/DO development, D1 migrations, deploy configuration | Use as a project-local dev dependency rather than relying on a global install. `[CITED: https://developers.cloudflare.com/d1/wrangler-commands/]` |
| Native CSS animations and `<audio>` / Web Audio controls | Built-in | Confetti, shake, background music, SFX, voice ducking | Keep visual/audio behavior dependency-free so it fits the current static app. `[VERIFIED: local files — presentation/slides/style.css uses CSS-driven visual styling]` `[ASSUMED]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|------------|----------|
| Durable Object WebSockets | Server-Sent Events plus POST answers | SSE is one-way from server to client, so it still needs a separate answer channel and lacks the single bidirectional room session. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events]` |
| External Durable Object Worker bound to Pages | Pages-only HTTP polling | It avoids a second Worker deployment but cannot provide the same low-latency bidirectional room coordination and requires repeated polling; it also conflicts with Cloudflare’s Pages/DO deployment boundary. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]` `[ASSUMED]` |
| Server-authoritative scoring | Client-posted score | Client-posted scores are forgeable and cannot enforce the locked timing/host rules. `[ASSUMED]` |
| Browser `SpeechSynthesis` for dynamic text | Ship generated audio for every possible player name | Dynamic audio generation increases asset size and latency; browser voice availability varies by device, so keep a visible text announcement and a mute/fallback path. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]` `[ASSUMED]` |

**Installation (only after `checkpoint:human-verify` for the SUS packages):**

```bash
npm install --save-dev wrangler vitest @cloudflare/vitest-plugin
```

**Version verification:** Registry checks on 2026-09-25 returned `vitest@5.0.2`, `@cloudflare/vitest-plugin@1.2.7`, and `wrangler@4.140.0`; all three had no `postinstall` script in the queried registry metadata. `[VERIFIED: npm registry]` The legitimacy seam classified all three `SUS` because the latest versions were published the same day; the planner must insert a human verification checkpoint before installation.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `vitest` | npm | Latest `5.0.2` published 2026-09-25 | 73,825,000/week | github.com/vitest-dev/vitest | `[SUS]` — too-new signal | Keep only as official-doc-supported test recommendation; planner adds `checkpoint:human-verify` before install |
| `@cloudflare/vitest-plugin` | npm | Latest `1.2.7` published 2026-09-25 | 254,276/week | github.com/cloudflare/workers-sdk | `[SUS]` — too-new signal | Keep only as official-doc-supported test recommendation; planner adds `checkpoint:human-verify` before install |
| `wrangler` | npm | Latest `4.140.0` published 2026-09-25 | 16,247,530/week | github.com/cloudflare/workers-sdk | `[SUS]` — too-new signal | Keep only as official-doc-supported CLI recommendation; planner adds `checkpoint:human-verify` before install |

**Packages removed due to `[SLOP]` verdict:** none.
**Packages flagged as suspicious `[SUS]`:** `vitest`, `@cloudflare/vitest-plugin`, `wrangler` — all require human verification before installation.

## Architecture Patterns

### System Architecture Diagram

```text
Mobile browser
  ├─ GET /quiz/ + questions/options/audio assets
  ├─ HTTP POST/GET via Pages Function (/api/quiz/*)
  └─ WSS /api/quiz/rooms/{roomCode}/socket
        ↓ Pages Function proxy + binding
External QuizRoom Worker
        ↓ idFromName(roomCode)
One SQLite-backed Durable Object per room
  ├─ lobby / question / reveal / finished / paused-host state
  ├─ host/player capability checks
  ├─ authoritative deadline + score/tie-break calculation
  ├─ hibernatable WebSocket broadcast
  └─ final result write
        ↓ prepared D1 statements
Existing D1 database (DB)
  ├─ quiz_rooms / quiz_players / quiz_answers
  └─ quiz_results / global top-20 query

Client reconnect path:
WebSocket close → mark UI disconnected → exponential retry → resume token
  → DO returns current state → missed answer is not replayed → next valid event continues
```

The diagram follows the Cloudflare deployment boundary: Pages can bind a Durable Object namespace, while the Durable Object Worker is separately deployed. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]`

### Recommended Project Structure

```text
presentation/
├── quiz/
│   ├── index.html          # Vietnamese host/player screens
│   ├── style.css           # mobile-first quiz UI, timer, effects
│   ├── app.js              # client state/render/reconnect/audio orchestration
│   ├── questions.json      # public question/options/explanations only; no trusted answer key
│   └── audio/              # fixed, license-cleared Vietnamese audio assets
├── workers/
│   ├── quiz-room.js        # external Worker + QuizRoom Durable Object
│   └── wrangler.toml       # Worker binding/export configuration
functions/api/quiz/
├── rooms.js                # create/join/room snapshot HTTP operations
├── socket.js               # WebSocket upgrade proxy to external DO
└── leaderboard.js          # D1 top-20 query
migrations/
└── 0001_quiz.sql           # versioned D1 schema; preserves presentations
tests/
├── scoring.test.js
├── quiz-room.test.js
└── quiz-api.test.js
```

The exact folder naming may follow the roadmap’s `presentation/workers/` deliverable, but the deployment must retain a separately deployable Worker for the DO. `[VERIFIED: local roadmap — .planning/ROADMAP.md]` `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]`

### Pattern 1: One Durable Object per Room

**What:** Normalize a six-character room code, derive a stable DO ID with `env.QUIZ_ROOM.idFromName(roomCode)`, and route all host/player commands for that room to the same stub. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]` `[CITED: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/]`

**When to use:** Always for this phase; it is the simplest way to make timer, phase, answer acceptance, and leaderboard ordering single-writer operations. `[ASSUMED]`

### Pattern 2: Server-Authoritative State Machine

Use explicit states `lobby`, `question`, `reveal`, `finished`, and `paused_host_disconnect`. Only the host capability can `start`, `next`, `setAutoAdvance`, `resume`, and `finish`; players can only `join`, `answer`, `resume`, and `leave`. `[ASSUMED]` Broadcast complete state snapshots or versioned events with `roomVersion`, `phase`, `questionIndex`, `questionStartedAt`, `deadlineAt`, and `serverNow`; the client never advances the phase on its own. `[ASSUMED]`

### Pattern 3: Deterministic Time-Decay Scoring

Use the Durable Object’s receipt time and a monotonic logical deadline, not a client timestamp. A recommended formula within the user’s discretion is:

```js
// Source basis: locked D-06/D-07/D-08; server authority is an implementation recommendation.
const QUESTION_MS = 30_000;
const elapsedMs = Math.max(0, Math.min(QUESTION_MS, receivedAt - questionStartedAt));
const score = isCorrect ? Math.max(0, Math.round(1000 * (QUESTION_MS - elapsedMs) / QUESTION_MS)) : 0;
```

Accept at most one answer per `(roomId, playerId, questionIndex)`, reject answers after `deadlineAt`, and persist `responseMs` for tie-break ordering. `[ASSUMED]` Recommended tie-break order is `totalScore DESC`, `totalResponseMs ASC`, then stable `playerSequence ASC` so simultaneous ties remain deterministic. `[ASSUMED]` Treat unanswered questions as zero score and add `QUESTION_MS` to the tie-break total; this makes missed questions consistently worse without granting a reconnecting player a retroactive answer. `[ASSUMED]`

### Pattern 4: Hibernatable WebSocket Session Metadata

```js
// Source: https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/
const pair = new WebSocketPair();
const [client, server] = Object.values(pair);
this.ctx.acceptWebSocket(server);
server.serializeAttachment({ playerId, reconnectToken });
return new Response(null, { status: 101, webSocket: client });

constructor(ctx, env) {
  super(ctx, env);
  for (const ws of this.ctx.getWebSockets()) {
    const attachment = ws.deserializeAttachment();
    if (attachment) this.sessions.set(ws, attachment);
  }
}
```

Cloudflare documents that hibernation can evict the object from memory while keeping clients connected, so constructor restoration must rebuild in-memory session maps from serialized attachments or durable storage. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/websockets/]`

### Pattern 5: Reconnect Without Answer Replay

```js
// Source basis: MDN WebSocket close handling plus locked D-14/D-16.
let retryMs = 500;
function connect() {
  const ws = new WebSocket(socketUrl);
  ws.addEventListener('open', () => {
    retryMs = 500;
    ws.send(JSON.stringify({ type: 'resume', reconnectToken }));
  });
  ws.addEventListener('close', () => {
    setTimeout(connect, retryMs);
    retryMs = Math.min(10_000, retryMs * 2);
  });
}
```

On `resume`, the DO should mark the player online and send the current snapshot. If the player was absent for a question, do not enqueue or fabricate an answer; resume from the next server event. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications]` `[ASSUMED]`

### Pattern 6: Voice Queue With Fallback

```js
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
function speakVietnamese(text, voices) {
  if (!('speechSynthesis' in window)) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.voice = voices.find(v => /^vi(-|_)/i.test(v.lang)) || null;
  utterance.rate = 0.95;
  utterance.volume = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
}
```

Populate voices after `voiceschanged`, lower background music volume while speaking, restore it on `end`/`error`, and always keep the announcement as visible text. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]` `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance]` `[ASSUMED]`

### Anti-Patterns to Avoid

- **Client-authoritative timer/score:** device clocks and manipulated payloads can change outcomes; use DO receipt time and server state. `[ASSUMED]`
- **Pages-only Durable Object deployment:** Cloudflare says the DO Worker cannot be created and deployed inside a Pages project. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]`
- **D1 as the live room bus:** D1 is persistent SQL, not the WebSocket fan-out/coordinator; keep per-room state in the DO and write final results to D1. `[CITED: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/]` `[ASSUMED]`
- **Broadcasting a timer tick every second:** send a deadline timestamp and render locally; repeated ticks increase traffic and can drift under mobile throttling. `[ASSUMED]`
- **Using `navigator.onLine` as proof of socket health:** MDN calls it inherently unreliable; use it only for hints and rely on WebSocket close/open plus a resume handshake. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine]`
- **Queueing offline answers:** this contradicts D-14 and can award points for answers never received while the question was live. `[VERIFIED: local context — 03-CONTEXT.md]`
- **Persisting the answer key in the public client bundle:** users can inspect static assets; keep trusted answer evaluation in the DO Worker module or another server-only asset. `[ASSUMED]`
- **Calling `blockConcurrencyWhile()` around every answer:** Cloudflare warns it blocks all other events and reduces throughput; use it for initialization/migrations, and use local SQLite operations/transactions for normal state changes. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/]`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Room coordination and fan-out | Global in-memory singleton, polling loop, or custom cross-request lock | One Durable Object per room with hibernatable WebSockets | DOs provide single-object coordination and platform WebSocket lifecycle handling. `[CITED: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/]` |
| Durable DB writes | Ad hoc string-concatenated SQL | D1 prepared statements with `bind()` and versioned migrations | Prepared binding is the documented injection-safe query shape, and migrations track applied schema changes. `[CITED: https://developers.cloudflare.com/d1/worker-api/prepared-statements/]` `[CITED: https://developers.cloudflare.com/d1/reference/migrations/]` |
| Cryptographic identity | Home-grown random token or hash scheme | Workers Web Crypto / `crypto.randomUUID()` plus opaque reconnect capability tokens | Platform crypto avoids predictable identifiers; Cloudflare’s WebSocket examples use UUID session identifiers. `[CITED: https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/]` |
| Browser TTS engine | Ship a custom speech engine or call a paid API for every name | Native `SpeechSynthesis` with `vi-VN` selection and visible-text fallback | It is built into supported browsers and supports voice discovery and utterance controls. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]` |
| Vietnamese fixed voice generation | Download an unreviewed “free TTS” model | Pre-generate only after reviewing Piper engine/model-card licenses; otherwise use browser speech | Piper’s official voice docs explicitly warn that model licenses vary. `[CITED: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md]` |
| Local Cloudflare runtime emulation | Mock all bindings by hand | Cloudflare’s Workers Vitest integration/Miniflare | The official integration runs tests locally with Workers runtime APIs and bindings. `[CITED: https://developers.cloudflare.com/workers/testing/vitest-integration/]` |

**Key insight:** The hard part is not rendering a quiz card; it is preserving one authoritative room timeline when mobile clients disconnect, reconnect, race to answer, or submit forged scores. Put that responsibility in the Durable Object and keep the browser as a projection of server state. `[ASSUMED]`

## Common Pitfalls

### Pitfall 1: Pages and Durable Object deployment are conflated

**What goes wrong:** The plan adds a Durable Object class under Pages Functions and expects Pages to deploy it. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]`
**Why it happens:** The current repo already deploys Pages Functions and the roadmap names `presentation/workers/api.js` without documenting the external Worker boundary. `[VERIFIED: local files — ROADMAP.md, wrangler.toml]`
**How to avoid:** Create a separately deployable Worker for `QuizRoom`, then bind it into Pages with `script_name`; include local two-process development and Phase 4 deployment tasks. `[CITED: https://developers.cloudflare.com/pages/functions/wrangler-configuration/]`
**Warning signs:** `wrangler.toml` has `pages_build_output_dir` but no external DO Worker config, or the Pages deployment has no DO binding after redeploy. `[VERIFIED: local file — wrangler.toml]`

### Pitfall 2: Timer drift changes scores

**What goes wrong:** Each client starts its own 30-second interval and submits its own elapsed time. `[ASSUMED]`
**Why it happens:** The UI timer is easy to implement locally, while background tabs and mobile throttling make client intervals non-deterministic. `[ASSUMED]`
**How to avoid:** DO emits `questionStartedAt`/`deadlineAt` and accepts answers only before the server deadline; client uses `performance.now()`/server offset only for display. `[ASSUMED]`
**Warning signs:** Two devices show different phase transitions or a late answer receives non-zero points. `[ASSUMED]`

### Pitfall 3: Host disconnect leaves the room in an impossible phase

**What goes wrong:** A host close event is treated as a player close, so the room keeps advancing or timer continues. `[VERIFIED: local context — D-15/D-16]`
**Why it happens:** Both roles share the same WebSocket transport. `[ASSUMED]`
**How to avoid:** Store role in server-side session metadata; on host disconnect transition to `paused_host_disconnect`, freeze deadline accounting, broadcast the Vietnamese waiting state, and resume only after the same host reconnect token is verified. `[ASSUMED]`
**Warning signs:** A player can advance while host is offline or a replacement browser can claim host controls. `[ASSUMED]`

### Pitfall 4: Duplicate/replayed answers

**What goes wrong:** Retries or double taps award two scores. `[ASSUMED]`
**Why it happens:** Mobile clients can send duplicate frames during a flaky connection. `[ASSUMED]`
**How to avoid:** Key answer acceptance by `(playerId, questionIndex)`, reject after first accepted submission, and return an idempotent result for repeats. `[ASSUMED]`
**Warning signs:** `quiz_answers` has multiple accepted rows for the same player/question or leaderboard totals exceed the 20-question maximum. `[ASSUMED]`

### Pitfall 5: Client answer key is trusted

**What goes wrong:** A participant edits `questions.json` or calls an endpoint with a forged score. `[ASSUMED]`
**Why it happens:** Static pages make all bundled JSON inspectable. `[ASSUMED]`
**How to avoid:** Keep `correctIndex` in the Worker’s trusted question data, validate answer choices against the current server question, and derive all score/result fields server-side. `[ASSUMED]`
**Warning signs:** POST bodies contain `score`, `isCorrect`, or `responseMs` accepted without recomputation. `[ASSUMED]`

### Pitfall 6: Offline detection is overconfident

**What goes wrong:** The UI disables a player or queues an answer solely because `navigator.onLine` changed. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine]`
**Why it happens:** Browser network heuristics can report LAN connectivity even when the server is unreachable. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine]`
**How to avoid:** Use `online`/`offline` only for a status hint; use WebSocket open/close/error and resume response as the source of truth. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications]`
**Warning signs:** A player is shown “online” while no server heartbeat/resume has succeeded. `[ASSUMED]`

### Pitfall 7: D1 schema is created on the request path

**What goes wrong:** Each API request runs `CREATE TABLE IF NOT EXISTS`, masking missing migrations and making deploy state hard to reproduce. `[VERIFIED: local file — functions/api/presentation.js uses this existing pattern]`
**Why it happens:** It is convenient in the current presentation endpoint. `[VERIFIED: local file — functions/api/presentation.js]`
**How to avoid:** Preserve the existing `presentations` table, add a versioned `migrations/0001_quiz.sql`, and apply local/remote migrations with Wrangler. `[CITED: https://developers.cloudflare.com/d1/reference/migrations/]`
**Warning signs:** Production works only after a request has “auto-created” tables or schema differs from the repository. `[ASSUMED]`

### Pitfall 8: Vietnamese voice works on one laptop only

**What goes wrong:** `getVoices()` is empty at initial load, no `vi-VN` voice exists, or autoplay policy blocks audio. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]` `[ASSUMED]`
**Why it happens:** Voice lists are device/browser dependent and may arrive through `voiceschanged`. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]`
**How to avoid:** Choose a `vi` voice when available, keep text visible, allow explicit “Bật âm thanh” interaction, and treat fixed audio assets as optional enhancement. `[ASSUMED]`
**Warning signs:** A blank announcement region, uncaught `speechSynthesis` error, or music that masks speech. `[ASSUMED]`

### Pitfall 9: Piper model license is assumed from engine license

**What goes wrong:** A GPL engine and a voice model are shipped without checking their separate terms. `[CITED: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md]`
**Why it happens:** The voice list looks like a single open-source package. `[ASSUMED]`
**How to avoid:** Record the exact engine commit/release and model-card license for every included `.onnx`/config pair; if unclear, do not ship the model and fall back to browser TTS. `[CITED: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md]`
**Warning signs:** A model is copied from a mirror without a model card or redistribution terms. `[ASSUMED]`

## Code Examples

### Pages binding to an external Durable Object

```toml
# Source: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
[[durable_objects.bindings]]
name = "QUIZ_ROOM"
class_name = "QuizRoom"
script_name = "quiz-room-worker"
```

The Pages Function should forward only the validated room path/request to the stub; it should not implement room state itself. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]`

### D1 prepared query

```js
// Source: https://developers.cloudflare.com/d1/worker-api/prepared-statements/
const { results } = await env.DB
  .prepare(`
    SELECT display_name, total_score, total_response_ms
    FROM quiz_results
    WHERE room_id = ?
    ORDER BY total_score DESC, total_response_ms ASC, player_sequence ASC
    LIMIT 20
  `)
  .bind(roomId)
  .all();
```

Use `bind()` for values, never string concatenation. `[CITED: https://developers.cloudflare.com/d1/worker-api/prepared-statements/]`

### Worker room endpoint

```js
// Source: https://developers.cloudflare.com/durable-objects/best-practices/websockets/
export class QuizRoom extends DurableObject {
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
}
```

The production version must add room/player authentication, session attachment restoration, message-size limits, phase validation, and `webSocketClose`/`webSocketError` handlers. `[CITED: https://developers.cloudflare.com/durable-objects/api/state/]` `[ASSUMED]`

### Fixed plus dynamic announcement policy

```js
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
const fixedAudio = {
  lobby: '/quiz/audio/room-ready.mp3',
  start: '/quiz/audio/quiz-start.mp3',
  timeout: '/quiz/audio/time-up.mp3',
  finish: '/quiz/audio/final-results.mp3'
};

function announceFastest(name) {
  const phrase = name
    ? `${name} trả lời đúng và nhanh nhất!`
    : 'Chưa có người trả lời đúng câu này.';
  return speakVietnamese(phrase, speechSynthesis.getVoices());
}
```

The server should send a structured announcement event; the client selects fixed audio or dynamic speech according to the locked D-18–D-20 policy. `[VERIFIED: local context — D-18/D-19/D-20/D-21]`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Standard non-hibernating DO WebSockets | Hibernatable WebSocket API with serialized attachments | Cloudflare current docs recommend hibernation; docs checked 2026-09-25 | Use `acceptWebSocket`, restore attachments in the constructor, and avoid per-connection in-memory assumptions. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/websockets/]` |
| Legacy DO `migrations` only | Declarative `exports` for new DO class lifecycle, with legacy migrations still supported | Current Wrangler docs checked 2026-09-25 | Choose one configuration style deliberately; do not mix `exports` and `migrations` in one Worker. `[CITED: https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/]` |
| Miniflare/unstable dev tests as the default | Workers Vitest integration with local runtime/bindings | Current Cloudflare testing docs checked 2026-09-25 | Plan binding-aware unit/integration tests instead of only browser smoke tests. `[CITED: https://developers.cloudflare.com/workers/testing/vitest-integration/]` |
| Request-path ad hoc D1 schema creation | Versioned D1 migration files | Current D1 migration docs checked 2026-09-25 | Add a reproducible migration for quiz tables while preserving `presentations`. `[CITED: https://developers.cloudflare.com/d1/reference/migrations/]` |

**Deprecated/outdated:**
- Do not start a new room design on the legacy non-hibernating WebSocket API unless a specific compatibility blocker is proven; Cloudflare marks hibernation as the recommended API. `[CITED: https://developers.cloudflare.com/durable-objects/best-practices/websockets/]`
- Do not use `WebSocketStream` for this phase; MDN describes it as non-standard with limited browser support. `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/WebSocketStream/close]`

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The score formula should be linear from 1,000 at 0 ms to 0 at 30,000 ms. | Pattern 3 | Planner could implement a formula the user did not intend; confirm in acceptance criteria. |
| A2 | Unanswered questions should add 30,000 ms to the cumulative response-time tie-break. | Pattern 3 | Final ranking can differ when totals tie. |
| A3 | The trusted question answer key can be packaged in the external Worker while public options/explanations remain in the static client. | Anti-patterns / project structure | A mismatch between public and trusted question data can invalidate results. |
| A4 | The external `QuizRoom` Worker can bind the same D1 database as the Pages project. | Standard stack / architecture | Deployment config may require a service/API handoff instead of direct DO→D1 writes. |
| A5 | Native browser `SpeechSynthesis` will provide an acceptable Vietnamese voice on the presentation devices. | Voice patterns | The app needs fixed-audio or text-only fallback if no `vi` voice exists. |
| A6 | The exact Wrangler `exports` configuration should be preferred for a new DO Worker. | State of the Art | Existing account/project conventions may require legacy `migrations`; verify during implementation. |
| A7 | CSS/native audio controls are sufficient for the requested confetti, shake, music, SFX, and ducking. | Supporting stack | A browser test may reveal the need for a small audio helper, but avoid adding it before evidence. |

## Open Questions

1. **Does Phase 3 need a global leaderboard beyond the current room?**
   - What we know: D-12 prioritizes the current room and permits a global top score. `[VERIFIED: local context — D-12]`
   - What’s unclear: Whether the project wants cross-room persistence in v1 or only the current-room leaderboard.
   - Recommendation: Implement current-room leaderboard as required; make global top-20 a separate D1 query only if BACK-02 is retained as a product-visible screen. `[ASSUMED]`

2. **What exact answer-time tie-break policy should be accepted?**
   - What we know: D-13 requires lower total response time to rank higher. `[VERIFIED: local context — D-13]`
   - What’s unclear: Whether unanswered questions count as 30 seconds or are excluded.
   - Recommendation: Use 30 seconds for unanswered questions and document it in tests so the ranking is deterministic; this is an agent-discretion recommendation. `[ASSUMED]`

3. **Which Vietnamese Piper voice can legally be redistributed for this class presentation?**
   - What we know: Official voice lists include `vi_VN` voices such as `25hours_single`, `vais1000`, and `vivos`, but the documentation says to review each model card because licenses vary. `[CITED: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md]`
   - What’s unclear: The exact model-card license and redistribution terms for the chosen voice asset.
   - Recommendation: Keep fixed audio generation as a gated asset task; if the model card is not unambiguously compatible, ship no model and use browser `SpeechSynthesis` plus visible text. `[ASSUMED]`

4. **Which DO configuration style matches the target Cloudflare account?**
   - What we know: Current docs prefer declarative `exports` for new classes, while legacy `migrations` remain supported and cannot be mixed with `exports`. `[CITED: https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/]`
   - What’s unclear: Whether Phase 4 deployment scripts or account state already standardize on legacy migrations.
   - Recommendation: Use one style consistently and verify with `wrangler deploy --dry-run`/account setup before committing deployment files. `[ASSUMED]`

5. **Does the static quiz need to expose explanations in the client?**
   - What we know: QUIZ-07 requires an explanation after each question, and the requested answer key must not be trusted from the client. `[VERIFIED: local REQUIREMENTS.md and phase context]` `[ASSUMED]`
   - What’s unclear: Whether explanations can be public before reveal.
   - Recommendation: Keep options and explanation in public question data only if early inspection is acceptable; otherwise send explanation in the server’s reveal event and keep the answer key server-only. `[ASSUMED]`

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Static JS tooling and Wrangler/Vitest | ✓ | `v25.8.2` | — |
| npm | Installing project-local dev tools | ✓ | `11.11.1` | — |
| Wrangler | Pages/DO local dev, D1 migrations, deploy checks | ✗ global command missing | — | Add project-local `wrangler` only after the SUS-package human checkpoint. |
| Cloudflare Pages project | Preview/deploy integration | Configured in repository, live availability not probed | `wrangler.toml` compatibility date `2024-09-22` | Local Pages dev with mocks until account binding is available. |
| D1 `presentation-db` / `DB` binding | Score persistence and leaderboard | Configured in `wrangler.toml`; remote access not verified | Database ID present in config | Local D1 binding through Wrangler after install. |
| External Durable Object Worker/namespace | Live room WebSocket | Not present in repository/config | — | Implement the Worker and local two-process binding before Phase 4. |
| Browser Vietnamese voice | Dynamic names/top-five voice | Not probeable from shell | Device-dependent | Visible text + fixed audio; optional browser TTS. |
| Test harness | Unit/integration validation | ✗ no package.json/config/tests found | — | Wave 0 creates package manifest/config/tests; packages are SUS-gated. |

**Missing dependencies with no fallback:** A real Cloudflare account/Pages binding and deployed external DO are required for production realtime integration; local mocks cannot prove remote binding/deployment behavior. `[ASSUMED]`

**Missing dependencies with fallback:** Global Wrangler is missing, but a project-local install is available after human verification; Vietnamese TTS model tooling is missing, but browser `SpeechSynthesis` and visible text provide a fallback. `[CITED: https://developers.cloudflare.com/pages/functions/bindings/]` `[CITED: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis]`

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest` `5.0.2` [SUS; human verify before install] + `@cloudflare/vitest-plugin` `1.2.7` [SUS; human verify before install] |
| Config file | None — Wave 0 must add Workers Vitest configuration |
| Quick run command | `npx vitest run tests/scoring.test.js tests/quiz-room.test.js` |
| Full suite command | `npx vitest run` |

Cloudflare recommends the Workers Vitest integration for Workers and Pages Functions, with local runtime APIs, bindings, isolated test-file storage, and Miniflare execution. `[CITED: https://developers.cloudflare.com/workers/testing/vitest-integration/]`

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUIZ-01 | Load exactly 20 questions, each with A/B/C/D and valid answer metadata | unit | `npx vitest run tests/questions.test.js` | ❌ Wave 0 |
| QUIZ-02 | Room starts a 30-second server deadline and clients render remaining time | unit/integration | `npx vitest run tests/quiz-room.test.js -t timer` | ❌ Wave 0 |
| QUIZ-03 | Correct score decays from 1,000 to 0; late/incorrect/unanswered score zero | unit | `npx vitest run tests/scoring.test.js` | ❌ Wave 0 |
| QUIZ-04 | Host/player state path reaches finished result and leaderboard | integration | `npx vitest run tests/quiz-room.test.js -t lifecycle` | ❌ Wave 0 |
| QUIZ-05 | Correct/success and incorrect/failure event classes trigger effects | browser smoke/manual | `npx vitest run tests/client-events.test.js` plus manual mobile check | ❌ Wave 0 |
| QUIZ-06 | Quiz controls remain usable at narrow phone viewport | browser/manual | `npx vitest run tests/client-contract.test.js` plus mobile browser UAT | ❌ Wave 0 |
| QUIZ-07 | Reveal event includes correct option and explanation | integration | `npx vitest run tests/quiz-room.test.js -t reveal` | ❌ Wave 0 |
| BACK-01 | HTTP score/result endpoint rejects invalid/forged payloads and persists valid result | integration | `npx vitest run tests/quiz-api.test.js` | ❌ Wave 0 |
| BACK-02 | Leaderboard returns top 20 in score/time order | integration | `npx vitest run tests/quiz-api.test.js -t leaderboard` | ❌ Wave 0 |
| BACK-03 | D1 migration creates quiz tables without changing `presentations` | integration | `npx vitest run tests/schema.test.js` | ❌ Wave 0 |
| BACK-04 | Local session snapshot survives API failure, but answer is not queued/replayed | unit/integration | `npx vitest run tests/offline.test.js` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/scoring.test.js tests/quiz-room.test.js`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green plus manual two-device host/player reconnect and mobile-audio checks before `$gsd-verify-work`.

### Wave 0 Gaps

- [ ] `package.json` with scripts and SUS-gated dev dependencies.
- [ ] `vitest.config.js` / Cloudflare plugin configuration.
- [ ] `tests/scoring.test.js` — covers D-06 through D-08 and QUIZ-03.
- [ ] `tests/quiz-room.test.js` — covers lifecycle, host controls, host pause, player disconnect, reconnect, and leaderboard.
- [ ] `tests/quiz-api.test.js` — covers validation, room capability checks, D1 reads/writes, and rate-limit response handling.
- [ ] `tests/questions.test.js` — covers the 20-question DOCX transcription and answer-key consistency.
- [ ] `tests/offline.test.js` — covers no answer replay after disconnect.
- [ ] Manual two-device or two-browser test script — WebSockets, host disconnect, resume token, timer pause, and current-room rankings.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | Limited/no account login | Use opaque room/player capability tokens; no username-only authority. `[ASSUMED]` |
| V3 Session Management | Yes | Short-lived/revocable host and reconnect tokens; bind token to room/player role; never trust a nickname as identity. `[ASSUMED]` |
| V4 Access Control | Yes | Enforce host-only commands in the DO; player commands may only answer once in the current question. `[ASSUMED]` |
| V5 Input Validation | Yes | Validate method, content type, JSON size, room-code shape, nickname length/characters, option enum, and message type before state changes. `[ASSUMED]` |
| V6 Cryptography | Yes | Use platform Web Crypto/random UUIDs for opaque identifiers; do not invent a custom PRNG or token hash. `[CITED: https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/]` |

### Known Threat Patterns for Cloudflare Pages + Durable Objects + D1

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Forged score or answer timestamp | Tampering | Ignore client score/time; recompute from DO receipt time and trusted question key. `[ASSUMED]` |
| Player invokes host command | Elevation of privilege | Role-bound capability token checked inside the DO for every command. `[ASSUMED]` |
| Duplicate answer/replay after reconnect | Tampering / Repudiation | Idempotency key `(playerId, questionIndex)` and server-side accepted-answer record. `[ASSUMED]` |
| XSS through Vietnamese nickname | Tampering | Store/display nickname as text, escape output, cap length, reject control characters, and never inject with `innerHTML`. `[ASSUMED]` |
| Room-code enumeration or join flood | Denial of service | Use random non-sequential codes, cap room/player count, reject closed rooms, and apply per-room/action rate limits. Cloudflare’s Rate Limiting API supports route/resource keys but is eventually consistent and not accounting-grade. `[CITED: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/]` |
| D1 injection | Tampering | Use prepared statements and `.bind()` for all values. `[CITED: https://developers.cloudflare.com/d1/worker-api/prepared-statements/]` |
| WebSocket message flood | Denial of service | Enforce message-size/type limits before parsing, rate-limit answers/commands, and close abusive sockets. `[ASSUMED]` |
| Answer-key extraction from static assets | Information disclosure | Keep trusted key in Worker-side data; public client receives only what the product permits. `[ASSUMED]` |

## Sources

### Primary (HIGH confidence)

- Cloudflare Durable Objects concepts — per-object coordination, strongly consistent storage, alarms: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/ `[CITED]`
- Cloudflare Durable Object WebSockets — hibernation, attachments, event handlers: https://developers.cloudflare.com/durable-objects/best-practices/websockets/ `[CITED]`
- Cloudflare Pages bindings — D1/DO bindings and the external DO Worker boundary: https://developers.cloudflare.com/pages/functions/bindings/ `[CITED]`
- Cloudflare D1 prepared statements: https://developers.cloudflare.com/d1/worker-api/prepared-statements/ `[CITED]`
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/ `[CITED]`
- Cloudflare Workers Vitest integration: https://developers.cloudflare.com/workers/testing/vitest-integration/ `[CITED]`
- MDN WebSocket client lifecycle: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications `[CITED]`
- MDN `navigator.onLine`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine `[CITED]`
- MDN SpeechSynthesis and utterance controls: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis and https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance `[CITED]`
- OHF-Voice Piper Vietnamese voice list and model-license warning: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md `[CITED]`

### Secondary (MEDIUM confidence)

- Local repository context and requirements: `.planning/phases/03-quiz-webapp-backend/03-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/PROJECT.md`, `.planning/STATE.md`, `README.md`, `wrangler.toml`, `schema.sql`, `functions/api/presentation.js`, `presentation/slides/index.html`, `presentation/slides/script.js`, `presentation/slides/style.css`. `[VERIFIED: local files]`
- DOCX question source: `C:/Users/Administrator/Downloads/Triết học Mác Lenin - Nhóm 8 - 20 câu hỏi.docx`; extracted 20 question blocks with A/B/C/D options and answer keys. `[VERIFIED: local DOCX extraction]`
- npm registry metadata for versions/downloads/postinstall status: `vitest@5.0.2`, `@cloudflare/vitest-plugin@1.2.7`, `wrangler@4.140.0`; legitimacy seam verdict `SUS` for each due to same-day “too-new” signal. `[VERIFIED: npm registry]`

### Tertiary (LOW confidence)

- No tertiary-only recommendation is used. Claims marked `[ASSUMED]` are implementation recommendations or unresolved product assumptions, not verified platform facts.

## Project Constraints (from AGENTS.md)

No `AGENTS.md` exists in the repository root, so there are no additional project-specific directives beyond the locked context, project constraints, and repository patterns listed above. `[VERIFIED: local file check]`

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — current official Cloudflare/MDN docs were checked, but Context7 was unavailable and the package-legitimacy seam flags current npm releases as SUS.
- Architecture: MEDIUM — the Pages/DO deployment boundary and hibernation model are official; room protocol details are implementation recommendations marked `[ASSUMED]`.
- Pitfalls: MEDIUM — deployment, D1, WebSocket, browser network, and TTS-license pitfalls are documented; mobile-device voice behavior still requires manual validation.

**Research date:** 2026-09-25
**Valid until:** 2026-10-25 for platform architecture; 2026-10-02 for package versions, browser voice availability, and Cloudflare CLI behavior.
