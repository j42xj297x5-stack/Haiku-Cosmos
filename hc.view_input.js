// HC view/input subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  const View = window.HC.View || { w: 0, h: 0, dpr: 1, worldScale: 1 };
  const Input = window.HC.Input || { pointerDown: false, x: 0, y: 0, wx: 0, wy: 0 };

  window.HC.View = View;
  window.HC.Input = Input;
  window.HC.getView = () => window.View || window.HC.View;
  window.HC.getInput = () => window.Input || window.HC.Input;

  function getMaxPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    const isMobile = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return Math.min(dpr, isMobile ? 1.5 : 2.0);
  }

  let initialized = false;

  window.HC.initViewInput = (opts = {}) => {
    if (initialized) return;
    initialized = true;

    const canvas = opts.canvas || window.canvas || document.getElementById("gameCanvas");
    const ctx = opts.ctx || window.ctx;
    const view = window.HC.getView();
    const input = window.HC.getInput();

    function resizeCanvas() {
      if (!canvas || !ctx) return;
      view.dpr = getMaxPixelRatio();
      const cssW = Math.max(1, window.innerWidth);
      const cssH = Math.max(1, window.innerHeight);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * view.dpr);
      canvas.height = Math.floor(cssH * view.dpr);
      view.w = canvas.width;
      view.h = canvas.height;
      view.worldScale = Math.min(view.w, view.h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (window.HC?.WorldRenderer?.resize) {
        window.HC.WorldRenderer.resize(view);
      }
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
        if (CE && typeof CE.handlePointerDown === "function" && CE.handlePointerDown(p.x, p.y, view.w, view.h)) {
          return;
        }

        input.pointerDown = true;
        canvas.setPointerCapture(e.pointerId);
      });

      canvas.addEventListener("pointermove", (e) => {
        const p = toCanvasCoords(e);
        input.x = p.x; input.y = p.y;
      });

      canvas.addEventListener("pointerup", (e) => {
        input.pointerDown = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
      });
    }

    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();

    window.getMaxPixelRatio = window.getMaxPixelRatio || getMaxPixelRatio;
    window.resizeCanvas = window.resizeCanvas || resizeCanvas;
    window.View = window.View || view;
    window.Input = window.Input || input;
  };
})();
