#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");

function bootstrapCardEngine() {
  global.window = global.window || {};
  global.window.HC = global.window.HC || {};
  global.window.HC.Session = global.window.HC.Session || { logger: { frame: 0 } };
  global.performance = global.performance || { now: () => Date.now() };
  if (!global.window.addScore) global.window.addScore = () => {};

  require(path.resolve(__dirname, "..", "cards.js"));
  const CE = global.window.CardEngine;
  const world = { score: 0, meteors: [], metaSlots: {} };
  CE.bindWorld(world);
  return { CE, world };
}

function playHits(CE, hits) {
  CE.resetForNewRun();
  const out = [];
  for (let i = 0; i < hits.length; i += 1) {
    global.window.HC.Session.logger.frame = i;
    out.push(CE.onHitColor(hits[i]));
  }
  return out;
}

function assertActions(results, expectedActions, label) {
  const actions = results.map((r) => r.action);
  assert.deepStrictEqual(actions, expectedActions, `${label}: unexpected action sequence`);
}

function assertTakeover(results, index, expectedColor, label) {
  const snapshot = results[index]?.snapshot || {};
  assert.strictEqual(results[index]?.action, "dir", `${label}: expected dir action at index ${index}`);
  assert.strictEqual(snapshot.currentColor, expectedColor, `${label}: expected currentColor=${expectedColor} at index ${index}`);
  assert.strictEqual(snapshot.hits, 1, `${label}: expected hits=1 at index ${index}`);
}

(() => {
  const { CE } = bootstrapCardEngine();

  // 1) R1 takeover: A B B B
  const s1 = playHits(CE, ["red", "blue", "blue", "blue"]);
  assertActions(s1, ["dir", "dir", "open", "close"], "R1 takeover A B B B");
  assertTakeover(s1, 1, "blue", "R1 takeover A B B B");

  // 2) R2 fail + immediate takeover: A A A B B C C C
  const s2 = playHits(CE, ["red", "red", "red", "blue", "blue", "green", "green", "green"]);
  assertActions(s2, ["dir", "open", "close", "dir", "open", "dir", "open", "close"], "R2 fail takeover");
  assertTakeover(s2, 5, "green", "R2 fail takeover");

  // 3) R3 fail + immediate takeover: A A A B B B C C D D D
  const s3 = playHits(CE, ["red", "red", "red", "yellow", "yellow", "yellow", "green", "green", "blue", "blue", "blue"]);
  assertActions(s3, ["dir", "open", "close", "dir", "open", "close", "dir", "open", "dir", "open", "close"], "R3 fail takeover");
  assertTakeover(s3, 8, "blue", "R3 fail takeover");

  // 4) R4 fail + immediate takeover:
  // A A A B B B C C C D D E E E (E zawinięte do red przy 4 kolorach)
  const s4 = playHits(CE, ["red", "red", "red", "yellow", "yellow", "yellow", "green", "green", "green", "blue", "blue", "red", "red", "red"]);
  assertActions(s4, ["dir", "open", "close", "dir", "open", "close", "dir", "open", "close", "dir", "open", "dir", "open", "close"], "R4 fail takeover");
  assertTakeover(s4, 11, "red", "R4 fail takeover");

  console.log("ok - cards_sequence_rtrack_takeover_smoke");
})();
