---
status: resolved_pending_retest
phase: 03-quiz-webapp-backend
reported: 2026-09-28
---

# Finished result after reload

## Symptom

After the host finished the quiz, reloading the page showed “Phiên phòng không còn thông tin xác thực” and the final result could not be reopened.

## Diagnosis

The server revokes active capabilities after finishing. The client intentionally does not persist those credentials, but it also did not persist the already-authoritative finished snapshot, so reload had no safe source for the result screen.

## Fix

The client now caches the authoritative finished snapshot by room/player in local storage and restores the finished screen before attempting network authentication. No capability or reconnect token is stored in this cache.

## Retest

Pending manual browser confirmation in UAT Test 15.
