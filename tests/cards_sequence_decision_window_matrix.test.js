#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");

const SCREEN_W = 1000;
const SCREEN_H = 700;
const LEFT_CLICK = { x: 320, y: 145 };
const RIGHT_CLICK = { x: 590, y: 145 };

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

function updateAt(CE, world, frame, nowMs) {
  global.window.HC.Session.logger.frame = frame;
  world.nowMs = nowMs;
  CE.update(0, nowMs);
}

function click(CE, frame, point) {
  global.window.HC.Session.logger.frame = frame;
  return CE.handlePointerDown(point.x, point.y, SCREEN_W, SCREEN_H);
}

function getEvents(events, type) {
  return events.filter((e) => e.type === type);
}

function hasCard(world, kind, colors) {
  const target = (colors || []).join(",");
  return (world.cardsPool || []).some((card) => {
    const cardKind = String(card.kind || card.type || "").toUpperCase();
    const cardColors = [card.colorA, card.colorB, card.colorC, card.colorD]
      .filter(Boolean)
      .join(",");
    return cardKind === String(kind).toUpperCase() && cardColors === target;
  });
}

(() => {
  // R1: left click activates R1(A) and resets to IDLE
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 1);
    hit(CE, "red", 2);
    hit(CE, "red", 3);
    assert.strictEqual(Boolean(CE.state.sequenceOverlay.visible), true, "R1 should open decision window");

    const handled = click(CE, 4, LEFT_CLICK);
    assert.strictEqual(handled, true, "left click should be handled");
    assert.strictEqual(CE.state.sequence.stage, "IDLE", "left click should reset sequence to IDLE");

    const closeEvents = getEvents(events, "sequence.decision_window_closed");
    assert(closeEvents.some((e) => e.payload.clickedSide === "left" && String(e.payload.selectedAction || "").startsWith("activate:R1:red")), "left close event should contain clickedSide and selectedAction");
    const resetEvents = getEvents(events, "sequence.reset_to_idle");
    assert(resetEvents.some((e) => e.payload.reason === "activation"), "left click should emit reset_to_idle reason=activation");
    assert.strictEqual(hasCard(world, "R1", ["red"]), false, "left click should not collect R1 into pool");
  }

  // R1: right click cashout collects R1(A) and resets to IDLE
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 10);
    hit(CE, "red", 11);
    hit(CE, "red", 12);

    const handled = click(CE, 13, RIGHT_CLICK);
    assert.strictEqual(handled, true, "right click should be handled");
    assert.strictEqual(CE.state.sequence.stage, "IDLE", "right click should reset sequence to IDLE");
    assert.strictEqual(hasCard(world, "R1", ["red"]), true, "right click should collect R1(A)");

    const closeEvents = getEvents(events, "sequence.decision_window_closed");
    assert(closeEvents.some((e) => e.payload.clickedSide === "right" && String(e.payload.selectedAction || "").startsWith("cashout:R1")), "right close event should contain clickedSide and selectedAction");
    const resetEvents = getEvents(events, "sequence.reset_to_idle");
    assert(resetEvents.some((e) => e.payload.reason === "cashout"), "right click should emit reset_to_idle reason=cashout");
  }

  // R1: timeout continues; click after TTL is ignored
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 20);
    hit(CE, "red", 21);
    hit(CE, "red", 22);
    updateAt(CE, world, 23, 5000);

    assert.strictEqual(Boolean(CE.state.sequenceOverlay.visible), false, "window should close after TTL");
    assert.strictEqual(CE.state.sequence.stage, "CHOOSE", "R1 timeout should continue into CHOOSE state");

    const handledAfterTtl = click(CE, 24, LEFT_CLICK);
    assert.strictEqual(handledAfterTtl, false, "click after TTL should be ignored");

    const timeoutEvents = getEvents(events, "sequence.decision_window_timeout");
    assert(timeoutEvents.length >= 1, "should emit sequence.decision_window_timeout");
    const opened = getEvents(events, "sequence.decision_window_opened");
    assert(opened.some((e) => e.payload.offeredActions && e.payload.offeredActions.timeoutContinuationTarget), "opened event should include offeredActions.timeoutContinuationTarget");
    const closedAfterTtl = getEvents(events, "sequence.decision_window_closed").filter((e) => (e.payload.clickedSide === "left" || e.payload.clickedSide === "right") && (e.payload.reason === "activate" || e.payload.reason === "cashout"));
    assert.strictEqual(closedAfterTtl.length, 0, "no decision_window_closed click event should occur after TTL");
  }

  // AA: left click activate, right click collect 2xR1A, timeout->AAA and click after TTL ignored
  {
    const { CE, world, events } = setup();

    // left on AA
    hit(CE, "red", 30); hit(CE, "red", 31); hit(CE, "red", 32);
    updateAt(CE, world, 33, 5000);
    hit(CE, "red", 34); hit(CE, "red", 35); hit(CE, "red", 36);
    click(CE, 37, LEFT_CLICK);
    assert.strictEqual(CE.state.sequence.stage, "IDLE", "AA left should reset to IDLE");

    // right on AA
    CE.resetForNewRun();
    hit(CE, "red", 40); hit(CE, "red", 41); hit(CE, "red", 42);
    updateAt(CE, world, 43, 5000);
    hit(CE, "red", 44); hit(CE, "red", 45); hit(CE, "red", 46);
    click(CE, 47, RIGHT_CLICK);
    const r1RedCount = (world.cardsPool || []).filter((card) => String(card.kind || card.type || "").toUpperCase() === "R1" && card.colorA === "red").length;
    assert(r1RedCount >= 2, "AA right should collect 2xR1(red)");

    // timeout after AA -> AAA + click after TTL ignored
    CE.resetForNewRun();
    hit(CE, "red", 50); hit(CE, "red", 51); hit(CE, "red", 52);
    updateAt(CE, world, 53, 5000);
    hit(CE, "red", 54); hit(CE, "red", 55); hit(CE, "red", 56);
    updateAt(CE, world, 57, 9000);
    assert.strictEqual(CE.state.sequenceOverlay.visible, false, "AA window should close on timeout");
    const handledAfterTtl = click(CE, 58, RIGHT_CLICK);
    assert.strictEqual(handledAfterTtl, false, "AA click after TTL should be ignored");
    hit(CE, "red", 59);
    const continuation = getEvents(events, "sequence.continuation_resolved");
    assert(continuation.some((e) => e.payload.route === "A_LOOP_AAA"), "AA timeout + A should route to AAA");
  }

  // R2: right click collects R2AB; timeout + C leads to R3; click after TTL ignored
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 60); hit(CE, "red", 61); hit(CE, "red", 62);
    updateAt(CE, world, 63, 5000);
    hit(CE, "blue", 64); hit(CE, "blue", 65); hit(CE, "blue", 66);
    click(CE, 67, RIGHT_CLICK);
    assert.strictEqual(hasCard(world, "R2", ["red", "blue"]), true, "R2 right should collect R2(red,blue)");

    CE.resetForNewRun();
    hit(CE, "red", 70); hit(CE, "red", 71); hit(CE, "red", 72);
    updateAt(CE, world, 73, 5000);
    hit(CE, "blue", 74); hit(CE, "blue", 75); hit(CE, "blue", 76);
    updateAt(CE, world, 77, 9000);
    const handledAfterTtl = click(CE, 78, LEFT_CLICK);
    assert.strictEqual(handledAfterTtl, false, "R2 click after TTL should be ignored");
    hit(CE, "green", 79);
    const continuation = getEvents(events, "sequence.continuation_resolved");
    assert(continuation.some((e) => e.payload.route === "R_TRACK_R3"), "R2 timeout + C should route to R3");
  }

  // R3: right click collects R3ABC; timeout + D leads to R4
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 80); hit(CE, "red", 81); hit(CE, "red", 82);
    updateAt(CE, world, 83, 5000);
    hit(CE, "yellow", 84); hit(CE, "yellow", 85); hit(CE, "yellow", 86);
    updateAt(CE, world, 87, 9000);
    hit(CE, "green", 88); hit(CE, "green", 89); hit(CE, "green", 90);
    click(CE, 91, RIGHT_CLICK);
    assert.strictEqual(hasCard(world, "R3", ["red", "yellow", "green"]), true, "R3 right should collect R3(red,yellow,green)");

    CE.resetForNewRun();
    hit(CE, "red", 92); hit(CE, "red", 93); hit(CE, "red", 94);
    updateAt(CE, world, 95, 5000);
    hit(CE, "yellow", 96); hit(CE, "yellow", 97); hit(CE, "yellow", 98);
    updateAt(CE, world, 99, 9000);
    hit(CE, "green", 100); hit(CE, "green", 101); hit(CE, "green", 102);
    updateAt(CE, world, 103, 13000);
    hit(CE, "blue", 104);
    const continuation = getEvents(events, "sequence.continuation_resolved");
    assert(continuation.some((e) => e.payload.route === "R_TRACK_R4"), "R3 timeout + D should route to R4");
  }

  // R4: right click collects R4ABCD and resets to IDLE
  {
    const { CE, world } = setup();
    hit(CE, "red", 110); hit(CE, "red", 111); hit(CE, "red", 112);
    updateAt(CE, world, 113, 5000);
    hit(CE, "yellow", 114); hit(CE, "yellow", 115); hit(CE, "yellow", 116);
    updateAt(CE, world, 117, 9000);
    hit(CE, "green", 118); hit(CE, "green", 119); hit(CE, "green", 120);
    updateAt(CE, world, 121, 13000);
    hit(CE, "blue", 122); hit(CE, "blue", 123); hit(CE, "blue", 124);
    click(CE, 125, RIGHT_CLICK);
    assert.strictEqual(hasCard(world, "R4", ["red", "yellow", "green", "blue"]), true, "R4 right should collect R4(red,yellow,green,blue)");
    assert.strictEqual(CE.state.sequence.stage, "IDLE", "R4 right should reset sequence to IDLE");
  }

  // AAA: no decision window after AAA completion
  {
    const { CE, world, events } = setup();
    hit(CE, "red", 130); hit(CE, "red", 131); hit(CE, "red", 132);
    updateAt(CE, world, 133, 5000);
    hit(CE, "red", 134); hit(CE, "red", 135); hit(CE, "red", 136);
    updateAt(CE, world, 137, 9000);
    hit(CE, "red", 138); hit(CE, "red", 139); hit(CE, "red", 140);

    const opened = getEvents(events, "sequence.decision_window_opened");
    assert.strictEqual(opened.length, 2, "AAA should not open a decision window after AAA completion");
    const dsGranted = getEvents(events, "sequence.ds_granted");
    assert(dsGranted.some((e) => e.payload.source === "AAA"), "AAA should auto grant DS with source AAA");
    assert.strictEqual(Boolean(CE.state.sequenceOverlay.visible), false, "AAA completion should have no active decision window");
  }

  console.log("ok - cards_sequence_decision_window_matrix");
})();
