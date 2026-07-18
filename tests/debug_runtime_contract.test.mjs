import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../hc.debug.js', import.meta.url), 'utf8');

function createContext() {
  const store = new Map();
  const timerCalls = [];
  const downloads = [];
  const listeners = [];
  const window = {
    HC: {},
    World: { score: 0, meteors: [], asteroids: [], planets: [], moons: [], stars: [], spaceMechanics: {} },
    CardEngine: { state: { sequence: null } },
    HC_BUILD_VERSION: 'test',
    performance: { now: () => 1000 },
    localStorage: {
      get length() { return store.size; },
      key(i) { return Array.from(store.keys())[i] ?? null; },
      getItem(k) { return store.has(k) ? store.get(k) : null; },
      setItem(k, v) { store.set(String(k), String(v)); },
      removeItem(k) { store.delete(String(k)); },
    },
    document: {
      body: { appendChild() {} },
      createElement(tag) {
        return { tag, click() { if (this.download) downloads.push(this.download); }, remove() {} };
      },
    },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    Blob: class Blob { constructor(parts) { this.parts = parts; } },
    addEventListener(type, fn) { listeners.push({ type, fn }); },
    setInterval(fn, ms) { timerCalls.push({ kind: 'interval', ms }); return timerCalls.length; },
    clearInterval() {},
    setTimeout(fn, ms) { timerCalls.push({ kind: 'timeout', ms }); return timerCalls.length; },
    clearTimeout() {},
    resetWorld() { this.World.reset = (this.World.reset || 0) + 1; },
  };
  window.window = window;
  window.HC.getWorld = () => window.World;
  window.HC.resetWorld = () => window.resetWorld();
  return { context: vm.createContext(window), store, timerCalls, downloads, listeners };
}

function loadDebug() {
  const harness = createContext();
  vm.runInContext(source, harness.context, { filename: 'hc.debug.js' });
  return harness;
}

test('loading debug API is inert in normal mode', () => {
  const { context, store, timerCalls, listeners } = loadDebug();
  assert.equal(context.HC.Debug.isActive(), false);
  assert.equal(context.HC.Session.sessionId, null);
  assert.equal([...store.keys()].some((k) => k.startsWith('hc_debug_')), false);
  assert.equal(timerCalls.length, 0);
  assert.equal(listeners.some((l) => ['beforeunload', 'pagehide', 'visibilitychange'].includes(l.type)), false);
});

test('normal start cleans legacy hc_debug keys once and remains no-op over reloads/unload', () => {
  const h = loadDebug();
  h.store.set('hc_debug_old_session_meta.json', 'x');
  h.store.set('hc_debug_latest_session_key', 'x');
  h.store.set('hc.playerAlias.last', 'player');
  h.store.set('hc:release-build-id', 'build');
  h.store.set('haiku-cosmos-save', 'save');
  h.context.HC.Session.start('normal', { visual: { rendererMode: 'three' } });
  assert.equal(h.context.HC.Debug.isActive(), false);
  assert.equal(h.context.HC.Session.sessionId, null);
  assert.equal([...h.store.keys()].some((k) => k.startsWith('hc_debug_')), false);
  assert.equal(h.store.get('hc.playerAlias.last'), 'player');
  assert.equal(h.store.get('hc:release-build-id'), 'build');
  assert.equal(h.store.get('haiku-cosmos-save'), 'save');
  assert.ok(h.store.get('hc:debug-normal-cleanup-v1'));
  h.store.set('hc_debug_manual_later', 'keep');
  h.context.HC.Session.start('normal', {});
  h.context.HC.Session.start('normal', {});
  assert.equal(h.store.get('hc_debug_manual_later'), 'keep');
  assert.equal(h.downloads.length, 0);
  assert.doesNotThrow(() => h.context.HC.logEvent('debug', 'noop', {}));
});

test('debug activation and manual export are explicit; unload/end do not persist fallback', async () => {
  const h = loadDebug();
  assert.equal(h.context.HC.Debug.configure({ scenarioLabel: 'open_only' }), null);
  assert.equal(h.context.HC.Session.sessionId, null);
  h.context.HC.Debug.activate();
  assert.equal(h.context.HC.Debug.isActive(), true);
  h.context.HC.Debug.configure({ scenarioLabel: 'manual' });
  assert.equal(h.context.HC.Session.sessionId, null);
  h.context.HC.Debug.startSession({ scenarioLabel: 'manual', loggingEnabled: true });
  assert.ok(h.context.HC.Session.sessionId);
  h.context.HC.logEvent('debug', 'ram_event', { ok: true });
  assert.ok(h.context.HC.Session.logger.recentEvents.some((event) => event.type === 'ram_event'));
  assert.equal([...h.store.keys()].some((k) => k.startsWith('hc_debug_')), false);
  await h.context.HC.Session.abort('beforeunload');
  assert.equal(h.downloads.length, 0);
  assert.equal([...h.store.keys()].some((k) => k.startsWith('hc_debug_')), false);

  h.context.HC.Debug.activate();
  h.context.HC.Debug.startSession({ scenarioLabel: 'manual_export', loggingEnabled: true });
  const pack = h.context.HC.Debug.exportEvidence('manual click', 'gameplay');
  assert.ok(pack);
  assert.equal(h.downloads.length, 1);
  await h.context.HC.Debug.endSession('user_end');
  assert.equal(h.downloads.length, 1);
  assert.equal([...h.store.keys()].some((k) => k.startsWith('hc_debug_')), false);
});
