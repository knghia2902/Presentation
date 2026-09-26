# Phase 3: Quiz Webapp + Backend - Pattern Map

**Mapped:** 2026-09-26  
**Files analyzed:** 24 planned/new-or-modified files (plus 9 existing analog files)  
**Analogs found:** 9 / 24 strong role/data-flow matches

## Scope and Reading Notes

- `03-CONTEXT.md` locks a host-led room quiz, one answer per question, server-controlled 30-second timer, offline/reconnect rules, and fixed-plus-dynamic Vietnamese voice.
- `03-RESEARCH.md` recommends a separate `QuizRoom` Durable Object Worker, Pages Function proxy routes, versioned D1 migrations, a static mobile-first client, and Workers Vitest integration.
- Existing code is a static HTML/CSS/JS app. There is no existing Durable Object, WebSocket server, quiz route, package manifest, migration directory, or test harness.
- The DOCX source is an input for `questions.json`/server answer data, not an existing code analog. Research records that it contains 20 A/B/C/D question blocks and answer keys.
- Existing `presentation.js` is intentionally permissive and auto-creates its table. Copy its D1/API mechanics, but do not copy its lack of room authentication or runtime schema creation for the quiz backend.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `presentation/quiz/index.html` | component/view | request-response + event-driven render | `presentation/slides/index.html` | role-match |
| `presentation/quiz/style.css` | component styling | event-driven UI state | `presentation/slides/style.css` | role-match |
| `presentation/quiz/app.js` | controller/store | streaming WebSocket + request-response + event-driven | `presentation/slides/script.js` | partial; no realtime analog |
| `presentation/quiz/questions.json` | static data/model | batch/static read | DOCX source; no JSON analog | none |
| `presentation/quiz/audio/*` | static media asset | file-I/O/media playback | image assets in `presentation/slides/assets/images/` | partial asset-match |
| `presentation/workers/quiz-room.js` | service/controller + Durable Object model | event-driven + streaming + CRUD | no Worker/DO analog | none |
| `presentation/workers/api.js` | external Worker entrypoint facade | deployment/request dispatch | no Worker entrypoint analog | roadmap compatibility path |
| `presentation/workers/questions.js` (if answer key is split out) | server-only model/data | batch/static read | no server question-bank analog | none |
| `presentation/workers/wrangler.toml` | config | deployment/binding | `wrangler.toml` | role-match |
| `functions/api/quiz/rooms.js` | route/controller | request-response + CRUD | `functions/api/presentation.js` | role-match |
| `functions/api/quiz/rooms/[roomCode]/socket.js` | route/proxy | streaming WebSocket upgrade | no WebSocket proxy analog | none |
| `functions/api/score.js` | route/controller | request-response + idempotent finalization | `functions/api/presentation.js` | role-match with stricter auth |
| `functions/api/leaderboard.js` | route/controller | request-response + CRUD/read | `functions/api/presentation.js` | role-match |
| `migrations/0001_quiz.sql` | migration | batch DDL + CRUD schema | `schema.sql` | role-match |
| `presentation/workers/schema.sql` | compatibility bootstrap schema | batch DDL | existing `schema.sql` | roadmap facade; migration parity tested |
| `wrangler.toml` (modify) | config | Pages + D1 + DO binding | existing `wrangler.toml` | exact config source |
| `package.json` | config/tooling | build/test command dispatch | no analog | none |
| `vitest.config.js` | config/test provider | test-runtime setup | no analog | none |
| `tests/scoring.test.js` | test | transform/batch | no test analog | none |
| `tests/quiz-room.test.js` | test | event-driven + streaming | no test analog | none |
| `tests/quiz-api.test.js` | test | request-response + CRUD | no test analog | none |
| `tests/questions.test.js` | test | batch/transform validation | no test analog | none |
| `tests/offline.test.js` | test | event-driven + request-response failure | `presentation/slides/script.js` persistence fallback | partial |
| `tests/client-events.test.js` | test | event-driven UI effects | `presentation/slides/script.js` class/state effects | partial |
| `tests/client-contract.test.js` | test | request-response/static client contract | `presentation/slides/index.html` | partial |
| `tests/schema.test.js` | test | migration/CRUD schema | `schema.sql` | role-match |
| `README.md` (update if Phase 3 documents API/setup) | documentation/config | request-response/deployment | existing README D1/Pages instructions | role-match |

