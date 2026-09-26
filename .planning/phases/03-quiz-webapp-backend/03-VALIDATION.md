# Phase 3 Validation Contract

**Phase:** `03-quiz-webapp-backend`  
**Status:** Ready for execution  
**Harness:** Vitest with the project-local Workers/D1 runtime configured by `03-01-PLAN.md`

This file is the Nyquist validation map for the nine Phase 3 plans. Every automated command below is runnable after the plan named in the map and uses the same test files and scripts referenced by the plans. Human checks cover device-, browser-, and license-dependent behavior that a shell test cannot prove.

## Validation Map

| Area | Requirements / decisions | Test artifact | Automated command | Acceptance |
|---|---|---|---|---|
| Scoring | QUIZ-03; D-06, D-07, D-08, D-13 | `tests/scoring.test.js` | `npm run test:scoring` | Server receipt time is authoritative; 0 ms correct reaches 1,000; linear decay reaches 0 at the deadline; incorrect, unanswered, late, duplicate, and forged timing/score inputs cannot earn points; tie-break is total response time ascending then stable sequence. |
| Room lifecycle | QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-07; D-01 through D-16, D-18 through D-20 | `tests/quiz-room.test.js` | `npx vitest run tests/scoring.test.js tests/quiz-room.test.js` and `npx vitest run tests/quiz-room.test.js` | One room actor owns lobby → question → reveal → finished; host-only controls work; one shared 30-second deadline is authoritative; reveal includes answer/explanation/leaderboard; host disconnect freezes the room; player disconnect marks offline; reconnect resumes the current snapshot without answer replay. |
| API/security | BACK-01, BACK-02; D-01, D-04, D-10, D-11, D-12, D-13 | `tests/quiz-api.test.js` | `npx vitest run tests/quiz-api.test.js -t "websocket|score|leaderboard|security"` and `npx vitest run tests/quiz-api.test.js` | Pages routes validate method, body, room, nickname, capability, upgrade, size, and rate limits; `/api/score` ignores caller score/timing/correctness/rank; `/api/leaderboard` uses prepared values, stable ordering, and at most 20 rows; unconfigured bindings produce controlled errors. |
| D1 schema | BACK-03; D-09, D-13, D-14 | `tests/schema.test.js`, `tests/helpers/d1-runtime.js` | `npm run test:schema` and `npm exec vitest run tests/schema.test.js` | The migration applies twice without drift; `presentations` remains available; room/player/answer/result tables, constraints, indexes, score/time/sequence fields, and the compatibility schema at `presentation/workers/schema.sql` match the canonical migration contract. |
| Questions and explanations | QUIZ-01, QUIZ-07; D-02, D-09 | `tests/questions.test.js` | `npm run test:questions` and `npm exec vitest run tests/questions.test.js` | Exactly q01–q20 from the DOCX appear in order with four A/B/C/D options; public data has no trusted correct option; Worker data has the answer key and non-empty explanation; IDs/order remain in parity. |
| Reconnect/offline | BACK-04; D-14, D-15, D-16 | `tests/offline.test.js`, `tests/client-events.test.js` | `npx vitest run tests/offline.test.js tests/client-events.test.js` and `npx vitest run tests/offline.test.js` | Only room/session capability metadata and the last authoritative version persist; answers and scores are never queued or replayed; host pause and player offline states are distinct; effects appear only after authoritative events. |
| UI/mobile | QUIZ-04, QUIZ-05, QUIZ-06; D-02, D-03, D-05, D-09, D-17 | `tests/client-contract.test.js` | `npx vitest run tests/client-contract.test.js -t "structure|accessibility|controls"`, `npx vitest run tests/client-contract.test.js -t "responsive|tokens|focus|motion"`, and `npx vitest run tests/client-contract.test.js` | Vietnamese host/player screens expose one question, one irreversible answer action, reveal/result/leaderboard/paused/error states, keyboard/focus semantics, visible announcements, 44px controls, and no horizontal scroll at the 320px contract width. |
| Audio and voice | QUIZ-05; D-17, D-18, D-19, D-20, D-21 | `tests/audio-assets.test.js`, `tests/audio-contract.test.js` | `npx vitest run tests/audio-assets.test.js` and `npx vitest run tests/audio-contract.test.js` | All shipped voice, background music, and correct/incorrect/timeout SFX assets are non-empty and licensed; Web Audio mute/user-gesture/music ducking works; timeout/correct/incorrect SFX map to authoritative events; fixed cues and dynamic `vi-VN` speech follow the locked schedule; visible text remains when audio is unavailable. |

