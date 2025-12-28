// HC camera subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  const Camera = window.HC.Camera || {
    zoom: 1.0,
    x: 0,
    y: 0,
    scale: 1.0,
    target: 1.0,
    min: 0.35,
    max: 1.0,
    ease: 0.06,
    epochZoom: { active: false, t: 0, dur: 2.0, fromZoom: 1.0, toZoom: 1.0, targetX: 0, targetY: 0 },
  };

  window.HC.Camera = Camera;
  window.HC.getCamera = () => window.Camera || window.HC.Camera;

  function update(dt, view) {
    const cam = window.HC.getCamera();
    const v = view || (window.HC.getView && window.HC.getView()) || window.View || { w: 0, h: 0 };
    if (!Number.isFinite(cam.zoom)) cam.zoom = cam.scale || 1;
    if (!Number.isFinite(cam.x)) cam.x = v.w * 0.5;
    if (!Number.isFinite(cam.y)) cam.y = v.h * 0.5;

    if (cam.epochZoom && cam.epochZoom.active) {
      if (!cam._epochZoomActive) {
        console.log("[CAM] epochZoom start", cam.zoom, "->", cam.epochZoom.toZoom);
        cam._epochZoomActive = true;
      }
      cam.epochZoom.t += dt;
      const u = Math.min(1, cam.epochZoom.t / Math.max(0.001, cam.epochZoom.dur));
      const e = (u < 0.5) ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      cam.zoom = cam.epochZoom.fromZoom + (cam.epochZoom.toZoom - cam.epochZoom.fromZoom) * e;
      if (u >= 1) cam.epochZoom.active = false;
    } else {
      const min = Number.isFinite(cam.min) ? cam.min : 0.35;
      const max = Number.isFinite(cam.max) ? cam.max : 1.0;
      const target = Number.isFinite(cam.target) ? cam.target : cam.zoom;
      cam.target = Math.max(min, Math.min(max, target));
      cam.zoom += (cam.target - cam.zoom) * (cam.ease || 0.06);
    }
    if ((!cam.epochZoom || !cam.epochZoom.active) && cam._epochZoomActive) {
      console.log("[CAM] epochZoom end", cam.zoom);
      cam._epochZoomActive = false;
    }

    cam.scale = cam.zoom;
  }

  function screenToWorld(x, y) {
    const view = (window.HC.getView && window.HC.getView()) || window.View || { w: 0, h: 0 };
    const cam = window.HC.getCamera();
    const sx = view.w * 0.5;
    const sy = view.h * 0.5;
    const zoom = cam.zoom || cam.scale || 1;
    const camX = Number.isFinite(cam.x) ? cam.x : sx;
    const camY = Number.isFinite(cam.y) ? cam.y : sy;
    return { x: (x - sx) / zoom + camX, y: (y - sy) / zoom + camY };
  }

  function getWorldViewBounds() {
    const view = (window.HC.getView && window.HC.getView()) || window.View || { w: 0, h: 0 };
    const cam = window.HC.getCamera();
    const sx = view.w * 0.5;
    const sy = view.h * 0.5;
    const zoom = cam.zoom || cam.scale || 1;
    const camX = Number.isFinite(cam.x) ? cam.x : sx;
    const camY = Number.isFinite(cam.y) ? cam.y : sy;
    const halfW = (view.w * 0.5) / zoom;
    const halfH = (view.h * 0.5) / zoom;
    return { l: camX - halfW, r: camX + halfW, t: camY - halfH, b: camY + halfH, cx: camX, cy: camY };
  }

  window.HC.Camera.update = window.HC.Camera.update || update;
  window.HC.screenToWorld = screenToWorld;
  window.HC.getWorldViewBounds = getWorldViewBounds;
  window.Camera = window.Camera || Camera;
  window.screenToWorld = window.screenToWorld || screenToWorld;
  window.getWorldViewBounds = window.getWorldViewBounds || getWorldViewBounds;
})();