`presentation/workers/questions.js` is an implied implementation seam, not a mandatory research filename. The planner may inline trusted answer data in `quiz-room.js`; if so, keep public `questions.json` free of the authoritative answer key.

## Pattern Assignments

### `presentation/quiz/index.html` (component/view, request-response + event-driven)

**Analog:** `presentation/slides/index.html`

**HTML/bootstrap pattern** (lines 1-15, 569-570):

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quy Luật Phủ Định Của Phủ Định — Triết Học Mác-Lênin</title>
  <link rel="stylesheet" href="style.css?v=20260924_v59">
</head>
<body class="prezi-app">
  ...
  <script src="script.js?v=20260925_v62"></script>
</body>
</html>
```

Copy the static route shape: `lang="vi"`, viewport meta, direct relative CSS/JS assets, semantic page root, and no framework bootstrap. Use a new quiz route and `app.js`, not the presentation script. Keep host and player screens as mutually exclusive state panels, with stable IDs/data attributes for `app.js`.

**Existing content mount pattern** (lines 143-147):

```html
<main class="prezi-viewport" id="prezi-viewport">
  <div class="prezi-world" id="prezi-world">
    <!-- Content is loaded dynamically ... -->
  </div>
</main>
```

Use the same explicit mount-point approach for lobby, question, reveal, finished, disconnected, and audio status regions. Do not rely on injected `innerHTML` for untrusted nicknames; set nickname/leaderboard text with `textContent`.

---

### `presentation/quiz/style.css` (component styling, event-driven UI state)

**Analog:** `presentation/slides/style.css`

**Typography and token pattern** (lines 12-47):

```css
:root {
  --bg-canvas: #f6f7f9;
  --frame-bg: #ffffff;
  --primary-accent: #1971c2;
  --gold-accent: #d4af37;
  --crimson-accent: #c92a2a;
  --text-main: #1f242e;
  --text-muted: #495057;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-main);
  background-color: var(--bg-canvas);
}
```

Reuse the Vietnamese font stack, CSS custom-property tokens, restrained dark-academia palette, rounded cards, and strong accent colors. The quiz may be visually more gamified, but it should remain compatible with this visual language.

**Card and state styling** (lines 1485-1508):

```css
.canvas-card {
  background: var(--frame-bg);
  border: 1px solid var(--frame-border);
  border-radius: 12px;
  padding: 26px 30px;
  box-shadow: var(--frame-shadow);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  position: relative;
}

.canvas-card.current-active {
  box-shadow: var(--frame-shadow-active);
  border-color: var(--primary-accent);
}
```

Adapt this to `.quiz-card`, `.answer-option`, `.leaderboard-row`, `.is-correct`, `.is-incorrect`, `.is-disabled`, and `.is-offline`. Add the required confetti/shake keyframes and respect reduced-motion if introduced; do not make animation the source of truth for scoring.

**Button/action pattern** (lines 3039-3050):

```css
.panel-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
```

Use explicit touch-sized answer buttons, visible focus/disabled states, and a mobile-first layout. The existing stylesheet has no real `@media` system, so the quiz must add its own narrow viewport rules rather than assume slide canvas sizing works on phones.

**Small entrance animation** (lines 2597-2615):

```css
.prezi-context-menu {
  animation: pzContextMenuFadeIn 0.12s ease-out;
}

