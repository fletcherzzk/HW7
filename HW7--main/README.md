# Orchestra Panic

Orchestra Panic is a local browser rhythm game. Choose music and difficulty,
then move your physical left and right hands to control the matching game hands.

## Install and run

Install Node.js (the project was checked with Node.js 22). Download or clone the
repository and open PowerShell in the inner HW7--main folder containing package.json:

```powershell
npm.cmd ci
npm.cmd start
```

Keep that terminal open. Visit **http://localhost:4173/** in Chrome or Edge and
allow camera access. Use localhost rather than opening index.html directly.
The initial npm install needs internet access; models are included locally.
If port 4173 is already occupied, check whether another game server is running.
Use Ctrl+C in its terminal to stop it. The server binds to this machine only.

## Controls and playing a round

1. Select a local MP3/WAV or **Use Included Demo**, then choose Easy, Normal, or Hard.
2. Click **Start with camera** and allow camera access.
3. Keep your face and both hands visible for three seconds to start the music.
4. Raise/lower each hand relative to your head to match the corresponding blue
   left-hand or coral right-hand targets at their arrival time.
5. At the end, view score, hits, misses, accuracy, and best combo. **Play Again**
   returns to setup, where you can keep the song or select another.

The physical left hand controls game left; physical right controls game right.
The camera image is mirrored for display. Difficulty narrows the acceptable
height zone and changes note density/movement. Leaving the tab stops the round
and releases the camera; return and start again to play.

Uploaded files must be browser-decodable, at most 100 MB, and 3 seconds to 20
minutes long. Some very short clips produce no playable targets. Selected music
and video stay on your device; they are not uploaded. The included demo is an
original instrumental. Audience/failure sounds are synthesized in the browser.

## Final tracking behavior

Each hand updates independently when the face and that hand are detected. If a
hand disappears, its position holds. A **300 ms display grace** delays dimming and
Not Tracked warnings for that hand. A short holding message distinguishes this
from a confirmed long loss. The other hand continues responding independently.

Missing data is ineligible to score immediately. Data 240 ms old or older is also
ineligible, including during display grace. If camera frames stop arriving, the
300 ms display grace begins when the 240 ms freshness window expires. Repeated
missing results cannot restart grace. Never-detected hands have no grace. Face
loss prevents both hands from scoring. Calibration still requires actual face
and both-hand detection; display grace cannot bypass it.

Hand detection/presence thresholds are **0.35**; the tracking threshold stays
**0.5**. These are the selected relaxed settings, now used without URL options.
Smoothing remains 0.42. No diagnostic panel, smoothing toggle, threshold selector,
or autoplay test mode is available. Old experimental URL parameters are ignored.
A returned Left/Right classification score is separate from detection thresholds;
the game has no 0.9 classification cutoff. Lower thresholds can admit false
results; the user's live comparison is practical feedback, not a quantified
accuracy benchmark.

## Acceptance criteria status

These statuses describe implementation evidence and the user's tracking feedback.
Full end-to-end acceptance testing of every feature has not been performed.

| SPEC criterion | Implementation status |
| --- | --- |
| 1. Camera activation and clear errors | Implemented; camera errors are reported without suggesting unavailable preview controls. |
| 2. Separate left/right indicators | Implemented; physical-hand mapping corrected and lower detection/presence thresholds selected. Intermittent genuine detection loss remains possible. |
| 3. Independent head-relative movement | Implemented; loss of one hand now allows the other to continue updating. Original smoothing retained. |
| 4. Local MP3 for a full-song round | Implemented for browser-decodable MP3/WAV; limited to 100 MB and 3 seconds to 20 minutes. |
| 5. Falling targets, separate patterns, rhythm timing | Partial: variable-height patterns exist, but targets move horizontally. Energy-peak detection falls back to a fixed grid. |
| 6. Height-based scoring once per target | Implemented; now validates the required hand independently. Synthetic regression checks cover missing/stale hands and duplicate judging. |
| 7. Results, replay, and song selection | Implemented; requires live round-end verification. |
| 8. Tracking-loss warning and scoring protection | Implemented per hand; warnings/dimming have a 300 ms display grace. Missing/stale data cannot score, including during grace. Missing face invalidates both for scoring. Synthetic checks passed; the user approved the 300 ms version in live testing. |
| 9. Difficulty narrows visible height tolerance | Implemented with Easy/Normal/Hard tolerances; visual verification pending. |
| 10. Auditorium/orchestra with readable gameplay | Canvas scene implemented; visual verification pending. |
| 11. One boo per five-miss streak, reset on hit | Logic implemented; synthesized descending sound needs listening to assess whether it resembles audience booing. |

