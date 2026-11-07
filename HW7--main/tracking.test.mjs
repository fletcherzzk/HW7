import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import test from "node:test";

// Exercise the actual game functions with controlled CV output and time.
// No camera, model download, or duplicated tracking implementation is needed.
const source = readFileSync(new URL("./game.js", import.meta.url), "utf8");
const trackingSource = source.slice(source.indexOf("function updateTracking(now)"), source.indexOf("function recordHit("));
const resetSource = source.slice(source.indexOf("function resetGame(chart)"), source.indexOf("function gameLoop("));

function fixture() {
  const environment = {
    game: {},
    trackingExperiment: { enabled: true, smoothing: true, sample: null },
    TRACKING_INTERVAL: 34,
    cameraVideo: { readyState: 4, videoWidth: 640, currentTime: 0 },
    clock: 100,
    labels: ["Right", "Left"],
    labelScore: 0.9,
    faceVisible: true,
    hits: [], misses: [],
    updateHud() {},
    smooth: (a, b, amount) => a + (b - a) * amount,
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
  };
  environment.performance = { now: () => environment.clock };
  environment.handLandmarker = { detectForVideo: () => ({
    landmarks: environment.labels.map(() => Array(10).fill({ y: 0.2 })),
    handedness: environment.labels.map(categoryName => [{ categoryName, score: environment.labelScore }]),
  }) };
  environment.faceLandmarker = { detectForVideo: () => ({
    faceLandmarks: environment.faceVisible ? [[{}, { y: 0.4 }]] : [],
  }) };
  environment.recordHit = note => environment.hits.push(note.hand);
  environment.recordMiss = (note, label) => environment.misses.push([note.hand, label]);
  vm.createContext(environment);
  vm.runInContext(trackingSource + resetSource, environment);
  environment.resetGame([]);
  environment.frame = () => {
    environment.cameraVideo.currentTime += 0.05;
    environment.updateTracking(environment.clock);
    environment.clock += 50;
  };
  return environment;
}

test("one missing hand does not freeze or invalidate the other", () => {
  for (const [label, active, missing] of [["Left", "left", "right"], ["Right", "right", "left"]]) {
    const e = fixture(); e.labels = [label]; e.frame();
    assert.notEqual(e.game[active + "Level"], 0.5);
    assert.equal(e.game[missing + "Level"], 0.5);
    assert.equal(e.isHandTrackingFresh(active), true);
    assert.equal(e.isHandTrackingFresh(missing), false);
    assert.equal(e.game.trackingValid, false); // Calibration still requires both.
    e.game.chart = [active, missing].map(hand => ({ hand, time: 0, level: e.game[hand + "Level"], tolerance: 0.01 }));
    e.evaluateNotes(1); e.evaluateNotes(1);
    assert.deepEqual(e.hits, [active]);
    assert.deepEqual(e.misses, [[missing, "NO TRACK!"]]);
  }
});

test("loss immediately invalidates a hand; recovery updates it again", () => {
  const e = fixture(); e.frame();
  const lastLeft = e.game.handTracking.left.lastSeenAt;
  e.labels = ["Right"]; e.frame();
  assert.equal(e.isHandTrackingFresh("left"), false);
  assert.equal(e.game.handTracking.left.lastSeenAt, lastLeft);
  assert.equal(e.isHandTrackingFresh("right"), true);
  e.labels = ["Right", "Left"]; e.frame();
  assert.equal(e.isHandTrackingFresh("left"), true);
  assert.equal(e.game.trackingValid, true);
});

test("missing face and model errors invalidate both hands", () => {
  const e = fixture(); e.frame();
  e.faceVisible = false; e.frame();
  assert.equal(e.isHandTrackingFresh("left"), false);
  assert.equal(e.isHandTrackingFresh("right"), false);
  e.faceVisible = true; e.frame();
  e.faceLandmarker.detectForVideo = () => { throw Error("test failure"); };
  e.frame();
  assert.equal(e.isHandTrackingFresh("left"), false);
  assert.equal(e.isHandTrackingFresh("right"), false);
});

test("stale camera frames cannot score and unavailable video invalidates tracking", () => {
  const e = fixture(); e.frame();
  e.clock = 340;
  e.updateTracking(e.clock); // Unchanged camera frame.
  assert.equal(e.isHandTrackingFresh("left"), false);
  assert.equal(e.isHandTrackingFresh("right"), false);
  e.game.chart = [{ hand: "left", time: 0, level: e.game.leftLevel, tolerance: 1 }];
  e.evaluateNotes(1);
  assert.deepEqual(e.hits, []);
  assert.deepEqual(e.misses, [["left", "NO TRACK!"]]);
  e.cameraVideo.readyState = 0; e.updateTracking(e.clock);
  assert.equal(e.game.handTracking.left.valid, false);
});

test("diagnostics expose duplicate labels and their classification scores", () => {
  const e = fixture(); e.labels = ["Left", "Left"]; e.frame();
  assert.equal(e.trackingExperiment.sample.handCount, 2);
  assert.match(e.trackingExperiment.sample.labels, /0: Left \(0\.900\), 1: Left/);
  assert.equal(e.game.handTracking.left.valid, true);
  assert.equal(e.game.handTracking.right.valid, false);
});

test("returned detections with handedness scores below 0.9 are not discarded", () => {
  const e = fixture(); e.labelScore = 0.65; e.frame();
  assert.equal(e.isHandTrackingFresh("left"), true);
  assert.equal(e.isHandTrackingFresh("right"), true);
  assert.match(e.trackingExperiment.sample.labels, /0\.650/);
});

test("baseline and relaxed model threshold configuration are explicit and bounded", () => {
  const configSource = source.slice(source.indexOf("const handThresholdPresets"), source.indexOf("// Opt-in experiment"));
  for (const [query, expected] of [["", "baseline"], ["?handSensitivity=relaxed", "relaxed"], ["?handSensitivity=invalid", "baseline"]]) {
    const e = { URLSearchParams, location: { search: query } };
    vm.createContext(e);
    vm.runInContext(configSource + ";globalThis.selected = handThresholdPreset; globalThis.options = handThresholds;", e);
    assert.equal(e.selected, expected);
    assert.equal(e.options.minHandDetectionConfidence, expected === "relaxed" ? 0.35 : 0.5);
    assert.equal(e.options.minHandPresenceConfidence, expected === "relaxed" ? 0.35 : 0.5);
    assert.equal(e.options.minTrackingConfidence, 0.5);
  }
});

test("original smoothing and opt-in direct mode remain distinct; reset clears history", () => {
  const e = fixture(); e.frame();
  const raw = e.trackingExperiment.sample.leftRaw;
  assert.equal(e.game.leftLevel, 0.5 + (raw - 0.5) * 0.42);
  e.trackingExperiment.smoothing = false; e.frame();
  assert.equal(e.game.leftLevel, raw);
  e.resetGame([]);
  assert.equal(e.game.handTracking.left.lastSeenAt, null);
  assert.equal(e.isHandTrackingFresh("right"), false);
  assert.equal(e.trackingExperiment.sample, null);
});
