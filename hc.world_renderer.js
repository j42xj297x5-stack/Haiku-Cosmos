// HC world renderer adapter facade (Stage 1)
(function () {
  window.HC = window.HC || {};

  const ALLOWED_MODES = { canvas2d: true, three: true };
  let mode = "canvas2d";
  let initialized = false;
  let fallbackUsed = false;
  let lastError = null;

  function resetDiagnostics() {
    fallbackUsed = false;
    lastError = null;
  }

  function setMode(nextMode) {
    mode = ALLOWED_MODES[nextMode] ? nextMode : "canvas2d";
    return mode;
  }

  function getMode() {
    return mode;
  }

  function callCanvasFallback(nowMs, dt) {
    const render = window.HC && window.HC.Render;
    if (!render || typeof render.frame !== "function") {
      throw new Error("HC.Render.frame is unavailable");
    }
    render.frame(nowMs, dt);
  }

  function init(options) {
    initialized = true;
    resetDiagnostics();
    const opts = options || {};
    const preferredMode = opts.mode || (window.HC && window.HC.RENDER_MODE);
    setMode(preferredMode || "canvas2d");
  }

  function resize() {
    // Stage 1: no-op, adapter contract only.
  }

  function render(renderSnapshot, nowMs, dt) {
    try {
      if (mode === "three") {
        fallbackUsed = true;
        lastError = "three mode requested but implementation is not available";
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[HC.WorldRenderer] Falling back to canvas2d: three mode is not implemented yet.", {
            mode,
            snapshotVersion: renderSnapshot && renderSnapshot.version,
          });
        }
        callCanvasFallback(nowMs, dt);
        return;
      }

      callCanvasFallback(nowMs, dt);
    } catch (err) {
      fallbackUsed = true;
      lastError = err && err.message ? err.message : String(err);
      callCanvasFallback(nowMs, dt);
    }
  }

  function destroy() {
    initialized = false;
    resetDiagnostics();
  }

  function getDiagnostics() {
    return {
      mode,
      fallbackUsed,
      lastError,
      initialized,
      hasThreeImplementation: false,
    };
  }

  window.HC.WorldRenderer = {
    init,
    resize,
    render,
    destroy,
    getDiagnostics,
    setMode,
    getMode,
  };
})();
