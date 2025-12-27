// HC utility helpers (safe defaults)
(function () {
  window.HC = window.HC || {};
  const Util = window.HC.Util || {};

  if (!Util.clamp) {
    Util.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  }
  if (!Util.lerp) {
    Util.lerp = (a, b, t) => a + (b - a) * t;
  }
  if (!Util.hypot) {
    Util.hypot = (x, y) => Math.hypot(x, y);
  }
  if (!Util.dist) {
    Util.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  }
  if (!Util.easeInOutCubic) {
    Util.easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  }
  if (!Util.hash32) {
    Util.hash32 = (str) => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };
  }
  if (!Util.makeRng) {
    Util.makeRng = (seed) => {
      let s = seed >>> 0;
      return function rand01() {
        s ^= s << 13; s >>>= 0;
        s ^= s >> 17; s >>>= 0;
        s ^= s << 5;  s >>>= 0;
        return (s >>> 0) / 4294967296;
      };
    };
  }

  window.HC.Util = Util;
})();
