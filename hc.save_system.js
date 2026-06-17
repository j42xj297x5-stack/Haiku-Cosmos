// Haiku Cosmos offline encrypted save/load. Alias is the passphrase; no backend.
(function (root) {
  "use strict";
  root.HC = root.HC || {};
  const FORMAT = "haiku-cosmos-save";
  const VERSION = 1;
  const GAME = "haiku-cosmos";
  const ITERATIONS = 150000;
  const ERROR_MESSAGE = "Nie udało się odczytać pliku. Sprawdź alias/imię albo plik save.";
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  function b64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))); }
  function fromB64(value) { return Uint8Array.from(atob(String(value)), (c) => c.charCodeAt(0)); }
  function requireAlias(alias) { const a = String(alias || ""); if (!a.trim()) throw new Error("Alias is required"); return a; }
  async function deriveKey(alias, salt) {
    const material = await crypto.subtle.importKey("raw", enc.encode(requireAlias(alias)), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  function collectPayload() {
    const World = root.HC?.getWorld?.() || root.World || {};
    const cardState = root.CardEngine?.exportState?.() || { cardBank: World.cardBank || {}, cardsPool: World.cardsPool || [], metaSlots: World.metaSlots || {} };
    return {
      settings: { rendererMode: root.HC?.RENDER_MODE === "canvas2d" ? "canvas2d" : "three", submetaMode: "png-v2", hudTop: root.HC?.HudTopLayout?.getLayout?.() || null },
      resources: { rp: Number(World.score || 0), collectedCardsByColor: World.collectedCardsByColor || {}, cardBank: World.cardBank || {} },
      cards: cardState,
      submeta: { mode: "png-v2", open: !!World.subMetaOpen, metaSlots: World.metaSlots || {}, layout: root.HC?.SubMetaPngLayout?.getLayout?.() || null },
      cosmos: { planets: summarizeBodies(World.planets), asteroids: summarizeBodies(World.asteroids), stars: summarizeBodies(World.stars) }
    };
  }
  function summarizeBodies(list) { return Array.isArray(list) ? list.map((b) => ({ type: b.type || b.kind || null, mass: finite(b.mass), r: finite(b.r || b.radius), orbitRadius: finite(b.orbitRadius || b.orbitR || b.orbitPx), parentId: b.parentId || b.parent?.id || null, orbiters: Array.isArray(b.orbiters) ? b.orbiters.length : 0 })).slice(0, 200) : []; }
  function finite(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
  function validateInner(inner) { if (!inner || inner.version !== VERSION || inner.game !== GAME || !inner.payload || typeof inner.payload !== "object") throw new Error("Invalid save payload"); return inner; }
  function validateOuter(save) { if (!save || save.format !== FORMAT || save.version !== VERSION || save.kdf !== "PBKDF2" || save.cipher !== "AES-GCM" || !save.salt || !save.iv || !save.data) throw new Error("Invalid save file"); return save; }
  async function encryptPayload(alias, payload = collectPayload()) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(alias, salt);
    const inner = { version: VERSION, game: GAME, savedAt: new Date().toISOString(), payload };
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(inner)));
    return { format: FORMAT, version: VERSION, kdf: "PBKDF2", cipher: "AES-GCM", iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) };
  }
  async function decryptSave(alias, outer) {
    try {
      const save = validateOuter(typeof outer === "string" ? JSON.parse(outer) : outer);
      const key = await deriveKey(alias, fromB64(save.salt));
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(save.iv) }, key, fromB64(save.data));
      return validateInner(JSON.parse(dec.decode(plain)));
    } catch (error) { const e = new Error(ERROR_MESSAGE); e.cause = error; throw e; }
  }
  async function exportToDownload(alias, filename) {
    const save = await encryptPayload(alias);
    const blob = new Blob([JSON.stringify(save, null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename || `haiku-cosmos-save-${new Date().toISOString().slice(0,10)}.hcsave.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return save;
  }
  function applyPayload(inner) {
    const World = root.HC?.getWorld?.() || root.World;
    const payload = validateInner(inner).payload;
    if (World) { World.score = Number(payload.resources?.rp || 0); World.collectedCardsByColor = payload.resources?.collectedCardsByColor || World.collectedCardsByColor; World.cardBank = payload.resources?.cardBank || World.cardBank; World.metaSlots = payload.submeta?.metaSlots || World.metaSlots; World.subMetaOpen = false; World.paused = false; }
    if (payload.settings?.rendererMode && root.HC?.WorldRenderer?.setMode) { root.HC.RENDER_MODE = payload.settings.rendererMode === "canvas2d" ? "canvas2d" : "three"; root.HC.WorldRenderer.setMode(root.HC.RENDER_MODE); }
    return payload;
  }
  function readFile(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result || "")); r.onerror = () => reject(r.error); r.readAsText(file); }); }
  async function importFile(alias, file) { const inner = await decryptSave(alias, await readFile(file)); return applyPayload(inner); }
  root.HC.SaveSystem = { FORMAT, VERSION, GAME, ITERATIONS, ERROR_MESSAGE, collectPayload, encryptPayload, decryptSave, exportToDownload, importFile, applyPayload };
})(window);
