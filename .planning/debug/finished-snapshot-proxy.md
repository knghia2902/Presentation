---
status: resolved_pending_retest
phase: 03-quiz-webapp-backend
reported: 2026-09-28
---

# Finished snapshot proxy parameter

## Symptom

The browser supplied `finished=1`, but the Pages endpoint returned HTTP 401 when restoring a finished room.

## Diagnosis

The Pages `handleSnapshot()` proxy rebuilt the Durable Object query with only `playerId` and `capabilityToken`. It silently dropped `finished=1`, forcing normal active-session authentication after the server had revoked active capabilities.

## Fix

The proxy now forwards `finished=1`, and the API contract test asserts that the forwarded URL preserves the flag.

## Retest

Pending manual browser confirmation in UAT Test 17.
