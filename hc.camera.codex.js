// HC camera subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  const Camera = window.HC.Camera || {
    scale: 1.0,
    target: 1.0,
    min: 0.35,
    max: 1.0,
    ease: 0.06,
    epochZoom: { active: false, t: 0, dur: 2.0, fromZoom: 1.0, toZoom: 1.0, targetX: 0, targetY: 0 },
  };

  window.HC.Camera = Camera;
  window.HC.getCamera = () => window.Camera || window.HC.Camera;

  function screenToWorld(x, y) {
    const view = (window.HC.getView && window.HC.getView()) || window.View || { w: 0, h: 0 };
    const cam = window.HC.getCamera();
    const cx = view.w / 2;
    const cy = view.h / 2;
    const s = cam.scale || 1;
    return { x: (x - cx) / s + cx, y: (y - cy) / s + cy };
  }

  function getWorldViewBounds() {
    const view = (window.HC.getView && window.HC.getView()) || window.View || { w: 0, h: 0 };
    const cam = window.HC.getCamera();
    const cx = view.w / 2;
    const cy = view.h / 2;
    const s = cam.scale || 1;
    const halfW = (view.w / 2) / s;
    const halfH = (view.h / 2) / s;
    return { l: cx - halfW, r: cx + halfW, t: cy - halfH, b: cy + halfH, cx, cy };
  }

  window.HC.screenToWorld = screenToWorld;
  window.HC.getWorldViewBounds = getWorldViewBounds;
  window.Camera = window.Camera || Camera;
  window.screenToWorld = window.screenToWorld || screenToWorld;
  window.getWorldViewBounds = window.getWorldViewBounds || getWorldViewBounds;
})();
