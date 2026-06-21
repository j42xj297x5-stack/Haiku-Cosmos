// HC view/input subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  const View = window.HC.View || { w: 0, h: 0, cssW: 0, cssH: 0, dpr: 1, worldScale: 1 };
  const Input = window.HC.Input || { pointerDown: false, x: 0, y: 0, wx: 0, wy: 0 };

  window.HC.View = View;
  window.HC.Input = Input;
  window.HC.getView = () => window.View || window.HC.View;
  window.HC.getInput = () => window.Input || window.HC.Input;

  const DEFAULT_SPAWN_OUTSIDE_MARGIN_PCT = 0.025;

  function finitePositive(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function getMaxPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    const isMobile = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return Math.min(dpr, isMobile ? 1.5 : 2.0);
  }

  function currentWorldBounds() {
    if (typeof window.getWorldViewBounds === "function") return window.getWorldViewBounds();
    const view = window.HC.getView();
    const cam = (window.HC.getCamera && window.HC.getCamera()) || window.Camera || {};
    const zoom = finitePositive(cam.zoom || cam.scale, 1);
    const sx = finitePositive(view.w, 1) * 0.5;
    const sy = finitePositive(view.h, 1) * 0.5;
    const cx = Number.isFinite(Number(cam.x)) ? Number(cam.x) : sx;
    const cy = Number.isFinite(Number(cam.y)) ? Number(cam.y) : sy;
    const halfW = sx / zoom;
    const halfH = sy / zoom;
    return { l: cx - halfW, r: cx + halfW, t: cy - halfH, b: cy + halfH, cx, cy, width: halfW * 2, height: halfH * 2 };
  }

  function getSpawnOutsideMarginPct() {
    const world = (window.HC.getWorld && window.HC.getWorld()) || window.World || {};
    return finitePositive(world.spawnOutsideMarginPct ?? world.spaceMechanics?.spawnOutsideMarginPct, DEFAULT_SPAWN_OUTSIDE_MARGIN_PCT);
  }

  function getWorldSpawnBounds(options = {}) {
    const visible = options.visibleBounds || currentWorldBounds();
    const pct = finitePositive(options.marginPct, getSpawnOutsideMarginPct());
    const width = finitePositive(visible.width, Math.max(1, Number(visible.r) - Number(visible.l)));
    const height = finitePositive(visible.height, Math.max(1, Number(visible.b) - Number(visible.t)));
    const marginX = width * pct;
    const marginY = height * pct;
    return {
      l: visible.l - marginX,
      r: visible.r + marginX,
      t: visible.t - marginY,
      b: visible.b + marginY,
      cx: visible.cx,
      cy: visible.cy,
      width: width + marginX * 2,
      height: height + marginY * 2,
      marginX,
      marginY,
      marginPct: pct,
      visible,
    };
  }

  function getViewportDiagnostics() {
    const view = window.HC.getView();
    const canvas = document.getElementById("gameCanvas");
    const rect = canvas?.getBoundingClientRect?.();
    const visibleBounds = currentWorldBounds();
    const spawnBounds = getWorldSpawnBounds({ visibleBounds });
    const three = window.HC?.WorldRenderer?.getDiagnostics?.() || {};
    return {
      renderer: window.HC?.RENDER_MODE || "canvas2d",
      css: { width: view.cssW || rect?.width || 0, height: view.cssH || rect?.height || 0 },
      dpr: view.dpr || 1,
      backing: { width: view.w || canvas?.width || 0, height: view.h || canvas?.height || 0 },
      canvasRect: rect ? { width: rect.width, height: rect.height, left: rect.left, top: rect.top } : null,
      three: {
        width: three.threeRendererWidth || three.rendererWidth || null,
        height: three.threeRendererHeight || three.rendererHeight || null,
        cameraAspect: three.threeCameraAspect || null,
        cameraBounds: three.threeCameraBounds || three.cameraBounds || null,
      },
      worldVisibleBounds: visibleBounds,
      spawnBounds,
      prg: window.HC?.WorldRenderSnapshot?.build ? window.HC.WorldRenderSnapshot.build({ World: window.World, Camera: window.Camera, View: view }).world?.prgIndicator || null : null,
    };
  }

  window.HC.Viewport = Object.assign(window.HC.Viewport || {}, {
    DEFAULT_SPAWN_OUTSIDE_MARGIN_PCT,
    getWorldVisibleBounds: currentWorldBounds,
    getWorldSpawnBounds,
    getDiagnostics: getViewportDiagnostics,
  });
  window.HC.getWorldSpawnBounds = getWorldSpawnBounds;
  window.getWorldSpawnBounds = window.getWorldSpawnBounds || getWorldSpawnBounds;

  let initialized = false;

  window.HC.initViewInput = (opts = {}) => {
    if (initialized) return;
    initialized = true;

    const canvas = opts.canvas || window.canvas || document.getElementById("gameCanvas");
    const ctx = opts.ctx || window.ctx;
    const view = window.HC.getView();
    const input = window.HC.getInput();
    let resizeRaf = 0;

    function applyResize() {
      resizeRaf = 0;
      if (!canvas || !ctx) return;
      view.dpr = getMaxPixelRatio();
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, rect?.width || window.innerWidth || canvas.clientWidth || 1);
      const cssH = Math.max(1, rect?.height || window.innerHeight || canvas.clientHeight || 1);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * view.dpr);
      canvas.height = Math.floor(cssH * view.dpr);
      view.cssW = cssW;
      view.cssH = cssH;
      view.w = canvas.width;
      view.h = canvas.height;
      view.worldScale = Math.min(view.w, view.h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (window.HC?.WorldRenderer?.resize) window.HC.WorldRenderer.resize(view);
      window.HC.lastViewportDiagnostics = getViewportDiagnostics();
    }

    function resizeCanvas() {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame ? window.requestAnimationFrame(applyResize) : setTimeout(applyResize, 0);
    }

    function toCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * view.dpr,
        y: (e.clientY - rect.top) * view.dpr,
      };
    }

    if (canvas) {
      canvas.addEventListener("pointerdown", (e) => {
        const p = toCanvasCoords(e);
        input.x = p.x; input.y = p.y;
        const CE = window.CardEngine;
        if (CE && typeof CE.handlePointerDown === "function" && CE.handlePointerDown(p.x, p.y, view.w, view.h)) return;
        input.pointerDown = true;
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener("pointermove", (e) => { const p = toCanvasCoords(e); input.x = p.x; input.y = p.y; });
      canvas.addEventListener("pointerup", (e) => { input.pointerDown = false; try { canvas.releasePointerCapture(e.pointerId); } catch {} });
    }

    window.addEventListener("resize", resizeCanvas, { passive: true });
    if (window.ResizeObserver && canvas) {
      const observer = new ResizeObserver(resizeCanvas);
      observer.observe(canvas);
      window.HC.__viewportResizeObserver = observer;
    }
    applyResize();

    window.getMaxPixelRatio = window.getMaxPixelRatio || getMaxPixelRatio;
    window.resizeCanvas = window.resizeCanvas || resizeCanvas;
    window.View = window.View || view;
    window.Input = window.Input || input;
  };
})();
