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
    TRACKING_INTERVAL: 34,
    TRACKING_FRESH_MS: 240,
    TRACKING_GRACE_MS: Number(source.match(/const TRACKING_GRACE_MS = (\d+);/)[1]),
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

test("duplicate labels leave the other hand invalid", () => {
  const e = fixture(); e.labels = ["Left", "Left"]; e.frame();
  assert.equal(e.game.handTracking.left.valid, true);
  assert.equal(e.game.handTracking.right.valid, false);
});

test("returned detections with handedness scores below 0.9 are not discarded", () => {
  const e = fixture(); e.labelScore = 0.65; e.frame();
  assert.equal(e.isHandTrackingFresh("left"), true);
  assert.equal(e.isHandTrackingFresh("right"), true);
});

test("final model options use the selected detection thresholds", async () => {
  const configSource = source.slice(source.indexOf("const handThresholds"), source.indexOf("const FLIGHT_TIME"));
  let loader = source.slice(source.indexOf("async function loadVisionModels()"), source.indexOf("async function ensureAudioGraph()"));
  const importStart = loader.indexOf("    const { FilesetResolver");
  const importEnd = loader.indexOf("    const vision =", importStart);
  loader = loader.slice(0, importStart) + "    const { FilesetResolver, HandLandmarker, FaceLandmarker } = mockVision;\n" + loader.slice(importEnd);
  loader = loader.replaceAll("import.meta.url", JSON.stringify(new URL("./game.js", import.meta.url).href));
  const e = { URL, console, handLandmarker: null, faceLandmarker: null, visionLoadPromise: null };
  e.mockVision = {
    FilesetResolver: { forVisionTasks: async () => ({}) },
    HandLandmarker: { createFromOptions: async (_, options) => { e.handOptions = options; return {}; } },
    FaceLandmarker: { createFromOptions: async () => ({}) },
  };
  vm.createContext(e); vm.runInContext(configSource + loader, e);
  await e.loadVisionModels();
  assert.equal(e.handOptions.minHandDetectionConfidence, 0.35);
  assert.equal(e.handOptions.minHandPresenceConfidence, 0.35);
  assert.equal(e.handOptions.minTrackingConfidence, 0.5);
  assert.equal(e.handOptions.numHands, 2);
  assert.equal(e.handOptions.runningMode, "VIDEO");
});

test("normal smoothing is fixed and round reset clears tracking history", () => {
  const e = fixture(); e.frame();
  const raw = e.cameraToLevel(0.2, 0.4);
  assert.equal(e.game.leftLevel, 0.5 + (raw - 0.5) * 0.42);
  e.resetGame([]);
  assert.equal(e.game.handTracking.left.lastSeenAt, null);
  assert.equal(e.isHandTrackingFresh("right"), false);
});

test("grace holds a lost hand, rejects its score, and expires without being extended", () => {
  const e = fixture(); e.frame();
  const held = e.game.leftLevel;
  e.labels = ["Right"]; e.frame(); // Loss starts at 150 ms.
  assert.equal(e.handTrackingDisplayState("left"), "grace");
  assert.equal(e.isHandTrackingFresh("left"), false);
  e.game.chart = ["left", "right"].map(hand => ({ hand, time: 0, level: e.game[hand + "Level"], tolerance: 1 }));
  e.evaluateNotes(1);
  assert.deepEqual(e.hits, ["right"]);
  assert.deepEqual(e.misses, [["left", "NO TRACK!"]]);
  e.frame(); e.frame(); // Repeated missing results must not restart grace.
  assert.equal(e.game.leftLevel, held);
  assert.equal(e.handTrackingDisplayState("left", 449), "grace");
  assert.equal(e.handTrackingDisplayState("left", 450), "lost");
  assert.equal(e.handTrackingDisplayState("right", 450), "tracked");
});

test("short-gap recovery clears grace and a later loss gets its own interval", () => {
  const e = fixture(); e.frame();
  e.labels = ["Right"]; e.frame();
  e.labels = ["Right", "Left"]; e.frame();
  assert.equal(e.handTrackingDisplayState("left"), "tracked");
  assert.equal(e.game.handTracking.left.lostSinceAt, null);
  e.labels = ["Right"]; e.frame();
  assert.equal(e.game.handTracking.left.lostSinceAt, 250);
  assert.equal(e.handTrackingDisplayState("left", 549), "grace");
  assert.equal(e.handTrackingDisplayState("left", 550), "lost");
});

test("stalled frames get display grace after freshness expires but cannot score", () => {
  const e = fixture(); e.frame();
  e.clock = 340; // Last good data at 100 ms; freshness expires now.
  e.updateTracking(e.clock); // No new camera frame.
  assert.equal(e.handTrackingDisplayState("left"), "grace");
  assert.equal(e.isHandTrackingFresh("left"), false);
  e.game.chart = [{ hand: "left", time: 0, level: e.game.leftLevel, tolerance: 1 }];
  e.evaluateNotes(1);
  assert.deepEqual(e.hits, []);
  assert.equal(e.handTrackingDisplayState("left", 640), "lost");
  e.clock = 600; e.labels = []; e.frame(); // A late missing result cannot restart grace.
  assert.equal(e.handTrackingDisplayState("left"), "lost");
});

test("unseen/reset hands never get grace and face loss cannot score during grace", () => {
  const e = fixture();
  assert.equal(e.handTrackingDisplayState("left"), "lost");
  e.frame(); e.faceVisible = false; e.frame();
  assert.equal(e.handTrackingDisplayState("left"), "grace");
  assert.equal(e.isHandTrackingFresh("left"), false);
  assert.equal(e.isHandTrackingFresh("right"), false);
  e.resetGame([]);
  assert.equal(e.handTrackingDisplayState("left"), "lost");
  assert.equal(e.game.handTracking.left.lostSinceAt, null);
});

test("HUD holds the warning during grace and names the missing hand after expiry", () => {
  const e = fixture(); e.frame(); e.labels = ["Right"]; e.frame();
  for (const name of ["scoreValue", "comboValue", "multiplierValue", "judgementValue", "trackingStatus"]) e[name] = {};
  e.scoreMultiplier = () => 1;
  vm.runInContext(source.slice(source.indexOf("function updateHud()"), source.indexOf("function render(")), e);
  e.updateHud();
  assert.equal(e.trackingStatus.textContent, "BRIEF TRACKING GAP / HOLDING POSITION");
  assert.doesNotMatch(e.trackingStatus.className, /warning/);
  e.frame(); e.frame(); e.clock = 450; e.updateHud();
  assert.equal(e.trackingStatus.textContent, "LEFT HAND NOT TRACKED / RIGHT ACTIVE");
  assert.match(e.trackingStatus.className, /warning/);
});
