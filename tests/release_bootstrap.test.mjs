import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { buildReleaseBootstrap } from "../scripts/prepare-release-layout.mjs";

const meta = { id: "build-new", sha: "abcdef123", shortSha: "abcdef1", builtAt: "2026-07-18T00:00:00.000Z", assetBase: "/Haiku-Cosmos/builds/build-new/", latestPath: "/Haiku-Cosmos/latest/" };
const manifest = [{ kind: "style", href: "assets/app.css" }, { kind: "script", type: "classic", src: "runtime/a.js" }, { kind: "script", type: "module", src: "hc.three_module_bridge.js" }, { kind: "script", type: "classic", src: "runtime/b.js" }];

function storage(initial = {}) { const m = new Map(Object.entries(initial)); return { get length(){ return m.size; }, key(i){ return Array.from(m.keys())[i] ?? null; }, getItem(k){ return m.has(k) ? m.get(k) : null; }, setItem(k,v){ m.set(k,String(v)); }, removeItem(k){ m.delete(k); }, entries(){ return Object.fromEntries(m); } }; }
function deferred() { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; }
async function run({ href = "https://x.test/Haiku-Cosmos/latest/?v=build-new", embedded = meta, fetched = meta, local = {}, asyncGate = null } = {}) {
  const html = buildReleaseBootstrap(manifest);
  const code = html.match(/<script data-hc-release-bootstrap>([\s\S]*?)<\/script>/)[1];
  const loaded = []; const replaced = [];
  const localStorage = storage(local); const sessionStorage = storage();
  const document = { head: { appendChild(el){ loaded.push(el.href || el.src); setTimeout(() => el.onload?.(), 0); } }, createElement(tag){ return { tagName: tag }; }, getElementById(){ return { hidden:false, textContent:"" }; }, querySelector(){ return { textContent: JSON.stringify(manifest) }; } };
  const context = { window: {}, document, console, URLSearchParams, Date, Number, String, Error, Promise, setTimeout, location: { search: new URL(href).search, replace: (url) => replaced.push(url) }, localStorage, sessionStorage, navigator: { serviceWorker: { async getRegistrations(){ if (asyncGate) await asyncGate.promise; return [{ scope: "https://x.test/Haiku-Cosmos/", unregister: async () => { loaded.push("sw-unregistered"); } }]; } } }, caches: { async keys(){ return ["hc:cache", "other-cache"]; }, async open(){ return { async keys(){ return [{ url: "https://x.test/Haiku-Cosmos/runtime/old.js" }, { url: "https://x.test/other/app.js" }]; }, async delete(req){ loaded.push(`cache-delete:${req.url}`); } }; }, async delete(name){ loaded.push(`cache-delete-name:${name}`); } }, indexedDB: { async databases(){ return [{ name: "haiku-cosmos-db" }, { name: "other-db" }]; }, deleteDatabase(name){ loaded.push(`idb-delete:${name}`); const req = {}; setTimeout(() => req.onsuccess?.(), 0); return req; } }, fetch: async () => ({ ok: !!fetched, json: async () => fetched }) };
  context.window = { ...context, HC_BUILD_INFO: embedded, HC: { formatBuildVersionLabel: (i) => `Build ${i.shortSha} • 18.07.2026` } };
  for (const k of ["document","location","localStorage","sessionStorage","navigator","caches","indexedDB","fetch"]) context.window[k] = context[k];
  vm.createContext(context);
  vm.runInContext(code, context);
  await new Promise((r) => setTimeout(r, 30));
  return { loaded, replaced, localStorage: localStorage.entries(), bootstrap: context.window.HC_RELEASE_BOOTSTRAP, search: context.location.search };
}

test("matching BUILD_ID keeps ?v and loads runtime", async () => { const r = await run({ local: { "hc:release-build-id": "build-new" } }); assert.deepEqual(r.replaced, []); assert.equal(r.search, "?v=build-new"); assert(r.loaded.includes("/Haiku-Cosmos/builds/build-new/runtime/a.js")); });
test("missing or old v redirects", async () => { assert.deepEqual((await run({ href: "https://x.test/Haiku-Cosmos/latest/" })).replaced, ["/Haiku-Cosmos/latest/?v=build-new"]); assert.deepEqual((await run({ href: "https://x.test/Haiku-Cosmos/latest/?v=old" })).replaced, ["/Haiku-Cosmos/latest/?v=build-new"]); });
test("stale embedded latest redirects before runtime", async () => { const r = await run({ embedded: { ...meta, id: "old" } }); assert.deepEqual(r.replaced, ["/Haiku-Cosmos/latest/?v=build-new"]); assert.equal(r.loaded.length, 0); });
test("build change resets only Haiku Cosmos storage and same build does not reset again", async () => { const changed = await run({ local: { "hc.playerAlias.last":"L", "hc:old":"1", "haiku-cosmos-save":"x", "other":"stay" } }); assert.equal(changed.localStorage.other, "stay"); assert.equal(changed.localStorage["hc:release-build-id"], "build-new"); assert.equal(changed.bootstrap.storageResetPerformed, true); const same = await run({ local: { "hc:release-build-id":"build-new", "hc.playerAlias.last":"L" } }); assert.equal(same.bootstrap.storageResetPerformed, false); });
test("async cleanup completes before runtime", async () => { const gate = deferred(); const p = run({ local: { "hc:release-build-id":"old" }, asyncGate: gate }); await new Promise((r) => setTimeout(r, 20)); gate.resolve(); const r = await p; assert(r.loaded.indexOf("sw-unregistered") < r.loaded.indexOf("/Haiku-Cosmos/builds/build-new/runtime/a.js")); });
test("two reloads use same current runtime without legacy state returning", async () => { const first = await run({ local: { "hc:release-build-id":"build-new", "hc.playerAlias.last":"new" } }); const second = await run({ local: { "hc:release-build-id":"build-new", "hc.playerAlias.last":"new" } }); assert.deepEqual(first.loaded.filter((u) => u.includes("runtime/")), second.loaded.filter((u) => u.includes("runtime/"))); });
test("bad metadata blocks runtime", async () => { const r = await run({ fetched: { id: "bad" } }); assert.equal(r.loaded.length, 0); assert.equal(r.replaced.length, 0); });
test("dynamic URLs all use assetBase", async () => { const r = await run({ local: { "hc:release-build-id":"build-new" } }); assert(r.loaded.filter((u) => u.startsWith("/Haiku-Cosmos/builds/build-new/")).length >= 4); });
