# AI prompt log

## 2026-11-06 — Inspection and reversible tracking experiment

Earlier conversation summary: the user requested read-only inspection of the
inherited Orchestra Conductor/Panic project, including acceptance criteria and
handoff gaps. No project files were changed during that inspection. The user
then reported startup failure and intermittent tracking loss/lag. Dependency
inspection initially found MediaPipe absent; it was present in the later inspection.

The user proposed smoothing as the cause, then authorized an experiment with
the explicit requirement that the previous version remain retrievable.

Changes: added an opt-in `?trackingDebug=1` diagnostic panel, an original-smoothing
versus direct-movement checkbox, per-model timings, separate detection presence,
and raw/displayed position readings. Default smoothing, CV configuration,
all-or-nothing validity, and the freshness check are retained to isolate the variable.
README describes the comparison and rollback. Before edits, game.js and README.md
were copied into implementation/before-tracking-experiment-2026-11-06 with hashes.
Git baseline c260f9f also preserves the original project.

AI limitations/corrections: source inspection alone cannot establish that CV
reliability is the cause of the user's symptoms. Smoothing causes position lag but
does not set tracking validity. A missing detection or the pre-inference timestamp
freshness check can explain warnings independently. Previous latency estimates
were illustrative, not measurements from this machine. No live camera outcome
is claimed. The existing error message incorrectly suggests a preview button
that is absent from the HTML; this experiment does not fix that separate issue.

Validation: JavaScript syntax and isolated synthetic detection scenarios are
checked as part of this change. Actual camera movement and timing require a live
player comparison. HANDOFF_REPORT.md was not created or edited.

## 2026-11-06 - Independent hand updates and scoring

User evidence: live inference times did not seem dominant; mapped-left detection
frequently became false and the shared age approached 800 ms. The user authorized
independent-hand handling and additional raw-result diagnostics, retaining the
previous-version requirement.

Changes: per-hand validity and last-seen timestamps now drive movement, scoring,
rail/hand dimming, and targeted warnings. Missing face or model/video failure
invalidates both. Calibration still requires both hands and the face. Smoothing
remains 0.42 by default, and the existing diagnostic checkbox still bypasses it.
Raw hand counts, handedness labels/confidence, and separate hand ages are shown.
The 240 ms limit, pre-inference timestamps, CV settings, and label mapping are
unchanged. README now records every acceptance criterion and this change's scope.
Commit ea05764 preserves the earlier experiment; c260f9f preserves the original.
The student's existing implementation log was not edited or staged.

Validation: six regression tests passed using controlled CV output with actual
game functions: independent updates/scoring for either hand, loss/recovery,
face loss/model exceptions, stale/unavailable frames, duplicate labels, and
original smoothing versus direct mode/reset. JavaScript syntax check passed.
No post-change live camera success is claimed.

AI mistakes/corrections: the shared 800 ms age must not be described as inference
duration. Handedness confidence must not be described as positional accuracy.
An edit through PowerShell initially replaced a warning separator with a question
mark; it was corrected to an ASCII separator. The default node --test runner
could not spawn a child process in the sandbox (EPERM); running the same node:test
suite directly succeeded, and npm test uses that command. An initial patch had
out-of-order anchors and failed without changing files; the edit was reapplied.
HANDOFF_REPORT.md remains untouched.

## 2026-11-06 - Physical-hand mapping and threshold investigation

User observations: physical left/right controls were reversed; visible confidence
appeared to require 0.9; tracking false usually represented a genuinely missing
hand. User requested correction and investigation of lower confidence settings.

Evidence: installed MediaPipe 0.10.21 vision.d.ts documents defaults of 0.5 for
minHandDetectionConfidence, minHandPresenceConfidence, and minTrackingConfidence.
The game previously supplied none of them and never applied a 0.9 label cutoff.
Official documentation corroborates the defaults and distinguishes handedness
classification from palm/presence thresholds and tracking box overlap:
https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web

Changes: removed the inherited label swap so Left maps to game left and Right
to game right, matching the user's live observation. Made baseline 0.5 thresholds
explicit and added an opt-in relaxed 0.35 detection/presence preset. Tracking
threshold stays 0.5; smoothing and independent-hand rules stay unchanged.
Diagnostic links reload between presets and the panel names all active thresholds.
README explains the comparison, false-detection checks, acceptance status, and
rollback to be3d673. Existing student implementation log remains untouched.

Validation: eight synthetic regression checks and JavaScript syntax checks pass.
Updated tests check anatomical mapping, duplicates, label scores below 0.9, and
baseline/relaxed/fallback configuration. These tests do not measure model recall
or false detections on real video. The 0.35 preset is experimental; no improvement
or acceptable false-positive rate is claimed without live comparison.

AI correction: preserving the inherited inverted mapping in the earlier change
left the reported physical-hand reversal unresolved; corrected now using the
user's live evidence. Missing CV outputs, rather than slow inference or smoothing,
are the principal remaining hypothesis based on that evidence. Do not conflate
high handedness classification confidence with a detection acceptance threshold.
No HANDOFF_REPORT.md assistance was provided.

## 2026-11-06 - Display grace for temporary tracking loss

User requested two final priorities near the one-hour mark: retain threshold
changes and add a grace period that holds the last displayed position while
never permitting missing or stale data to score. The earlier discussion proposed
150 ms per hand; the user authorized implementation.

Changes: retained baseline/relaxed threshold presets exactly. Added independent
150 ms display grace, a holding message, and delayed warning/dimming. Each hand
stores the start of a loss; repeated missing results cannot extend grace. Hand
positions already stop updating when missing and continue to hold through grace.
The strict scoring helper remains separate: missing data is rejected immediately,
and stale data is rejected at the existing 240 ms expiry. If camera frames stall,
display grace starts at freshness expiry. No grace is given to never-seen hands.
Recovery clears loss history. Face loss and model/video failure also preserve
scoring protection. Calibration still requires actual detection of both hands.
README records behavior, acceptance status, code map, and rollback to 96e25b3.

Validation: all 13 regression checks and npm run check passed. New cases cover
held positions/no points during grace, expiration at 150 ms, repeated missing
results, recovery/new loss, stale frames/no points during grace, never-seen/reset
hands, and HUD warning suppression/expiry. Existing threshold and mapping tests
also passed. Live camera confirmation remains for the player; no live improvement
is claimed. One README patch had an invalid extra anchor and failed without edits;
it was reapplied correctly. HANDOFF_REPORT.md and the student's implementation log
remain untouched.
