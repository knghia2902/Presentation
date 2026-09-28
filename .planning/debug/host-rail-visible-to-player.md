---
status: resolved_pending_retest
phase: 03-quiz-webapp-backend
reported: 2026-09-28
---

# Host controls visible to players

## Symptom

The player view displayed the host control rail, including “Kết thúc ván chơi”. The player role cannot execute those commands, so the visible control was misleading and the room remained on the question-result panel.

## Diagnosis

The controller set `hostRail.hidden = true` for players, but `.host-rail { display: grid; }` in the stylesheet overrode the hidden state.

## Fix

Added `.host-rail[hidden] { display: none !important; }` so only the host sees the control rail.

## Retest

Pending manual browser confirmation in UAT Test 18.
