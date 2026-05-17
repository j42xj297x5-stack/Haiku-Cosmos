// HC world renderer adapter facade (Stage 2 - minimal Three.js lifecycle)
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
  let threeModeActive = false;
  let threeDependencySource = "unknown";

  const threeState = {
    initialized: false,
    hasDependency: false,
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    lastError: null,
    renderCalls: 0,
    resizeCalls: 0,
  };

  function resetDiagnostics() {
    fallbackUsed = false;
    fallbackReason = null;
    lastError = null;
    renderCalls = 0;
    fallbackCalls = 0;
    threeWarned = false;
    threeModeActive = false;
    effectiveMode = "canvas2d";
    threeState.lastError = null;
    threeState.renderCalls = 0;
    threeState.resizeCalls = 0;
    threeDependencySource = "unknown";
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
    if (!threeState.initialized || !threeState.renderer || !threeState.camera || !threeState.canvas) return;
    const view = (window.HC && window.HC.getView && window.HC.getView()) || window.View;
    if (!view || !view.w || !view.h) return;

    const dpr = Math.max(1, Number(view.dpr) || 1);
    const cssW = Math.max(1, view.w / dpr);
    const cssH = Math.max(1, view.h / dpr);
    threeState.resizeCalls += 1;
    threeState.canvas.style.width = cssW + "px";
    threeState.canvas.style.height = cssH + "px";
    threeState.renderer.setPixelRatio(dpr);
    threeState.renderer.setSize(cssW, cssH, false);
    if (threeState.camera.isPerspectiveCamera) {
      threeState.camera.aspect = cssW / cssH;
      threeState.camera.updateProjectionMatrix();
    }
  }

  function ensureThreeCanvas() {
    let canvas = document.getElementById("hc-three-world-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "hc-three-world-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "0";
      canvas.style.display = "none";
      canvas.style.visibility = "hidden";
      const app = document.getElementById("app");
      if (app && app.parentNode) app.parentNode.insertBefore(canvas, app);
      else document.body.appendChild(canvas);
    }
    return canvas;
  }

  function detectThreeDependency() {
    const loadStatus = window.HC_THREE_LOAD_STATUS;
    const esmReady = window.HC_THREE_READY === true && window.HC_THREE;
    if (esmReady) {
      const dep = window.HC_THREE;
      if (dep && dep.WebGLRenderer && dep.Scene && dep.PerspectiveCamera) {
        threeState.hasDependency = true;
        threeDependencySource = "local_vendor_esm";
        threeState.lastError = null;
        return dep;
      }
    }

    if (loadStatus === "loading") {
      threeState.hasDependency = false;
      threeDependencySource = "local_vendor_esm_loading";
      return null;
    }

    if (loadStatus === "failed") {
      threeState.hasDependency = false;
      threeDependencySource = "local_vendor_esm_failed";
      threeState.lastError = window.HC_THREE_LOAD_ERROR || null;
      return null;
    }

    const dep = window.THREE;
    if (dep && dep.WebGLRenderer && dep.Scene && dep.PerspectiveCamera) {
      threeState.hasDependency = true;
      threeDependencySource = "window.THREE_legacy";
      threeState.lastError = null;
      return dep;
    }

    threeState.hasDependency = false;
    threeDependencySource = loadStatus ? "local_vendor_esm_" + loadStatus : "missing";
    return null;
  }

  function initThree() {
    if (threeState.initialized) return true;
    const THREE = detectThreeDependency();
    if (!THREE) return false;
    try {
      const canvas = ensureThreeCanvas();
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      camera.position.set(0, 0, 8);
      scene.background = new THREE.Color(0x05070a);
      canvas.style.display = "block";
      canvas.style.visibility = "visible";
      threeState.canvas = canvas;
      threeState.renderer = renderer;
      threeState.scene = scene;
      threeState.camera = camera;
      threeState.initialized = true;
      threeState.lastError = null;
      resize();
      return true;
    } catch (err) {
      threeState.lastError = err && err.message ? err.message : String(err);
      return false;
    }
  }

  function destroyThree() {
    if (threeState.renderer && typeof threeState.renderer.dispose === "function") {
      threeState.renderer.dispose();
    }
    if (threeState.canvas) {
      threeState.canvas.style.display = "none";
      threeState.canvas.style.visibility = "hidden";
    }
    threeState.renderer = null;
    threeState.scene = null;
    threeState.camera = null;
    threeState.initialized = false;
  }

  function render(renderSnapshot, nowMs, dt) {
    renderCalls += 1;
    const snapshotVersion = renderSnapshot && renderSnapshot.version ? renderSnapshot.version : "1";
    try {
      if (requestedMode === "three") {
        const initializedThree = initThree();
        if (!initializedThree) {
          effectiveMode = "canvas2d";
          fallbackUsed = true;
          fallbackReason = threeDependencySource === "local_vendor_esm_loading" ? "three_loading" : (threeDependencySource === "local_vendor_esm_failed" ? "three_load_failed" : "three_loading_or_missing");
          fallbackCalls += 1;
          lastError = threeState.lastError || window.HC_THREE_LOAD_ERROR || null;
          if (!threeWarned && typeof console !== "undefined" && console.warn) {
            console.warn("[HC.WorldRenderer] Falling back to canvas2d: Three dependency or adapter init is unavailable.", {
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
        threeModeActive = true;
        effectiveMode = "three";
        fallbackUsed = false;
        fallbackReason = null;
        lastError = null;
        threeState.renderCalls += 1;
        threeState.renderer.render(threeState.scene, threeState.camera);
        return;
      }

      if (threeModeActive) {
        destroyThree();
        threeModeActive = false;
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
    destroyThree();
    initialized = false;
    resetDiagnostics();
  }


  function getCanvasDiagnostics() {
    const canvas = document.getElementById("hc-three-world-canvas");
    if (!canvas) {
      return {
        present: false,
        visible: false,
        zIndex: "n/a",
        pointerEvents: "n/a",
      };
    }
    const styles = window.getComputedStyle ? window.getComputedStyle(canvas) : canvas.style;
    const visible = styles.display !== "none" && styles.visibility !== "hidden" && Number(styles.opacity || 1) > 0;
    return {
      present: true,
      visible,
      zIndex: styles.zIndex || canvas.style.zIndex || "auto",
      pointerEvents: styles.pointerEvents || canvas.style.pointerEvents || "auto",
    };
  }

  function getDiagnostics() {
    const canvasDiag = getCanvasDiagnostics();
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
      hasThreeImplementation: true,
      hasThreeDependency: !!threeState.hasDependency,
      threeDependencySource,
      threeModuleUrl: window.HC_THREE_MODULE_URL || null,
      threeLoadStatus: window.HC_THREE_LOAD_STATUS || "missing",
      threeLoadError: window.HC_THREE_LOAD_ERROR || null,
      threeInitialized: !!threeState.initialized,
      threeCanvasPresent: canvasDiag.present,
      threeCanvasVisible: canvasDiag.visible,
      threeCanvasZIndex: canvasDiag.zIndex,
      threeCanvasPointerEvents: canvasDiag.pointerEvents,
      threeLastError: threeState.lastError,
      threeRenderCalls: threeState.renderCalls,
      threeResizeCalls: threeState.resizeCalls,
      threeSceneReady: !!threeState.scene,
      threeCameraReady: !!threeState.camera,
      threeRendererReady: !!threeState.renderer,
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
