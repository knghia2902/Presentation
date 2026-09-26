---
status: resolved_pending_retest
phase: 03-quiz-webapp-backend
reported: 2026-09-26
---

# Timeout audio duration

## Symptom

The user reported that the sound near the end of the question was unpleasant and too long.

## Diagnosis

The timeout SFX asset is about 3.6 seconds long and `createQuizAudioManager().playAsset('timeout')` played the full media element when the authoritative reveal arrived.

## Fix

`QUIZ_AUDIO_MAX_DURATION_MS.timeout` now limits playback to 900 ms. The media element is paused and reset to the beginning after that limit. A regression test covers the timer and cleanup behavior.

## Retest

Pending manual browser confirmation in UAT Test 12.