@keyframes pzContextMenuFadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
```

Copy the short, class-driven animation style for result feedback. State classes should be removed/reapplied by `app.js`; server events remain authoritative.

---

### `presentation/quiz/app.js` (controller/store, streaming + request-response + event-driven)

**Analog:** `presentation/slides/script.js` — partial only; it supplies defensive browser state/persistence and DOM state patterns, not realtime networking.

**Toast/UI feedback pattern** (lines 3915-3926):

```js
function showToast(message) {
  let toast = document.querySelector('.prezi-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'prezi-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
```

Reuse `textContent` for connection/error/status notices and keep transient UI feedback separate from authoritative room state. Use structured message handlers such as `lobby`, `question`, `reveal`, `leaderboard`, `finished`, `paused_host_disconnect`, and `error`.

**Defensive local persistence pattern** (lines 6148-6222):

```js
let d1SyncTimer = null;
let _contentLoaded = false;

async function saveEditsToStorage() {
  if (!_contentLoaded) return;

  try {
    localStorage.setItem('prezi_saved_world_content', content);
    localStorage.setItem('prezi_saved_timestamp', String(saveTimestamp));
  } catch (err) {
    console.warn('LocalStorage quota limit reached, relying on IndexedDB and D1', err);
  }

  try {
    await saveToIndexedDB('world_backup', { content, timestamp: saveTimestamp });
  } catch (err) {
    console.warn('IndexedDB save warning:', err);
  }

  clearTimeout(d1SyncTimer);
  d1SyncTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, cardsLayout: layout, clientTimestamp: saveTimestamp })
      });
      ...
    } catch (e) {
      // Offline or running without Pages Functions
    }
  }, 500);
}
```

For the quiz, persist only session metadata/snapshot: room code, role, player ID, reconnect token, last authoritative room version, and audio preference. Never queue/replay an answer after disconnect; that would violate D-14. WebSocket `open`/`close` and resume handshake, not `navigator.onLine`, determine socket health.

**D1/local/IndexedDB freshness pattern** (lines 6273-6355):

```js
try {
  const res = await fetch('/api/presentation');
  ...
} catch (e) {
  // Offline fallback
}

localContent = localStorage.getItem('prezi_saved_world_content');
const idbData = await loadFromIndexedDB('world_backup');
// Compare timestamps to choose the newest content
```

Use the same try/catch-first fallback posture, but treat the server snapshot as authoritative when reconnecting. A stale local snapshot may restore the shell/session UI, never scores or missed answers.

**Important client boundary:** The client renders `deadlineAt`/`serverNow`, but must not advance phases, calculate trusted scores, or decide that an answer was accepted. It sends commands and renders server events.

---

### `presentation/quiz/questions.json` (static data, batch/static read)

**Analog:** none in codebase. Source is `C:/Users/Administrator/Downloads/Triết học Mác Lenin - Nhóm 8 - 20 câu hỏi.docx` and the research extraction.

Use a stable public shape such as:

```json
{
  "version": 1,
  "questions": [
    {
      "id": "q01",
      "prompt": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "explanation": "..."
    }
  ]
}
```

The test must assert exactly 20 records, all four options, stable IDs, Vietnamese text, and consistency with the DOCX. Do not put the trusted `correctOption` in a public asset if the room Worker is intended to be authoritative; keep it in a server-only module or derive the reveal from the Worker question bank.

---

### `presentation/workers/quiz-room.js` (Durable Object service/controller, streaming + event-driven + CRUD)

**Analog:** none in repository. Use the research pattern, not `functions/api/presentation.js`, for coordination.

**Worker WebSocket skeleton from research** (`03-RESEARCH.md` lines 404-421):

```js
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

Production additions required by this phase:

- One DO ID per normalized six-character room code.
- Explicit `lobby`, `question`, `reveal`, `finished`, and `paused_host_disconnect` states.
- Host-only `start`, `next`, `setAutoAdvance`, `resume`, and `finish`; players may join/answer/resume/leave.
- Server-owned `questionStartedAt`, `deadlineAt`, `roomVersion`, and `serverNow` in snapshots.
- One accepted answer per `(roomId, playerId, questionIndex)`; reject late/duplicate/invalid options.
- Score calculated from DO receipt time, not client timestamps or posted scores.
- Hibernation-safe `serializeAttachment({ playerId, reconnectToken })` and constructor restoration via `getWebSockets()`/`deserializeAttachment()`.
- `webSocketClose`/`webSocketError` marking a player offline; host close pauses the room and timer.
- Final result write to D1; live room leaderboard stays in DO memory/storage.

