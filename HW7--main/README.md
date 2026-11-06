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
- A false face/left/right detection indicates a missing CV result for that sample.
- All detections true with `fresh=false` and an age of 240 ms or more indicates
  the game's freshness check rejected the position. Age uses the original
  pre-inference timestamp; timing is deliberately unchanged for this experiment.
- Hand/face inference times show how long model execution blocks the game loop.
  Correct detections can still be slow. Smoothing does not control tracking validity.

Opening the URL without `?trackingDebug=1` restores the original smoothing behavior
and hides diagnostics. No CV settings, scoring rules, or freshness rules were changed.
Automated checks cover the data-processing comparison; live camera results still
need to be observed on the player's machine.

The original game is preserved in Git commit `c260f9f`. To restore just the game
script from the repository root (the parent of this folder):

```powershell
git restore --source=c260f9f -- HW7--main/game.js
```

This replaces any subsequent edits to that file. Exact pre-experiment copies of
`game.js` and this README are also in
`../implementation/before-tracking-experiment-2026-11-06/`, with SHA-256 hashes.
