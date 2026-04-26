#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");

function setup() {
  global.window = global.window || {};
  const events = [];
  global.window.HC = {
    DebugEventTypes: {
      SEQUENCE_DS_GRANTED: "sequence.ds_granted",
      SEQUENCE_RESET: "sequence.reset",
      SEQUENCE_CASHOUT_STARTED: "sequence.cashout_started",
      SEQUENCE_CASHOUT_COMPLETED: "sequence.cashout_completed",
      SEQUENCE_R1_ACTIVATED: "sequence.r1_activated",
      SEQUENCE_FAIL_DETECTED: "sequence.fail_detected",
      SEQUENCE_FAIL_RESOLVED: "sequence.fail_resolved",
      SEQUENCE_HIT_REGISTERED: "sequence.hit_registered",
      SEQUENCE_HIT_REJECTED: "sequence.hit_rejected",
      SEQUENCE_DIRECTION_LOCKED: "sequence.direction_locked",
      SEQUENCE_STEP_STARTED: "sequence.step_started",
      SEQUENCE_STEP_PROGRESS: "sequence.step_progress",
      SEQUENCE_STEP_COMPLETED: "sequence.step_completed",
      SEQUENCE_EXPECTED_COLOR_CHANGED: "sequence.expected_color_changed",
      SEQUENCE_STARTED: "sequence.started",
      SEQUENCE_FAILED: "sequence.failed",
      SEQUENCE_CASHOUT: "sequence.cashout",
      RP_GAINED: "rp.gained",
      RP_SPENT: "rp.spent",
      CARD_CREATED: "card.created",
      CARD_COLLECTED: "card.collected",
      CARD_ACTIVATED: "card.activated"
    },
    Session: { logger: { frame: 0, sessionStartedAt: 0 } },
    logEvent(category, type, payload) {
      events.push({ category, type, payload: payload || {} });
    }
  };

  global.performance = global.performance || { now: () => Date.now() };
  global.window.addScore = global.window.addScore || (() => {});

  require(path.resolve(__dirname, "..", "cards.js"));
  const CE = global.window.CardEngine;
  const world = { score: 0, meteors: [], metaSlots: {}, nowMs: 0 };
  CE.bindWorld(world);
  CE.resetForNewRun();
  return { CE, world, events };
}

function hit(CE, color, frame) {
  global.window.HC.Session.logger.frame = frame;
  return CE.onHitColor(color);
}

function timeoutDecisionWindow(CE, world, frame, atMs = 5000) {
  global.window.HC.Session.logger.frame = frame;
  world.nowMs = atMs;
  CE.update(0, atMs);
}

function getEvents(events, type) {
  return events.filter((e) => e.type === type);
}

(() => {
  // 1) A A A -> timeout -> A A A => AA (not R2)
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 1);
    hit(CE, "red", 2);
    hit(CE, "red", 3);
    timeoutDecisionWindow(CE, world, 4, 5000);
    hit(CE, "red", 5);
    hit(CE, "red", 6);
    hit(CE, "red", 7);

    const stepCompleted = getEvents(events, "sequence.step_completed");
    assert(stepCompleted.some((e) => e.payload.stepIndex === 1), "expected R1(A) completion");
    assert(stepCompleted.some((e) => e.payload.stepIndex === 2 && e.payload.track === "A"), "expected AA completion on A-track");
    assert(!stepCompleted.some((e) => e.payload.stepIndex === 2 && e.payload.track === "R"), "AA path must not be classified as R2");

    const continuation = getEvents(events, "sequence.continuation_resolved");
    assert(continuation.some((e) => e.payload.route === "A_LOOP_AA"), "expected continuation route A_LOOP_AA");

    const aLoopEntered = getEvents(events, "sequence.a_loop_entered");
    assert(aLoopEntered.some((e) => e.payload.loopLevel === "AA"), "expected sequence.a_loop_entered for AA");

    const windowsOpened = getEvents(events, "sequence.decision_window_opened");
    assert(
      windowsOpened.some((e) => Number(e.payload.stepIndex) === 2 && e.payload.track === "A"),
      "expected decision window after AA completion"
    );
  }

  // 2) A A A -> timeout -> A A A -> timeout -> A A A => AAA => DS + IDLE
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 10);
    hit(CE, "red", 11);
    hit(CE, "red", 12);
    timeoutDecisionWindow(CE, world, 13, 5000);
    hit(CE, "red", 14);
    hit(CE, "red", 15);
    hit(CE, "red", 16);
    timeoutDecisionWindow(CE, world, 17, 9000);
    hit(CE, "red", 18);
    hit(CE, "red", 19);
    hit(CE, "red", 20);

    const continuation = getEvents(events, "sequence.continuation_resolved");
    assert(continuation.some((e) => e.payload.route === "A_LOOP_AA"), "missing A_LOOP_AA continuation");
    assert(continuation.some((e) => e.payload.route === "A_LOOP_AAA"), "missing A_LOOP_AAA continuation");

    const dsGranted = getEvents(events, "sequence.ds_granted");
    assert(dsGranted.length >= 1, "expected DS grant after AAA");
    assert(dsGranted.some((e) => e.payload.source === "AAA" && e.payload.color === "red"), "expected AAA DS source payload");

    const resets = getEvents(events, "sequence.reset_to_idle");
    assert(resets.some((e) => e.payload.reason === "aaa_completed"), "expected reset_to_idle reason aaa_completed");

    const windowsOpened = getEvents(events, "sequence.decision_window_opened");
    assert.strictEqual(windowsOpened.length, 2, "AAA should not open a decision window");
  }

  // 3) A A A -> timeout -> B B B => R2(A,B), not AA
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 30);
    hit(CE, "red", 31);
    hit(CE, "red", 32);
    timeoutDecisionWindow(CE, world, 33, 5000);
    hit(CE, "blue", 34);
    hit(CE, "blue", 35);
    hit(CE, "blue", 36);

    const continuation = getEvents(events, "sequence.continuation_resolved");
    assert(continuation.some((e) => e.payload.route === "R_TRACK_R2"), "expected continuation route R_TRACK_R2");

    const stepCompleted = getEvents(events, "sequence.step_completed");
    assert(stepCompleted.some((e) => e.payload.stepIndex === 2 && e.payload.track === "R"), "expected R2(A,B) completion");
    assert(!continuation.some((e) => e.payload.route === "A_LOOP_AA"), "B path must not be classified as AA");
  }

  console.log("ok - cards_sequence_a_loop_aa_aaa_ds");
})();