**Recommended scoring excerpt** (`03-RESEARCH.md` lines 214-221):

```js
const QUESTION_MS = 30_000;
const elapsedMs = Math.max(0, Math.min(QUESTION_MS, receivedAt - questionStartedAt));
const score = isCorrect
  ? Math.max(0, Math.round(1000 * (QUESTION_MS - elapsedMs) / QUESTION_MS))
  : 0;
```

Tie-break ordering should be deterministic: `totalScore DESC`, `totalResponseMs ASC`, then stable player sequence. Treat unanswered questions as zero score and 30 seconds for tie-break unless planning resolves this differently.

---

### `presentation/workers/questions.js` (optional server-only model, batch/static read)

**Analog:** none. If created, export the trusted answer key and explanation data used by `QuizRoom`; do not import the public JSON as the security source. Keep the question ID/order shared and test both public and trusted datasets for one-to-one consistency.

---

### `presentation/workers/wrangler.toml` and `wrangler.toml` (config, deployment/binding)

**Analog:** existing root `wrangler.toml`, lines 1-8:

```toml
name = "presentation"
compatibility_date = "2024-09-22"
pages_build_output_dir = "."

[[d1_databases]]
binding = "DB"
database_name = "presentation-db"
database_id = "97579f7a-6737-42e7-88a2-51d2e35e066e"
```

Preserve `DB` and `presentation-db`. The Pages config needs the external DO binding described in research (`03-RESEARCH.md` lines 374-384):

```toml
[[durable_objects.bindings]]
name = "QUIZ_ROOM"
class_name = "QuizRoom"
script_name = "quiz-room-worker"
```

The separate Worker config must declare the DO class and its chosen migration/`exports` style consistently; do not mix legacy `migrations` and declarative `exports` in one Worker config. Verify the deployment boundary in Phase 4.

The Worker implementation remains in `quiz-room.js`; `presentation/workers/api.js` is the roadmap-required entrypoint facade and is the `main` target for `quiz-room-worker`. The Pages Function routes forward to that external Worker through `QUIZ_ROOM`; they do not own Durable Object state.

---

### `functions/api/quiz/rooms.js` (route/controller, request-response + CRUD)

**Analog:** `functions/api/presentation.js`

**Pages Function shape and binding guard** (lines 7-21):

```js
export async function onRequestGet(context) {
  const { env } = context;
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cloudflare D1 binding (DB) is not yet configured.',
        isConfigured: false
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    ...
  } catch (err) {
    ...
  }
}
```

Keep `context.env`, `Response(JSON.stringify(...))`, JSON content type, and explicit catch-to-500 formatting. For quiz routes, add strict method/path/body validation, room-code normalization, nickname limits, capability-token checks, JSON-size limits, and rate limiting. A room create/join request should forward validated input to the room DO; it should not duplicate room state in the Pages Function.

**Caution:** The analog allows `Access-Control-Allow-Origin: *` and no authentication because it is a presentation editor endpoint. Room/host/player capability checks belong in the DO on every command; do not treat nickname as identity.

---

### `functions/api/quiz/rooms/[roomCode]/socket.js` (route/proxy, streaming WebSocket upgrade)

**Analog:** no WebSocket proxy exists. Use the Pages Function conventions from `functions/api/presentation.js` for response/error formatting, but forward the validated room path to the `QUIZ_ROOM` stub from `env`.

The proxy must preserve the WebSocket upgrade and capability token, reject malformed room codes, and avoid implementing the state machine itself. Research explicitly assigns the path `WSS /api/quiz/rooms/{roomCode}/socket` to Pages proxy → external `QuizRoom` Worker → one DO per room.

