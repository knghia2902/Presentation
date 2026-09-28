# Finished event ordering

## Symptom

After the host ended a quiz, the server had already persisted `phase: finished`, but one or more clients remained on the reveal panel until reload.

## Root cause

Ending from the question phase emits a reveal snapshot while finalizing the current question, then emits the newer finished snapshot. The client accepted snapshots without comparing `roomVersion`, so an older reveal payload could overwrite the newer finished state when delivery/render timing differed between sockets.

## Fix

- Ignore incoming snapshots whose `roomVersion` is older than the current authoritative snapshot.
- While a client is on the reveal panel, reconcile against the finished-capable snapshot endpoint every 800 ms as a loss-recovery path.
- Make the finish confirmation buttons explicit `type="button"` controls and prevent the dialog form default action from competing with the command handler.

## Verification

- `npm test -- --run`: 12 files, 64 tests passed.
- Live two-session test: host and player both transitioned from reveal to final results after the host clicked finish.
