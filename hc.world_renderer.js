// HC world renderer adapter facade (Stage 3 - minimal Three.js meteor pass)
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
    meteorGroup: null,
    meteorGeometry: null,
    meteorMaterials: new Map(),
    meteorMeshes: new Map(),
    threeMeteorRenderEnabled: true,
    threeMeteorCount: 0,
    threeMeteorLastError: null,
    threeObjectRenderPasses: ["meteors"],
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
    threeState.threeMeteorCount = 0;
    threeState.threeMeteorLastError = null;
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
    if (!render || typeof render.frame !== "function") throw new Error("HC.Render.frame is unavailable");
    render.frame(nowMs, dt);
  }

  function init(options) {
    initialized = true;
    resetDiagnostics();
    const opts = options || {};
    setMode(opts.mode || (window.HC && window.HC.RENDER_MODE) || "canvas2d");
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
    const bridgeVersion = window.HC_THREE_BRIDGE_VERSION;
    const loadStatus = window.HC_THREE_LOAD_STATUS;
    const esmReady = window.HC_THREE_READY === true && window.HC_THREE;
    if (esmReady) {
      const dep = window.HC_THREE;
      if (dep && dep.WebGLRenderer && dep.Scene && dep.OrthographicCamera) {
        threeState.hasDependency = true;
        threeDependencySource = "local_vendor_esm";
        threeState.lastError = null;
        return dep;
      }
    }
    if (!bridgeVersion) { threeState.hasDependency = false; threeDependencySource = "bridge_missing"; return null; }
    if (loadStatus === "loading") { threeState.hasDependency = false; threeDependencySource = "local_vendor_esm_loading"; return null; }
    if (loadStatus === "failed") {
      threeState.hasDependency = false;
      threeDependencySource = "local_vendor_esm_failed";
      threeState.lastError = window.HC_THREE_LOAD_ERROR || null;
      return null;
    }
    const dep = window.THREE;
    if (dep && dep.WebGLRenderer && dep.Scene && dep.OrthographicCamera) {
      threeState.hasDependency = true;
      threeDependencySource = "window.THREE_legacy";
      threeState.lastError = null;
      return dep;
    }
    threeState.hasDependency = false;
    threeDependencySource = loadStatus ? "local_vendor_esm_" + loadStatus : "local_vendor_esm_unknown";
    return null;
  }

  function applyThreeCameraSnapshot(renderSnapshot) {
    const cam = renderSnapshot?.camera || {};
    const viewport = cam.viewport || {};
    const width = Math.max(1, Number(viewport.width) || 1);
    const height = Math.max(1, Number(viewport.height) || 1);
    const bounds = cam.worldBounds || null;
    let left = 0; let right = width; let top = 0; let bottom = height;
    if (bounds && Number.isFinite(bounds.l) && Number.isFinite(bounds.r) && Number.isFinite(bounds.t) && Number.isFinite(bounds.b)) {
      left = bounds.l; right = bounds.r; top = bounds.t; bottom = bounds.b;
    }
    threeState.camera.left = left;
    threeState.camera.right = right;
    threeState.camera.top = top;
    threeState.camera.bottom = bottom;
    threeState.camera.position.set(0, 0, 10);
    threeState.camera.updateProjectionMatrix();
  }

  function resize(renderSnapshot) {
    if (!threeState.initialized || !threeState.renderer || !threeState.camera || !threeState.canvas) return;
    const view = renderSnapshot?.camera?.viewport || (window.HC?.getView?.() || window.View);
    if (!view || !view.width && !view.w) return;
    const w = Number(view.width || view.w) || 1;
    const h = Number(view.height || view.h) || 1;
    const dpr = Math.max(1, Number((window.HC?.getView?.() || window.View || {}).dpr) || 1);
    const cssW = Math.max(1, w / dpr);
    const cssH = Math.max(1, h / dpr);
    threeState.resizeCalls += 1;
    threeState.canvas.style.width = cssW + "px";
    threeState.canvas.style.height = cssH + "px";
    threeState.renderer.setPixelRatio(dpr);
    threeState.renderer.setSize(cssW, cssH, false);
    applyThreeCameraSnapshot(renderSnapshot || {});
  }

  function getMeteorMaterial(THREE, colorKey) {
    const key = colorKey || "neutral";
    const existing = threeState.meteorMaterials.get(key);
    if (existing) return existing;
    const colorMap = { red: 0xff6b6b, yellow: 0xffd166, green: 0x6ee7a8, blue: 0x7dbdff, neutral: 0xb6bfd2 };
    const mat = new THREE.MeshBasicMaterial({ color: colorMap[key] || colorMap.neutral, transparent: true, opacity: 1.0 });
    threeState.meteorMaterials.set(key, mat);
    return mat;
  }

  function initThree() {
    if (threeState.initialized) return true;
    const THREE = detectThreeDependency() || window.HC_THREE || window.THREE;
    if (!THREE || !THREE.WebGLRenderer || !THREE.Scene || !THREE.OrthographicCamera) return false;
    try {
      const canvas = ensureThreeCanvas();
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 1000);
      const meteorGroup = new THREE.Group();
      scene.add(meteorGroup);
      scene.background = new THREE.Color(0x05070a);
      canvas.style.display = "block";
      canvas.style.visibility = "visible";
      Object.assign(threeState, { canvas, renderer, scene, camera, meteorGroup, meteorGeometry: new THREE.CircleGeometry(1, 16) });
      threeState.initialized = true;
      threeState.lastError = null;
      resize();
      return true;
    } catch (err) { threeState.lastError = err?.message || String(err); return false; }
  }

  function syncMeteorPass(renderSnapshot) {
    const THREE = window.HC_THREE || window.THREE;
    const meteors = Array.isArray(renderSnapshot?.world?.meteors) ? renderSnapshot.world.meteors : [];
    threeState.threeMeteorCount = meteors.length;
    const seen = new Set();
    for (let i = 0; i < meteors.length; i += 1) {
      const m = meteors[i] || {};
      const key = String(m.renderKey || m.id || `meteor:${i}:${Math.round(m.x||0)}:${Math.round(m.y||0)}`);
      seen.add(key);
      let mesh = threeState.meteorMeshes.get(key);
      const colorKey = String(m.colorKey || m.colorName || m.color || "neutral").toLowerCase();
      if (!mesh) {
        mesh = new THREE.Mesh(threeState.meteorGeometry, getMeteorMaterial(THREE, colorKey));
        mesh.frustumCulled = false;
        threeState.meteorGroup.add(mesh);
        threeState.meteorMeshes.set(key, mesh);
      } else {
        mesh.material = getMeteorMaterial(THREE, colorKey);
      }
      const radius = Number(m.radius ?? m.r ?? m.size) || 2;
      mesh.position.set(Number(m.x) || 0, Number(m.y) || 0, 0);
      mesh.scale.set(radius, radius, 1);
      mesh.material.opacity = Number.isFinite(m.alpha) ? m.alpha : 1;
      mesh.visible = !m.flags?.dead;
    }
    for (const [key, mesh] of threeState.meteorMeshes.entries()) {
      if (seen.has(key)) continue;
      threeState.meteorGroup.remove(mesh);
      if (mesh?.geometry && mesh.geometry !== threeState.meteorGeometry) mesh.geometry.dispose?.();
      threeState.meteorMeshes.delete(key);
    }
  }

  function destroyThree() {
    if (threeState.renderer?.dispose) threeState.renderer.dispose();
    threeState.meteorMeshes.forEach((mesh) => { threeState.meteorGroup?.remove(mesh); });
    threeState.meteorMeshes.clear();
    threeState.meteorMaterials.forEach((mat) => mat?.dispose?.());
    threeState.meteorMaterials.clear();
    threeState.meteorGeometry?.dispose?.();
    if (threeState.canvas) { threeState.canvas.style.display = "none"; threeState.canvas.style.visibility = "hidden"; }
    Object.assign(threeState, { renderer: null, scene: null, camera: null, meteorGroup: null, meteorGeometry: null, initialized: false });
  }

  function render(renderSnapshot, nowMs, dt) {
    renderCalls += 1;
    try {
      if (requestedMode === "three") {
        if (!initThree()) {
          effectiveMode = "canvas2d"; fallbackUsed = true; fallbackReason = threeDependencySource.includes("loading") ? "three_loading" : "three_loading_or_missing"; fallbackCalls += 1;
          lastError = threeState.lastError || window.HC_THREE_LOAD_ERROR || null; callCanvasFallback(nowMs, dt); return;
        }
        threeModeActive = true; effectiveMode = "three"; fallbackUsed = false; fallbackReason = null; lastError = null;
        resize(renderSnapshot);
        try {
          if (threeState.threeMeteorRenderEnabled) syncMeteorPass(renderSnapshot || {});
          threeState.threeMeteorLastError = null;
        } catch (err) {
          threeState.threeMeteorLastError = err?.message || String(err);
          threeState.threeMeteorCount = 0;
        }
        threeState.renderCalls += 1;
        threeState.renderer.render(threeState.scene, threeState.camera);
        return;
      }
      if (threeModeActive) { destroyThree(); threeModeActive = false; }
      effectiveMode = "canvas2d"; fallbackUsed = false; fallbackReason = null; lastError = null;
      callCanvasFallback(nowMs, dt);
    } catch (err) {
      fallbackUsed = true; fallbackReason = "adapter_error"; fallbackCalls += 1; lastError = err?.message || String(err); effectiveMode = "canvas2d"; callCanvasFallback(nowMs, dt);
    }
  }

  function getCanvasDiagnostics() {
    const canvas = document.getElementById("hc-three-world-canvas");
    if (!canvas) return { present: false, visible: false, zIndex: "n/a", pointerEvents: "n/a" };
    const styles = window.getComputedStyle ? window.getComputedStyle(canvas) : canvas.style;
    const visible = styles.display !== "none" && styles.visibility !== "hidden" && Number(styles.opacity || 1) > 0;
    return { present: true, visible, zIndex: styles.zIndex || canvas.style.zIndex || "auto", pointerEvents: styles.pointerEvents || canvas.style.pointerEvents || "auto" };
  }

  function getDiagnostics() {
    const canvasDiag = getCanvasDiagnostics();
    return {
      requestedMode, effectiveMode, mode: effectiveMode, fallbackUsed, fallbackReason, lastError, initialized, renderCalls, fallbackCalls, snapshotVersion: "1",
      hasThreeImplementation: true, hasThreeDependency: !!threeState.hasDependency, threeDependencySource, threeBridgeVersion: window.HC_THREE_BRIDGE_VERSION || null,
      threeReady: window.HC_THREE_READY === true, threeSource: window.HC_THREE_SOURCE || null, threeModuleUrl: window.HC_THREE_MODULE_URL || null,
      threeVendorUrls: Array.isArray(window.HC_THREE_VENDOR_URLS) ? window.HC_THREE_VENDOR_URLS.slice() : [], threeLoadStatus: window.HC_THREE_LOAD_STATUS || "missing",
      threeLoadError: window.HC_THREE_LOAD_ERROR || null, threeInitialized: !!threeState.initialized, threeCanvasPresent: canvasDiag.present,
      threeCanvasVisible: canvasDiag.visible, threeCanvasZIndex: canvasDiag.zIndex, threeCanvasPointerEvents: canvasDiag.pointerEvents, threeLastError: threeState.lastError,
      threeRenderCalls: threeState.renderCalls, threeResizeCalls: threeState.resizeCalls, threeSceneReady: !!threeState.scene, threeCameraReady: !!threeState.camera, threeRendererReady: !!threeState.renderer,
      threeMeteorRenderEnabled: !!threeState.threeMeteorRenderEnabled, threeMeteorCount: threeState.threeMeteorCount, threeMeteorMeshes: threeState.meteorMeshes.size,
      threeMeteorLastError: threeState.threeMeteorLastError, threeObjectRenderPasses: threeState.threeObjectRenderPasses.slice(),
    };
  }

  function destroy() { destroyThree(); initialized = false; resetDiagnostics(); }

  window.HC.WorldRenderer = { init, resize, render, destroy, getDiagnostics, setMode, getMode };
})();
