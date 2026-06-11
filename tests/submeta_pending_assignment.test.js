const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const cards = [
  { key: "R1_DR_red", kind: "R1", tier: "DR", color: "red", colors: ["red"], count: 1 },
  { key: "R1_RU_red", kind: "R1", tier: "RU", color: "red", colors: ["red"], count: 1 },
];
const assignments = {};
const world = { score: 17, cardsPool: cards.map((card, index) => ({ ...card, id: `pool-${index}`, inSlotKey: null })) };
let assignmentCalls = 0;
let placeholderSyncs = 0;

function sameCard(left, right) {
  return left?.kind === right?.kind && left?.tier === right?.tier && left?.colors?.join("|") === right?.colors?.join("|");
}

const subMetaView = {
  ensureCardsPool() {},
  getInventoryEntries: () => cards,
  getPrgAvailableCards: () => cards.filter((card) => !world.cardsPool.find((item) => sameCard(item, card))?.inSlotKey),
  getPlaceholderAssignments: () => ({ ...assignments }),
  getCardByKey: (key) => cards.find((card) => card.key === key) || null,
  getCardTitle: (card) => card.key,
  getEffectLines: () => ["efekt"],
  getHaikuLines: () => ["haiku"],
  assignPlaceholderCard(_world, placeholderId, _target, card) {
    assignmentCalls += 1;
    if (assignments[placeholderId]) return { ok: false, reason: "occupied" };
    const poolCard = world.cardsPool.find((item) => !item.inSlotKey && sameCard(item, card));
    if (!poolCard) return { ok: false, reason: "unavailable" };
    poolCard.inSlotKey = `submeta:placeholder:${placeholderId}`;
    const assignment = {
      placeholderId,
      cardKey: card.key,
      poolCardId: poolCard.id,
      inSlotKey: poolCard.inSlotKey,
      kind: card.kind,
      tier: card.tier,
      colors: card.colors.slice(),
    };
    assignments[placeholderId] = assignment;
    return { ok: true, assignment };
  },
};

const document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  head: { appendChild() {} },
  createElement: () => ({
    style: {}, dataset: {}, classList: { add() {}, toggle() {} }, appendChild() {}, addEventListener() {},
    remove() {}, setAttribute() {}, replaceChildren() {}, querySelectorAll: () => [],
  }),
};
const placeholders = [
  { id: "prg.forma.r1.1", group: "PRG R1", subgroup: "forma", kind: "card", state: "free_active", label: "Forma 1" },
  { id: "prg.forma.r1.2", group: "PRG R1", subgroup: "forma", kind: "card", state: "free_active", label: "Forma 2" },
];
const window = {
  HC: {
    getWorld: () => world,
    SubMetaPlaceholders: {
      getPlaceholders: () => placeholders,
      syncDom: () => { placeholderSyncs += 1; },
      selectPlaceholder() {},
    },
    SubMetaPngLayout: { refreshConfirmButton() {} },
  },
  CardEngine: { subMetaView },
  document,
  console,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
};

vm.runInNewContext(
  fs.readFileSync(path.join(repoRoot, "hc.submeta_panels.js"), "utf8"),
  { window, document, console, Date, fetch: undefined },
  { filename: "hc.submeta_panels.js" },
);

const panels = window.HC.SubMetaPanels;
assert.equal(panels.selectPlaceholder(placeholders[0]), true);
assert.equal(panels.selectCard(cards[0], "possibilities"), true);
assert.equal(assignmentCalls, 0, "clicking a possibility must not mutate the assignment model");
assert.equal(world.cardsPool[0].inSlotKey, null, "the pool card must remain available before confirmation");
assert.equal(world.score, 17, "staging must not deduct RP");
assert.equal(panels.getConfirmButtonState(), "ready");
assert.equal(panels.getPendingAssignment().placeholderId, placeholders[0].id);
assert.equal(panels.getPendingAssignment().cardKey, cards[0].key);
assert.equal(panels.getCardViewState().assignmentMessage, "Zmiana oczekuje na potwierdzenie.");

assert.equal(panels.selectCard(cards[1], "possibilities"), true);
assert.equal(panels.getPendingAssignment().cardKey, cards[1].key, "another possibility should replace the pending card for the same slot");
assert.equal(assignmentCalls, 0);

assert.equal(panels.selectCard(cards[0], "inventory"), true);
assert.equal(panels.getPendingAssignment().cardKey, cards[1].key, "inventory inspection must preserve pending assignment");

assert.equal(panels.selectPlaceholder(placeholders[1]), true);
assert.equal(panels.getPendingAssignment(), null, "selecting another placeholder should cancel pending assignment");
assert.equal(panels.getConfirmButtonState(), "inactive");
assert.equal(assignmentCalls, 0);

assert.equal(panels.selectPlaceholder(placeholders[0]), true);
assert.equal(panels.selectCard(cards[0], "possibilities"), true);
assert.equal(panels.confirmPendingAssignment(), true);
assert.equal(assignmentCalls, 1, "confirmation should perform exactly one final assignment");
assert.equal(panels.getPendingAssignment(), null);
assert.equal(panels.getConfirmButtonState(), "inactive");
assert.equal(assignments[placeholders[0].id].cardKey, cards[0].key);
assert.equal(world.cardsPool[0].inSlotKey, `submeta:placeholder:${placeholders[0].id}`);
assert.equal(world.score, 17, "confirmation must not deduct RP in this stage");
assert.ok(placeholderSyncs > 0, "staging and confirmation should refresh placeholder rendering");

console.log("submeta_pending_assignment.test.js: OK");
