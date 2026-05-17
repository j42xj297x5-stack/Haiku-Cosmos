// HC world renderer adapter facade (Stage 1)
(function () {
  window.HC = window.HC || {};

  const ALLOWED_MODES = { canvas2d: true, three: true };
  let requestedMode = "canvas2d";
  let effectiveMode = "canvas2d";
  let initialized = false;
  let fallbackUsed = false;
  let fallbackReason = null;
  let lastError = null;
  let renderCalls = 0;
  let fallbackCalls = 0;
  let threeWarned = false;

  function resetDiagnostics() {
    fallbackUsed = false;
    fallbackReason = null;
    lastError = null;
    renderCalls = 0;
    fallbackCalls = 0;
    threeWarned = false;
    effectiveMode = "canvas2d";
  }

  function setMode(nextMode) {
    requestedMode = ALLOWED_MODES[nextMode] ? nextMode : "canvas2d";
    if (window.HC) window.HC.RENDER_MODE = requestedMode;
    return requestedMode;
  }

  function getMode() {
    return requestedMode;
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
    renderCalls += 1;
    const snapshotVersion = renderSnapshot && renderSnapshot.version ? renderSnapshot.version : "1";
    try {
      if (requestedMode === "three") {
        effectiveMode = "canvas2d";
        fallbackUsed = true;
        fallbackReason = "three_not_implemented";
        lastError = null;
        fallbackCalls += 1;
        if (!threeWarned && typeof console !== "undefined" && console.warn) {
          console.warn("[HC.WorldRenderer] Falling back to canvas2d: three mode is not implemented yet.", {
            requestedMode,
            effectiveMode,
            fallbackReason,
            snapshotVersion,
          });
          threeWarned = true;
        }
        callCanvasFallback(nowMs, dt);
        return;
      }

      effectiveMode = "canvas2d";
      fallbackUsed = false;
      fallbackReason = null;
      lastError = null;
      callCanvasFallback(nowMs, dt);
    } catch (err) {
      fallbackUsed = true;
      fallbackReason = "adapter_error";
      fallbackCalls += 1;
      lastError = err && err.message ? err.message : String(err);
      effectiveMode = "canvas2d";
      callCanvasFallback(nowMs, dt);
    }
  }

  function destroy() {
    initialized = false;
    resetDiagnostics();
  }

  function getDiagnostics() {
    return {
      requestedMode,
      effectiveMode,
      mode: effectiveMode,
      fallbackUsed,
      fallbackReason,
      lastError,
      initialized,
      renderCalls,
      fallbackCalls,
      snapshotVersion: "1",
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
