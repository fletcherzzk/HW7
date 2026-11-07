# Orchestra Panic

`Orchestra Panic` is a local browser rhythm game. Pick an MP3 or WAV and a difficulty with the mouse, then conduct with both hands in front of your camera.

## Run locally

Serve this folder from `localhost` rather than opening `index.html` directly. Camera access requires a secure context or localhost.

```powershell
node start-server.mjs
```

Open `http://localhost:4173` in a modern Chromium browser and allow camera access. The tracking models are included locally, so the game does not need to download them in the browser.

## How to play

1. Choose an MP3 or WAV, or select **Use Included Demo**, then pick a difficulty and select **START THE CONCERT**.
2. Keep your head and both hands visible. The camera image is mirrored just like a selfie camera.
3. Move the blue left-hand indicator and coral right-hand indicator to their matching notes as they arrive at the center rails.
4. A green tracking indicator means the game has found your head and both hands.
   If one hand disappears during play, the other can still move and score. The
   missing hand stays at its last position, dims, and cannot earn points. Your
   face is required for either hand because controls use head-relative heights.

The note chart is generated from the uploaded MP3's audio energy. Easy leaves generous height tolerance, Normal uses both hands more often, and Hard creates dense, high-motion patterns.

## Notes

- `demo-track.wav` is a short original instrumental included for testing. It was created specifically for this project and is free to use with the game.
- No song files are stored or uploaded; the selected audio stays in your browser session.
- The camera video stays on your device and is only used to drive the on-screen silhouette.
- Hand and face tracking models are stored in `assets/models/`. After the project dependencies have been installed, gameplay does not need the browser to download tracking resources.
- The final-applause and failure sounds are synthesized in the browser, so the project contains no copied audio assets.

## Tracking experiment (Phase 2)

Install Node.js, open a terminal in this folder, run `npm.cmd ci`, then
`npm.cmd start`. Open `http://localhost:4173/?trackingDebug=1` in Chrome or Edge.
Start the demo with your face and both hands visible. The diagnostic panel starts
with the original smoothing enabled. Repeat quick up/down movements, then uncheck
**Original smoothing** and repeat. Scores in this diagnostic session are experimental.

- Raw positions moving promptly while displayed positions trail indicates smoothing lag.
- A false face/left/right detection means the script did not obtain that mapped
  detection for the sample. Raw hand count and returned labels distinguish a
  missing hand result from duplicate or unexpected labels. Scores shown alongside
  labels are handedness classification confidence, not positional accuracy.
- The existing mapping remains model `Right` to game left and model `Left` to
  game right; test each physical hand separately before changing this convention.
- Each hand now has its own freshness and age. Age means time since that hand
  was last detected with the face, not inference duration. A missing hand is
  invalid immediately; the other hand remains active if fresh. Age of 240 ms or
  more also prevents scoring. Pre-inference timestamps remain unchanged.
- Hand/face inference times show how long model execution blocks the game loop.
  Correct detections can still be slow. Smoothing does not control tracking validity.

Opening the URL without `?trackingDebug=1` keeps original smoothing and hides
diagnostics. Independent hand updates/scoring apply in both modes. CV settings,
smoothing strength, and the 240 ms freshness threshold remain unchanged.
Calibration still requires three continuous seconds with the face and both hands.
Run `npm test` for isolated tracking/scoring regression checks. They do not verify
real camera accuracy; the updated behavior still needs live player testing.

The first diagnostic experiment is preserved in commit `ea05764`. From the
repository root, restore its gameplay, README, and package scripts with:

```powershell
git restore --source=ea05764 -- HW7--main/game.js HW7--main/README.md HW7--main/package.json
```

This overwrites later edits to those files. The new test file may remain but
targets the newer independent-hand behavior. Keep `prompt_log.md` as the history
of the work performed.

The original game is preserved in Git commit `c260f9f`. To restore just the game
script from the repository root (the parent of this folder):

```powershell
git restore --source=c260f9f -- HW7--main/game.js
```

This replaces any subsequent edits to that file. Exact pre-experiment copies of
`game.js` and this README are also in
`../implementation/before-tracking-experiment-2026-11-06/`, with SHA-256 hashes.

## Acceptance criteria status

Statuses below describe implementation evidence. Camera reliability, visual
readability, uploaded-song synchronization, and audible feedback still require
live verification; they are not claimed as fully passed acceptance tests.

| SPEC criterion | Implementation status |
| --- | --- |
| 1. Camera activation and clear errors | Implemented; errors still mention an unavailable Watch preview button. |
| 2. Separate left/right indicators | Implemented; intermittent mapped-left detection reported in live testing. Raw labels are now visible in diagnostics. |
| 3. Independent head-relative movement | Implemented; loss of one hand now allows the other to continue updating. Original smoothing retained. |
| 4. Local MP3 for a full-song round | Implemented for browser-decodable MP3/WAV; limited to 100 MB and 3 seconds to 20 minutes. |
| 5. Falling targets, separate patterns, rhythm timing | Partial: variable-height patterns exist, but targets move horizontally. Energy-peak detection falls back to a fixed grid. |
| 6. Height-based scoring once per target | Implemented; now validates the required hand independently. Synthetic regression checks cover missing/stale hands and duplicate judging. |
| 7. Results, replay, and song selection | Implemented; requires live round-end verification. |
| 8. Tracking-loss warning and scoring protection | Implemented per hand; missing face invalidates both. Live disappearance/recovery comparison pending. |
| 9. Difficulty narrows visible height tolerance | Implemented with Easy/Normal/Hard tolerances; visual verification pending. |
| 10. Auditorium/orchestra with readable gameplay | Canvas scene implemented; visual verification pending. |
| 11. One boo per five-miss streak, reset on hit | Logic implemented; synthesized descending sound needs listening to assess whether it resembles audience booing. |

The optional proposed 0.3-second mute is not implemented; individual misses use
a gain/filter effect instead. Instrument separation is an optional unimplemented
extension. This change does not address those separate features.

### Tracking code map and next steps

In `game.js`, `updateTracking` maps CV results and updates each hand independently;
`isHandTrackingFresh` centralizes the per-hand scoring/display freshness rule;
`invalidateTracking` rejects both hands on camera/model failure. `evaluateNotes`
judges the required hand once. `updateHud`, `drawControlRails`, and `drawConductor`
show which hand remains active. `resetGame` clears hand ages between rounds.
`tracking.test.mjs` runs these actual functions against controlled model results.

Next: (1) repeat the live one-hand-loss and quick-movement comparison;
(2) examine raw counts/labels if mapped-left detections still disappear;
(3) tune smoothing or timestamp handling only if that evidence supports it;
(4) fix horizontal targets to meet the falling-target criterion.

Known limitation: handedness mapping and duplicate-label handling are unchanged;
two identical labels still leave one game hand missing. Lost hands retain their
last displayed position but are dimmed and ineligible to score. Full recovery
therefore may visibly catch up through smoothing. No prediction, confidence
retuning, or replacement CV model was added, to keep this change focused on the
confirmed all-or-nothing freeze and preserve the inherited work.
