// Codex patch template — loaded AFTER game.monolith.codex.js
(function(){
  if (!window.HC || !window.HC.get) {
    console.warn("HC API not found. Did you load game.monolith.codex.js?");
    return;
  }
  const { World, state, config, CardEngine, nowMs } = window.HC.get();

  // Example: sanity log
  console.log("[CodexPatch] world?", !!World, "cardEngine?", !!CardEngine, "t=", nowMs());

  // TODO: add safe patches here (avoid redefining functions unless necessary)
})();
