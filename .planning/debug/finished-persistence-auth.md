# Finished persistence authorization

## Symptom

The browser console showed `401 /api/score` and, when the local D1 migration had not been applied, `503 /api/leaderboard` after the quiz ended.

## Root cause

The host finalizes and persists all room results on the server during `finish`. Every client then called `/api/score`; the player capability is intentionally not allowed to finalize the room, so that call was rejected with 401. The local Pages D1 database also had the migration pending, so the leaderboard query had no schema and returned 503.

## Fix

- Only the host client calls `/api/score`; players use the authoritative final snapshot already broadcast by the room.
- The finished-room finalize endpoint also accepts any participant's valid finished-session credential idempotently, so an older cached client cannot turn a harmless retry into a 401.
- Applied local migration `0001_quiz.sql` to `presentation-db`.

## Verification

- `npm test -- --run`: 12 files, 65 tests passed.
- `GET /api/leaderboard` without room context returns 200 locally.
- Finished room `C7UA5A` leaderboard request returns 200 with the current-room results.
