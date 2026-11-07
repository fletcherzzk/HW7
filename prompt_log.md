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
