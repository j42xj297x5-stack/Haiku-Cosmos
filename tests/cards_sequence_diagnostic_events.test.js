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
  const world = { score: 0, meteors: [], metaSlots: {}, nowMs: 1 };
  CE.bindWorld(world);
  CE.resetForNewRun();
  return { CE, world, events };
}

function hit(CE, color, frame) {
  global.window.HC.Session.logger.frame = frame;
  return CE.onHitColor(color);
}

(() => {
  const { CE, world, events } = setup();

  // flow 1: decision window timeout telemetry
  hit(CE, "red", 0);
  hit(CE, "red", 1);
  hit(CE, "red", 2);
  CE.update(0, 10000);

  const types = events.map((e) => e.type);
  const mustIncludeTimeout = [
    "sequence.decision_window_opened",
    "sequence.decision_window_timeout",
  ];

  mustIncludeTimeout.forEach((eventType) => {
    assert(types.includes(eventType), `missing diagnostic event: ${eventType}`);
  });
  assert(
    types.includes("sequence.a_loop_entered") || types.includes("sequence.continuation_resolved"),
    "missing diagnostic event: sequence.a_loop_entered or sequence.continuation_resolved"
  );

  // flow 2: AAA -> DS -> IDLE telemetry
  CE.resetForNewRun();
  hit(CE, "red", 10);
  hit(CE, "red", 11);
  hit(CE, "red", 12);
  hit(CE, "red", 13);
  hit(CE, "red", 14);
  hit(CE, "red", 15);
  hit(CE, "red", 16);
  hit(CE, "red", 17);
  hit(CE, "red", 18);

  const typesAfterAaa = events.map((e) => e.type);
  assert(typesAfterAaa.includes("sequence.ds_granted"), "missing diagnostic event: sequence.ds_granted");
  assert(typesAfterAaa.includes("sequence.reset_to_idle"), "missing diagnostic event: sequence.reset_to_idle");

  const dsEvent = events.find((e) => e.type === "sequence.ds_granted");
  assert(dsEvent && dsEvent.payload && dsEvent.payload.source === "AAA", "sequence.ds_granted should identify AAA source");

  const resetEvent = events.find((e) => e.type === "sequence.reset_to_idle");
  assert(resetEvent && resetEvent.payload && resetEvent.payload.reason === "aaa_completed", "sequence.reset_to_idle should report aaa_completed reason");

  // keep linter quiet about world usage (ensures binding wasn't optimized away)
  assert(world && world.metaSlots, "world should be initialized");

  console.log("ok - cards_sequence_diagnostic_events");
})();