The optional proposed 0.3-second mute is not implemented; misses use a gain/filter
effect instead. Optional musical-part/instrument separation is not implemented.

## Code map

There are no custom classes. Most behavior is in functions in game.js.

| File or function | Responsibility / where to change behavior |
| --- | --- |
| index.html | Setup, file selection, difficulty controls, gameplay HUD, results. |
| styles.css | Page layout, colors, text, responsive rules. |
| game.js: loadVisionModels / ensureCamera | Model settings/assets and camera permission/startup. |
| game.js: updateTracking / cameraToLevel | Anatomical label mapping, head-relative heights, smoothing, per-hand state. |
| game.js: isHandTrackingFresh / handTrackingDisplayState | Strict scoring freshness versus display-only grace; constants near the file top set timing. |
| game.js: invalidateTracking / resetGame | Reject tracking on camera/model failure; clear round state. |
| game.js: startConcert / gameLoop | Audio preparation, camera calibration, round lifecycle and frame updates. |
| game.js: createNotes / nextLevel | Difficulty-dependent two-hand patterns and target heights. |
| game.js: evaluateNotes / recordHit / recordMiss | One-time arrival judgement, score/combo, streak feedback. |
| game.js: drawNotes / drawControlRails / drawConductor / drawTheatre | Target motion, acceptable zones, hand indicators, auditorium/orchestra. |
| game.js: updateHud / finishConcert / returnToSetup | Live status and score, final results, replay. |
| game.js: triggerDissonance / playBoo / playApplause | Miss effects and synthesized audience feedback. |
| audio-chart.js | Duration validation, included-demo beat grid, uploaded-audio energy-peak detection. |
| start-server.mjs | Local HTTP server, MIME types, byte-range audio delivery. |
| generate-demo-track.mjs / demo-track.wav | Original demo generator and playable demo music. |
| assets/models/ | Included hand/face model files; MediaPipe runtime is installed in node_modules. |
| tracking.test.mjs | Developer-only automated tracking/scoring regression checks; not loaded by the game. |
| package.json / package-lock.json | Commands and pinned dependency installation. |
| SPEC.md / ../prompt_log.md | Original requirements and AI-assisted work history. |

Run `npm.cmd test` for regression checks and `npm.cmd run check` for syntax checks.
The automated checks simulate CV results; they do not establish real camera accuracy.

## Known limitations and shortcuts

- Targets move horizontally instead of falling from above. This remains the main
  acceptance-criterion gap; this handoff preserved the inherited presentation.
- Audio timing uses energy peaks with a fixed-grid fallback, rather than full
  musical beat/instrument analysis. This keeps the inherited approach simple,
  but synchronization varies with music.
- Duplicate handedness labels can leave one game hand missing. Missing positions
  are held, never predicted; recovery can visibly catch up through smoothing.
- Both CV models execute synchronously on CPU in the drawing loop. Slow machines
  can still stutter. Grace smooths warnings, not model execution or detection.
- The three-second calibration can restart on brief losses. Its countdown HTML
  element is absent, so the HUD may say hands are detected before music starts.
- Canvas drawing stretches with the viewport and may distort at unusual aspect
  ratios. No specific resize failure has been confirmed.
- The simple orchestra illustration, synthesized audience tone, and energy-based
  chart are retained shortcuts. The original author's rationale is undocumented;
  the handoff focused changes on controls/reliability rather than replacing them.

## Next priorities

1. Change target motion to fall from above while preserving variable landing heights.
2. Verify MP3 synchronization, difficulty zones, full-song results, and boo behavior
   across songs and machines; document acceptance results accurately.
3. Add a visible calibration countdown and improve handling of repeated CV losses
   if further player testing shows they prevent starting.
4. Improve beat analysis or CV scheduling only after measuring the remaining issues.

## Retrieving earlier versions

Git commit **7dc384a** preserves the last diagnostic build with 300 ms grace.
From the repository root, restore its game, tests, and README with:

```powershell
git restore --source=7dc384a -- HW7--main/game.js HW7--main/tracking.test.mjs HW7--main/README.md
```

This overwrites later edits to those files. Original inherited project files are
in commit **c260f9f**. That was the second repository commit; the first contains
only .gitattributes, so the literal first-commit assignment rule remains a history
concern. Exact pre-experiment game/README backups are also under
../implementation/before-tracking-experiment-2026-11-06/. Keep prompt_log.md as
history. HANDOFF_REPORT.md is written solely by the student.