## Wave-local Gates

Run only the tests that already exist at the end of each wave; do not require `npm test` while later wave test files are not yet present.

| Wave | Command(s) | Deterministic gate |
|---|---|---|
| 1 | `npm run test:scoring` | `tests/scoring.test.js` is green for the scoring boundaries and tie-break contract. |
| 2 | `npm run test:questions`; `npm run test:schema` | The DOCX question contract and repeatable migration/schema contract are green. |
| 3 | `npx vitest run tests/scoring.test.js tests/quiz-room.test.js` | Scoring and the complete room state-machine suite are green. |
| 4 | `npx vitest run tests/quiz-api.test.js`; `npx vitest run tests/client-contract.test.js` | API/security and static client contracts are green. |
| 5 | `npx vitest run tests/offline.test.js tests/client-events.test.js`; `npx vitest run tests/audio-assets.test.js` | Offline/event behavior and licensed audio packaging checks are green. |
| 6 | `npx vitest run tests/audio-contract.test.js` | Hybrid audio schedule, mute, ducking, and fallback tests are green. |
| 7 | `npx vitest run tests/deployment-contract.test.js` | Deployment configuration, documentation, and required test-file presence checks are green. |

## Final Full-suite Gate

Run from the repository root only after Wave 7 and Task 3 of `03-09-PLAN.md` have completed:

```text
npm test
```

The final suite must include scoring, questions, schema/D1, room lifecycle, API/security, offline/reconnect, client contract/events, audio assets/contract, and deployment-contract tests. The deployment-contract test must also verify `presentation/workers/api.js`, `presentation/workers/schema.sql`, the external Worker `main`/exports mapping, the Pages `QUIZ_ROOM` binding, README commands, and required test-file presence.

## Human Acceptance Checks

1. In two browser sessions, create a room as host, join as player, start a question, submit one answer, observe reveal/explanation/room leaderboard, and finish the quiz. Confirm a player cannot start, advance, or finish the room.
2. Disconnect the host during a question and confirm the deadline is frozen with a Vietnamese paused banner; reconnect the same host capability and resume. Disconnect a player instead and confirm the other participants continue while the disconnected player's missed answer remains zero.
3. Load `/presentation/quiz/` at 320px and a desktop width. Confirm no horizontal scroll, readable room code/timer, keyboard focus, reduced-motion-safe feedback, and distinct correct/incorrect/timeout text states.
4. After the blocking audio license checkpoint approves every shipped asset, use a user gesture to enable audio. Confirm background music, correct/incorrect/timeout SFX, fixed cues, mute, music ducking during voice, no speech on ordinary question transitions, fastest-correct announcement after reveal, and top-five announcement only at final results. Repeat with no Vietnamese browser voice and confirm visible text fallback.
5. Run the exact local deployment checks below. First run `npx wrangler deploy --config presentation/workers/wrangler.toml --dry-run`; success is exit code 0 with a parsed `quiz-room-worker`/`QuizRoom` bundle and no upload. Then use two terminals: terminal A runs `npx wrangler dev --config presentation/workers/wrangler.toml --local --port 8787`, terminal B runs `npx wrangler pages dev . --do QUIZ_ROOM=QuizRoom@quiz-room-worker --port 8788`, and terminal C runs `Invoke-WebRequest http://127.0.0.1:8788/presentation/quiz/ -UseBasicParsing` (HTTP 200) plus `Test-NetConnection 127.0.0.1 -Port 8787 -InformationLevel Quiet` and `Test-NetConnection 127.0.0.1 -Port 8788 -InformationLevel Quiet` (both `True`). If Wrangler, the Workers runtime, or account access is unavailable, record the exact command/error, run `npm exec vitest run tests/deployment-contract.test.js` and `npm test`, then perform the two-browser host/player flow against the next available Pages/Worker preview; mark only the runtime smoke as manual/unavailable. Do not treat a local dry run as a live Cloudflare deployment; live Pages/D1/QR publication remains Phase 4.

## Phase Acceptance

Phase 3 is accepted only when the full `npm test` gate is green, the six behavioral areas above have their automated assertions, the eight audio assets have traceable license records, the two-browser reconnect flow passes, the 320px UI check passes, and the deployment contract reconciles both roadmap compatibility paths with the canonical Worker and migration paths.