---

### `functions/api/score.js` and `functions/api/leaderboard.js` (route/controller, request-response + CRUD/read)

**Analog:** `functions/api/presentation.js`, especially its prepared D1 read (lines 34-36):

```js
const record = await env.DB.prepare(
  'SELECT id, content, cards_layout, updated_at FROM presentations WHERE id = ?'
).bind('main').first();
```

Use `env.DB.prepare(...).bind(...).all()`/`.first()` and JSON response envelopes. Research gives the target ordering (`03-RESEARCH.md` lines 386-402):

```js
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

Never concatenate room IDs or nicknames into SQL. Decide whether this endpoint is current-room or global top 20, but keep the query bounded to 20 and return stable rank/tie-break fields.

---

### `migrations/0001_quiz.sql` and `presentation/workers/schema.sql` (migration/bootstrap schema, batch DDL + CRUD schema)

**Analog:** `schema.sql`, lines 1-8:

```sql
-- Cloudflare D1 Database Schema for Prezi Presentation
CREATE TABLE IF NOT EXISTS presentations (
  id TEXT PRIMARY KEY,
  content TEXT,
  cards_layout TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Preserve `presentations` and add quiz tables in a versioned migration rather than copying `presentation.js`'s runtime `CREATE TABLE`. The research responsibility map implies room/player/answer/result records; the planner should choose indexes/constraints for room ID, player ID, question index, idempotency, score, and response time. `tests/schema.test.js` must prove the existing table still exists and the new migration is repeatable.

---

### `package.json` and `vitest.config.js` (config/tooling, test-runtime setup)

**Analog:** none. Research reports no package manifest or test infrastructure. Create the smallest project-local setup needed for Wrangler + Vitest + Cloudflare plugin, subject to the research checkpoint that the currently reported package versions were flagged `SUS` because they were published very recently.

The config should make the quick command and full command explicit:

```text
npx vitest run tests/scoring.test.js tests/quiz-room.test.js
npx vitest run
```

Keep Pages and DO runtime bindings available to integration tests; do not hide D1/DO tests behind browser-only mocks.

---

### `tests/scoring.test.js` (test, transform/batch)

**Analog:** no existing test file. Extract the pure scoring function from the DO into a testable seam, then cover: 0 ms correct = 1,000; midpoint decay; deadline/late answer = 0; incorrect = 0; unanswered = 0; duplicate answer rejected; response time retained for tie-break.

Use deterministic timestamps and table-driven cases. This is the smallest fast test and should run on every task commit.

---

### `tests/quiz-room.test.js` (test, event-driven + streaming)

**Analog:** no existing test file. Use Workers Vitest/DO runtime patterns from research. Cover the complete host/player protocol: create/join, host start, 30-second question snapshot, one answer, reveal payload with explanation, auto/manual next, final top five, host disconnect pause/resume, player offline marking, reconnect snapshot, no answer replay, host-only commands, duplicate/late rejection, and deterministic leaderboard order.

Prefer assertions on authoritative messages/state rather than exact timer tick counts. Test that a deadline timestamp is sent once and clients calculate display countdown locally.

---

### `tests/quiz-api.test.js` (test, request-response + CRUD)

**Analog:** `functions/api/presentation.js` response and D1 patterns, but no existing test analog.

Cover room create/join/snapshot, WebSocket proxy validation, leaderboard top 20, malformed body/content type, invalid room code/nickname/option, forged score/time, missing capability token, rate-limit response, and D1 prepared-statement behavior. Assert JSON shape/status instead of implementation details.

---

### `tests/questions.test.js` (test, batch/transform)

**Analog:** no existing test file. Treat the DOCX transcription as source data and assert exactly 20 questions, A/B/C/D completeness, unique IDs, non-empty Vietnamese prompts/explanations, valid correct-option metadata in the server-only dataset, and public/trusted question ID/order parity.

---

### `tests/offline.test.js` (test, event-driven + request-response failure)

**Analog:** `presentation/slides/script.js` lines 6148-6355 for defensive local persistence and fetch fallback.

Test that room/session metadata survives a failed API/socket attempt, then a reconnect sends the resume token and receives current state; test explicitly that an answer made while disconnected is not stored in an offline queue and is never replayed for credit.

---

### `tests/client-events.test.js` and `tests/client-contract.test.js` (tests, event-driven/static client)

**Analogs:** `presentation/slides/script.js` class toggles/DOM state and `presentation/slides/index.html` stable DOM hooks.

`client-events.test.js` should verify authoritative `correct`, `incorrect`, `timeout`, `reveal`, and `finished` events toggle visual classes, play the correct optional audio cue, and update visible text/voice announcement without trusting client score. `client-contract.test.js` should verify the quiz HTML contains the required panels, answer controls, timer/status/leaderboard/audio controls, and that narrow viewport controls remain usable.

---

### `tests/schema.test.js` (test, migration/CRUD)

**Analog:** `schema.sql` and `wrangler.toml`.

Apply the migration to a test D1 database, assert `presentations` remains intact, assert quiz tables/indexes exist, and verify the leaderboard query returns `total_score DESC`, `total_response_ms ASC`, `player_sequence ASC`, limited to 20.

---

### `README.md` (optional Phase 3 update, documentation/config)

**Analog:** existing README lines 5, 16, 33-52, and 62-66.

```text
Hỗ trợ lưu trữ ... Cloudflare D1 ... LocalStorage + IndexedDB ... Cloudflare Pages.
...
Cloudflare Pages Functions (`/api/presentation`).
...
npx wrangler pages dev .
...
LocalStorage + IndexedDB
```

If updated in this phase, preserve the Vietnamese deployment style and add the quiz route, Pages/DO deployment boundary, `QUIZ_ROOM` binding, migration command, local test commands, and the no-answer-replay/reconnect limitation. Do not document the quiz as Pages-only if it requires the separately deployed DO Worker.

## Shared Patterns

### 1. Vietnamese static client and visual language

**Sources:** `presentation/slides/index.html:1-15,569-570`, `presentation/slides/style.css:12-47,1485-1508`  
**Apply to:** quiz HTML, CSS, app-rendered copy, fixed voice phrases.

- Keep `lang="vi"`, mobile viewport metadata, relative static assets, Be Vietnam Pro/Playfair-compatible typography, CSS tokens, rounded cards, clear accent states, and concise Vietnamese labels.
- Do not use the forbidden brand name in visible UI; use “Phòng chơi”, “Mã phòng”, “Chủ phòng”, “Người chơi”.

### 2. Pages Function response/error envelope

**Source:** `functions/api/presentation.js:7-21,78-89,92-153,156-164`  
**Apply to:** `functions/api/quiz/*.js`.

```js
return new Response(JSON.stringify({
  success: false,
  error: err.message
}), {
  status: 500,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});
```

Keep consistent JSON and OPTIONS handling, but add strict quiz validation and capability checks. Do not assume `*` CORS is appropriate if deployment later needs a narrower origin.

### 3. D1 prepared statements and existing binding

**Sources:** `wrangler.toml:1-8`, `schema.sql:1-8`, `functions/api/presentation.js:34-36,123-130`  
**Apply to:** Worker final-result writes, leaderboard route, migrations, API tests.

```js
await env.DB.prepare(
  'SELECT id, content, cards_layout, updated_at FROM presentations WHERE id = ?'
).bind('main').first();
```

Retain binding name `DB`; use `.prepare(...).bind(...)` for every dynamic value. Keep `presentations` untouched and put quiz schema in a versioned migration. Runtime auto-DDL from the presentation endpoint is not the migration pattern to copy.

### 4. Local fallback is metadata-only for realtime quiz

**Source:** `presentation/slides/script.js:6148-6355`  
**Apply to:** `presentation/quiz/app.js`, `tests/offline.test.js`.

Persist session shell/preferences defensively with `try/catch`; use reconnect handshake to restore authoritative room state. Never persist a pending answer for later replay. `navigator.onLine` may be a hint only; WebSocket close/open is the actual transport signal.

### 5. Server-authoritative room protocol

**Source:** `03-RESEARCH.md:200-262` (no repository analog)  
**Apply to:** `quiz-room.js`, `socket.js`, `rooms.js`, `app.js`, room tests.

The DO owns phase, deadline, accepted answer, score, host permission, connection status, and leaderboard. Clients send commands and render versioned snapshots/events. Use serialized WebSocket attachments for hibernation and a resume token for reconnects.

### 6. Audio/voice layering

**Sources:** `03-CONTEXT.md:D-17–D-21`, `03-RESEARCH.md:264-281,423-442` (no repository audio analog)  
**Apply to:** `presentation/quiz/audio/*`, `app.js`, `client-events.test.js`.

- Fixed phrases: shipped pre-generated/licensed assets for lobby/start/timeout/final result, with LICENSE.md covering every audio file.
- D-17 media: shipped light looping background music plus distinct correct, incorrect, and timeout SFX, all routed through the Web Audio music/SFX buses.
- Dynamic phrases: `SpeechSynthesisUtterance` with `lang = 'vi-VN'`, prefer a `vi` voice, cancel prior utterance, and keep visible text fallback.
- Duck the music gain while speaking and restore on `end`/`error`/`cancel`; master mute silences music, SFX, and voice together.
- Only announce fastest correct player after reveal and top five at final result; do not speak on every question transition.

### 7. Security and validation boundary

**Source:** `03-RESEARCH.md:563-580` (no existing auth analog)  
**Apply to:** all API/DO/client/test files.

- Use opaque room/player capability tokens; nickname is display data only.
- Validate room code, nickname, option enum, message type, body size/content type, and role before state mutation.
- Reject client-supplied score/timestamps; calculate from DO receipt time.
- Avoid `innerHTML` for untrusted nickname/room content.
- Enforce one answer per player/question and protect against reconnect replay/flooding.

## No Analog Found

| File/Concern | Why no analog exists | Planner fallback |
|---|---|---|
| `presentation/workers/quiz-room.js` | No Worker, Durable Object, WebSocket, or event-bus code exists. | Use `03-RESEARCH.md` DO hibernation/state-machine snippets; keep one DO per room. |
| `functions/api/quiz/rooms/[roomCode]/socket.js` | Existing Pages Functions are ordinary GET/POST D1 handlers only. | Use the external DO binding/proxy contract from research; preserve upgrade. |
| `questions.json` + server answer key | No structured quiz data file exists; the DOCX is the source. | Transcribe/validate the DOCX and keep authoritative answers server-side. |
| `presentation/quiz/audio/*` | No audio or TTS implementation exists. | Use fixed licensed audio plus browser `SpeechSynthesis` fallback; gate model assets on license verification. |
| `package.json`, `vitest.config.js`, all test files | Repository has no package/test harness. | Add minimal Workers Vitest setup only after the research human-verification checkpoint for flagged package versions. |
| room capability/auth/rate limiting | Existing presentation endpoint is intentionally unauthenticated. | Add opaque role-bound tokens and DO-side checks; do not copy the presentation endpoint's permissive trust model. |

## Metadata

**Analog search scope:** repository root, `functions/api/`, `presentation/slides/`, `wrangler.toml`, `schema.sql`, `README.md`, phase context/research/requirements/project/roadmap, and DOCX source metadata.  
**Files scanned:** 30+ tracked/untracked source, config, and planning files; focused analog reads: 9.  
**Strong analogs:** `functions/api/presentation.js`, `presentation/slides/index.html`, `presentation/slides/style.css`, `presentation/slides/script.js`, `wrangler.toml`, `schema.sql`, `README.md`.  
**Pattern extraction date:** 2026-09-26
