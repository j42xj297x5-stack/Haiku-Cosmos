// HC view/input placeholder
(function () {
  window.HC = window.HC || {};
  window.HC.View = window.HC.View || {
    canvas: null,
    ctx: null,
    screenW: 0,
    screenH: 0,
    dpr: 1,
  };
  window.HC.getView = () => window.HC.View;
})();
