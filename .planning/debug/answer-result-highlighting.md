# Debug: answer result highlighting

## Symptom

During UAT test 5, an answer result made all four answer cards appear incorrect or all four appear correct.

## Root cause

`renderQuestion()` previously assigned `data-state="selected"` to every answer button while `state.answerPending` was true. `markAuthoritativeAnswer()` then converted every button carrying that state to `correct` or `incorrect`. The same broad assignment happened for accepted answers during re-render.

## Fix applied

- Added `state.selectedOption` and set it only in `submitAnswer()`.
- Restrict pending/result styling to the button whose `data-answer` matches `selectedOption`.
- Clear state from all other answer buttons.

## Verification

- Added a client regression test asserting only the submitted option receives `correct`.
- `npm test`: 12 files, 57 tests passed.
