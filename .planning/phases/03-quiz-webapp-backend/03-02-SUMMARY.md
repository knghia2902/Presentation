---
phase: 03-quiz-webapp-backend
plan: 02
subsystem: quiz-content-database
tags: [quiz, docx, d1, sqlite, vitest, cloudflare-workers]

# Dependency graph
requires:
  - phase: 03-01
    provides: Approved Vitest/Cloudflare Workers harness, D1 helper, and server scoring seam
provides:
  - DOCX-derived public q01-q20 question contract without trusted answers
  - Worker-only answer keys and Vietnamese explanations
  - Repeatable D1 migration and aligned Worker bootstrap schema for quiz persistence
  - Executable question parity and schema contract tests
affects: [03-03, 03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [public/trusted question split, versioned D1 migration, prepared-statement-compatible leaderboard indexes, Node-side D1 migration loading]

# Key files
key-files:
  created:
    - presentation/quiz/questions.json
    - presentation/workers/questions.js
    - migrations/0001_quiz.sql
    - presentation/workers/schema.sql
    - tests/questions.test.js
    - tests/schema.test.js
    - wrangler.vitest.toml
    - tests/fixtures/d1-worker.js
  modified:
    - tests/helpers/d1-runtime.js
    - vitest.config.js

key-decisions:
  - "Keep the public question asset limited to IDs, prompts, and A/B/C/D options; the Worker module owns correctOption and explanations."
  - "Use a versioned migration as the canonical D1 schema and keep presentation tables intact; schema.sql is bootstrap compatibility only."
  - "Load D1 migrations in Node-side Vitest configuration and pass them through TEST_MIGRATIONS to the Worker runtime, matching Cloudflare's D1 recipe."

requirements-completed: [QUIZ-01, QUIZ-07, BACK-03]

coverage:
  - id: D1
    description: "DOCX-derived 20-question Vietnamese quiz bank with four public options and a Worker-only answer key/explanation source"
    requirement: QUIZ-01
    verification:
      - kind: unit
        ref: "tests/questions.test.js#contains the 20 prompts in their source order"
        status: pass
      - kind: unit
        ref: "tests/questions.test.js#keeps the answer key authoritative and out of the public asset"
        status: pass
    human_judgment: false
  - id: D2
    description: "Repeatable D1 schema preserving presentations and enforcing quiz answer/result persistence and leaderboard ordering"
    requirement: BACK-03
    verification:
      - kind: integration
        ref: "tests/schema.test.js#repeatable quiz D1 schema"
        status: pass
      - kind: other
        ref: "npm test"
        status: pass
    human_judgment: false
  - id: D3
    description: "Reveal-ready trusted explanations are available for every question"
    requirement: QUIZ-07
    verification:
      - kind: unit
        ref: "tests/questions.test.js#keeps four complete Vietnamese options in public and trusted data"
        status: pass
    human_judgment: false

# Metrics
duration: 11min
completed: 2026-09-26
status: complete
---

# Phase 03 Plan 02: Question Bank and D1 Schema Contracts Summary

**DOCX-traceable Vietnamese q01-q20 quiz data with server-only answer explanations and repeatable D1 room/result storage**

## Performance

- **Duration:** 11 min
- **Started:** 2026-09-26T03:54:00Z
- **Completed:** 2026-09-26T04:05:18Z
- **Tasks:** 3 complete
- **Files modified:** 10

## Accomplishments

- Transcribed all 20 supplied DOCX questions in order with complete A/B/C/D options and the exact answer-key map.
- Split public question rendering data from Worker-only correctness and concise Vietnamese reveal explanations.
- Added repeatable D1 tables for rooms, players, accepted answers, and final results while preserving `presentations`, with idempotency and leaderboard indexes.
- Added executable question parity/schema tests and corrected the Workers D1 harness to load migrations through a test-only Worker configuration.

## Task Commits

Each task was committed atomically:

1. **Task 1: Transcribe and split the 20-question bank** - `ad696c5` (feat)
2. **Task 2: Add the repeatable quiz D1 migration** - `ee1c0fb` (feat)
3. **Task 3: Automate content and schema parity checks** - `788281e` (test)

## Files Created/Modified

- `presentation/quiz/questions.json` - Public q01-q20 prompts/options with no trusted answer key.
- `presentation/workers/questions.js` - Worker-only options, `correctOption`, and explanations.
- `migrations/0001_quiz.sql` - Canonical repeatable D1 migration with tables, constraints, and indexes.
- `presentation/workers/schema.sql` - Roadmap-compatible bootstrap schema aligned with the migration.
- `tests/questions.test.js` - DOCX order, answer-key, option, explanation, and public/trusted parity checks.
- `tests/schema.test.js` - Migration repeatability, preservation, structural parity, uniqueness, and leaderboard ordering checks.
- `tests/helpers/d1-runtime.js` - Uses the Worker runtime's `TEST_MIGRATIONS` binding.
- `vitest.config.js`, `wrangler.vitest.toml`, `tests/fixtures/d1-worker.js` - Test-only Worker configuration for D1 integration tests.

## Verification

- Public question contract check: passed (`public question contract ok`).
- Trusted question contract check: passed (`trusted question contract ok`).
- Focused suite: passed — `npm exec vitest run tests/questions.test.js tests/schema.test.js` (2 files, 8 tests).
- Full suite: passed — `npm test` (3 files, 16 tests).

## Decisions Made

- Public assets never carry `correctOption`; reveal/scoring consumers must use the Worker-owned dataset.
- The versioned migration is the source of truth; `presentation/workers/schema.sql` is kept structurally aligned for bootstrap/deployment tooling and is not used on request paths.
- The test-only Worker config follows Cloudflare's D1 migration recipe so migration parsing stays in Node and the Worker receives a `TEST_MIGRATIONS` binding.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Relaxed the option-language assertion for numeric choices**
- **Found during:** Task 3 (content contract tests)
- **Issue:** The test incorrectly required a Vietnamese character in every option, but the DOCX's q09 options are the valid numeric choices `1`–`4`.
- **Fix:** Kept non-empty option validation and Vietnamese prompt/explanation validation without imposing an invalid character requirement on numeric options.
- **Files modified:** `tests/questions.test.js`
- **Verification:** Focused and full Vitest suites pass.
- **Committed in:** `788281e`

**2. [Rule 3 - Blocking] Aligned the D1 test runtime with the Cloudflare Worker recipe**
- **Found during:** Task 3 (schema test execution)
- **Issue:** The Plan 01 helper read migrations from inside the Worker runtime, causing Miniflare/Vitest Node-module resolution failures; the Pages-only Wrangler config also lacked a Worker `main` entrypoint for this integration suite.
- **Fix:** Read migrations in the Node-side Vitest config, bind them as `TEST_MIGRATIONS`, use `cloudflare:workers` for `env`, and add a minimal test-only Worker config/entrypoint. Production `wrangler.toml` remains unchanged.
- **Files modified:** `tests/helpers/d1-runtime.js`, `vitest.config.js`, `wrangler.vitest.toml`, `tests/fixtures/d1-worker.js`
- **Verification:** D1 migration applies twice and all schema tests pass; full suite passes.
- **Committed in:** `788281e`

---

**Total deviations:** 2 auto-fixed (1 Rule 1, 1 Rule 3)
**Impact on plan:** Both fixes were limited to correctness and test execution; no production request path or unrelated user files were changed.

## Authentication Gates

None occurred.

## Known Stubs

None found in the product files created or modified by this plan. `tests/fixtures/d1-worker.js` is intentionally a minimal test harness entrypoint, not a production Worker.

## Issues Encountered

- The workspace contains unrelated untracked presentation assets, extraction scripts, and `.planning/research/.cache` files. They were preserved and excluded from every task commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 03-03 can consume `questions.js`, `scoring.js`, and the D1 schema for authoritative room answers, reveal explanations, and final result writes.
- Plan 03-04 can use `quiz_results` ordering/indexes for the prepared top-20 leaderboard query.

---
*Phase: 03-quiz-webapp-backend*
*Completed: 2026-09-26*

## Self-Check: PASSED

- Required summary and all plan key files exist on disk.
- Task commits `ad696c5`, `ee1c0fb`, and `788281e` are present in git history.
- Focused and full verification suites passed.
