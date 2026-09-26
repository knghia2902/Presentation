# Debug: duplicate answer cards

## Symptom

During Phase 3 UAT test 4, the question screen showed eight answer cards instead of one set of four.

## Root cause

`presentation/quiz/index.html` contains two answer containers: `host-answers` for a read-only host preview and `player-answers` for player buttons. `presentation/quiz/app.js` set the `hidden` property on individual player buttons and on `host-answers`, but the stylesheet's `.answer-option { display: flex; }` could override the browser hiding behavior in the rendered page. The non-role container therefore remained visually present.

## Fix applied

- Toggle visibility on the complete `player-answers` container as well as `host-answers` in `renderQuestion()`.
- Add `.answer-grid[hidden] { display: none !important; }` so role-specific answer containers cannot leak into the other role's view.

## Verification

- `npm test`: 12 files, 56 tests passed.
- Browser retest on a new local host room: accessibility tree shows one `Các đáp án để xem trước` group containing exactly A, B, C, D.
