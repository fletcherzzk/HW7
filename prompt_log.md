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
