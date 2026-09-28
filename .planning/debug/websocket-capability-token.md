---
status: resolved_pending_retest
phase: 03-quiz-webapp-backend
reported: 2026-09-28
---

# WebSocket capability token failure

## Symptom

The browser console showed repeated WebSocket authentication failures, including a URL with `capabilityToken=undefined`.

## Diagnosis

The metadata-only persisted session intentionally does not contain the capability token. A stale or restored session could still reach `connectSocket()`, which serialized the missing token as the literal string `undefined`. The startup error path also treated authentication failures like transient network failures and retried the socket.

## Fix

`connectSocket()` now stops immediately when the runtime session has no capability token. The startup path treats HTTP 401/invalid capability errors as an expired session and shows the existing “vào lại phòng” error state instead of retrying. Genuine network failures retain the reconnect behavior.

## Retest

Pending manual browser confirmation in UAT Test 14.
