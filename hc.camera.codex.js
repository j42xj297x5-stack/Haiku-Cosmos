// HC camera placeholder
(function () {
  window.HC = window.HC || {};
  window.HC.Camera = window.HC.Camera || {
    x: 0,
    y: 0,
    zoom: 1,
    epochZoom: { active: false, t: 0, dur: 2.0, fromZoom: 1, toZoom: 1, targetX: 0, targetY: 0 },
  };
  window.HC.getCamera = () => (window.cam || window.HC.Camera);
})();
