---
status: resolved_pending_retest
phase: 03-quiz-webapp-backend
reported: 2026-09-26
---

# Pause banner always visible

## Symptom

The user reported that the “Phòng đang tạm dừng” message appeared all the time, including while the room was connected and the timer was running.

## Diagnosis

The controller correctly toggled the `hidden` property based on `snapshot.phase`, but the stylesheet declared `display: grid` for `.pause-banner` and `.paused-panel` without protecting the `hidden` state. Author CSS therefore kept both panels visible.

## Fix

Added `.pause-banner[hidden], .paused-panel[hidden] { display: none !important; }`. The banner now appears only for `paused_host_disconnect` snapshots.

## Retest

Pending manual browser confirmation in UAT Test 13.
