#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");

global.window = global.window || {};
global.window.HC = global.window.HC || {};

require(path.resolve(__dirname, "..", "hc.hud_v2.js"));

const buildViewModel = global.window.HC.HUDV2.buildViewModel;

(() => {
  const world = {
    score: 42,
    cardsPool: [
      { id: "CARD_R1_RED", kind: "R1", colorA: "red" },
      { id: "CARD_R1_RED_2", kind: "R1", colorA: "red", inSlotKey: "forma.0" },
      { id: "CARD_R1_BLUE", kind: "R1", colorA: "blue" }
    ],
    pendingCard: { id: "CARD_R2_RED_YELLOW", kind: "R2", colorA: "red" },
    pendingCardUntilMs: 5000,
    runColorTimers: { red: 4500 },
    runColorDurations: { red: 1000 },
    sequencePulseColors: ["red"],
    sequenceFlashColors: []
  };
  const cardEngine = { state: { sequence: { currentColor: "red", hits: 2, stage: "R2", track: "R", stepIndex: 2 } } };
  const before = JSON.stringify(world.cardsPool);
  const vm = buildViewModel(world, cardEngine, 4200);

  assert.strictEqual(vm.sequenceRows.length, 4, "expected 4 sequence rows");
  assert.deepStrictEqual(vm.sequenceRows.map((row) => row.colorKey), ["red", "yellow", "green", "blue"]);
  assert.strictEqual(vm.sequenceRows[0].r1Count, 1, "R1 count should include only available cards");
  assert.strictEqual(vm.specialSlots.length, 3, "special slots should be placeholders with length 3");
  assert.strictEqual(JSON.stringify(world.cardsPool), before, "cardsPool should not be mutated");

  const fallbackVm = buildViewModel(null, null, 0);
  assert.strictEqual(fallbackVm.sequenceRows.length, 4, "fallback should still return 4 rows");
  assert.ok(fallbackVm.warnings.length >= 1, "fallback should emit warnings");

  console.log("ok - hud_v2_view_model_smoke");
})();
