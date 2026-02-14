console.log("[HC] cards.js loaded (facade)");

(function initCardEngineFacade(global) {
  let _metaApi = null;

  function getCardMetaApi() {
    if (_metaApi) return _metaApi;
    const factory = (typeof window !== "undefined" && window.CardMeta && window.CardMeta.create)
      ? window.CardMeta.create
      : null;
    if (typeof factory !== "function") return null;
    _metaApi = factory({
      registry: global.CardRegistry || null,
      sequences: global.CardSequences || null,
      world: global.World || null,
    });
    return _metaApi;
  }

  function withMeta(fn, fallback) {
    const api = getCardMetaApi();
    if (!api || typeof fn !== "function") return fallback;
    return fn(api);
  }

  const CardEngine = {
    get config() { return withMeta((api) => api.config, {}); },
    get state() { return withMeta((api) => api.state, {}); },

    bindWorld: (world) => withMeta((api) => api.bindWorld(world), false),
    isColorR1Active: (colorKey, nowMs) => withMeta((api) => api.isColorR1Active(colorKey, nowMs), false),

    getTargetLibrary: () => withMeta((api) => api.getTargetLibrary(), []),
    getTargetMeta: (id) => withMeta((api) => api.getTargetMeta(id), null),

    resetForNewRun: () => withMeta((api) => api.resetForNewRun(), undefined),
    offerCardById: (cardId) => withMeta((api) => api.offerCardById(cardId), false),
    update: (dt, now) => withMeta((api) => api.update(dt, now), undefined),
    render: (ctx, screenW, screenH) => withMeta((api) => api.render(ctx, screenW, screenH), undefined),
    handlePointerDown: (mx, my, screenW, screenH) => withMeta((api) => api.handlePointerDown(mx, my, screenW, screenH), false),
    onRunActivateR1: (payload = {}) => withMeta((api) => api.onRunActivateR1(payload), false),
    onRunActivateR2: (payload = {}) => withMeta((api) => api.onRunActivateR2(payload), false),
    onHitColor: (colorKey) => withMeta((api) => api.onHitColor(colorKey), { action: "ignored", snapshot: null }),
    seqSim: (hitsArray) => withMeta((api) => api.seqSim(hitsArray), null),
    seqSimTests: () => withMeta((api) => api.seqSimTests(), null),
    seqProbeSimAAA: (colorKey) => withMeta((api) => api.seqProbeSimAAA(colorKey), null),
    getTotalCardCount: (World) => withMeta((api) => api.getTotalCardCount(World), 0),
    recomputeTotalCards: (World) => withMeta((api) => api.recomputeTotalCards(World), 0),
    resetCardPool: (World) => withMeta((api) => api.resetCardPool(World), undefined),
    onCardCollected: (payload) => withMeta((api) => api.onCardCollected(payload), null),

    onRitualTrigger: (payload) => withMeta((api) => api.onRitualTrigger(payload), undefined),
    openResetCardHub: () => withMeta((api) => api.openResetCardHub(), undefined),
  };

  if (typeof window !== "undefined") {
    window.CardEngine = window.CardEngine || CardEngine;
    window.HC = window.HC || {};
    if (!window.HC.seqSim) window.HC.seqSim = CardEngine.seqSim || null;
    if (!window.HC.seqSimTests) window.HC.seqSimTests = CardEngine.seqSimTests || null;
    window.HC_SEQ_PROBE = window.HC_SEQ_PROBE || {};
    window.HC_SEQ_PROBE.simAAA = CardEngine.seqProbeSimAAA || null;
  }
})(typeof window !== "undefined" ? window : globalThis);
