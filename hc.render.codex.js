// HC render subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  window.HC.initRender = () => {
    const world = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    const view = (window.HC.getView && window.HC.getView()) || window.View;
    const cam = (window.HC.getCamera && window.HC.getCamera()) || window.Camera;
    const ctx = window.ctx;
    const Input = window.Input;
    const CardEngine = window.CardEngine;
    const clamp = (window.HC.Util && window.HC.Util.clamp) || window.clamp;
    const rand = window.rand;
    const meteorBaseRadius = window.meteorBaseRadius;
    const hueFromName = window.hueFromName;
    const makeRng = (window.HC.Util && window.HC.Util.makeRng) || window.makeRng;
    const hash32 = (window.HC.Util && window.HC.Util.hash32) || window.hash32;

    function hashFloat(str) {
      return (hash32(str) >>> 0) / 4294967296;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function easeInOutCubic(t) {
      return (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    }

    function easeOutQuad(t) {
      return 1 - (1 - t) * (1 - t);
    }

    function makePlanetGradient(cx, cy, r, hueA, hueB) {
      const gx = cx - r * 0.35;
      const gy = cy - r * 0.35;
      const grad = ctx.createRadialGradient(gx, gy, r * 0.15, cx, cy, r);
      grad.addColorStop(0, `hsl(${hueA} 85% 62%)`);
      grad.addColorStop(1, `hsl(${hueB} 85% 45%)`);
      return grad;
    }

    // ---------- Rendering helpers ----------
    function drawBackground() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, view.w, view.h);

      const count = Math.floor(view.worldScale * 0.04);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < count; i++) {
        const x = (Math.random() * view.w) | 0;
        const y = (Math.random() * view.h) | 0;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    function drawRegularPolygon(x, y, r, sides, angleRad) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const t = angleRad + (i * Math.PI * 2) / sides;
        const px = x + Math.cos(t) * r;
        const py = y + Math.sin(t) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    function drawAsteroidOrbiters(a) {
      for (const o of a.orbiters) {
        const ox = a.x + Math.cos(o.angle) * o.orbitR;
        const oy = a.y + Math.sin(o.angle) * o.orbitR;

        ctx.beginPath();
        ctx.fillStyle = `hsl(${o.hue} 90% 70%)`;
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(ox - o.r * 0.25, oy - o.r * 0.25, o.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function drawAsteroid(a) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.orbitPx, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 215, 0, 0.65)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      drawAsteroidOrbiters(a);

      ctx.save();
      drawRegularPolygon(a.x, a.y, a.r, a.sides, a.angle);
      ctx.fillStyle = `hsl(0 0% ${a.grayLight}%)`;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.globalAlpha = 0.35;
      drawRegularPolygon(a.x - a.r * 0.12, a.y - a.r * 0.12, a.r * 0.55, a.sides, a.angle);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    
    // Visual rings created by comet impacts on planet orbiters
    function drawPlanetRings(p, nowMs) {
      if (!p.rings || !p.rings.length) return;

      for (const rg of p.rings) {
        const bandWidth = (typeof rg.bandWidth === "number" && isFinite(rg.bandWidth))
          ? rg.bandWidth
          : ((typeof rg.w === "number" && isFinite(rg.w)) ? rg.w : meteorBaseRadius());
        const bands = clamp(Math.round(bandWidth / 2), 2, 16);
        const lineW = Math.max(0.8, bandWidth / (bands * 1.35));
        const palette = (rg.palette && rg.palette.length) ? rg.palette : (rg.colors || []);
        const baseHue = (typeof rg.hue === "number") ? rg.hue : hueFromName(rg.colorName || "blue");
        const seed = (typeof rg.seed === "number") ? rg.seed : 0.0;

        const ringAlpha = (typeof rg.alpha === "number" && isFinite(rg.alpha)) ? rg.alpha : 0.5;
        ctx.save();
        ctx.globalAlpha = ringAlpha;
        for (let i = 0; i < bands; i++) {
          const t = (bands === 1) ? 0.5 : (i / (bands - 1));
          const r = rg.r - bandWidth * 0.5 + t * bandWidth;
          const jitter = Math.sin((seed + i * 13.1) * 3.7) * 0.5 + 0.5;
          const dash = Math.max(3, (rg.dashBase || 6) + jitter * 3);
          const gap = Math.max(3, (rg.gapBase || 10) + (1 - jitter) * 4);
          const paletteColor = palette.length ? palette[i % palette.length] : null;
          const hue = paletteColor
            ? ((typeof paletteColor.hue === "number") ? paletteColor.hue : hueFromName(paletteColor.colorName || "blue"))
            : baseHue;
          ctx.setLineDash([dash, gap]);
          ctx.lineWidth = lineW;
          ctx.strokeStyle = `hsla(${hue} 85% 60% / 0.6)`;
          ctx.lineDashOffset = (rg.dashOffset || 0) + jitter * 6 + i * 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        ctx.setLineDash([]);
      }
    }

    function drawRockyPatchwork(p, rockySurface, alpha) {
      const blobs = Array.isArray(rockySurface.blobs) ? rockySurface.blobs : [];
      if (!blobs.length) return;

      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.clip();

      const TAU = Math.PI * 2;
      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const steps = 12;
        const blobR = p.r * blob.rN;
        const cx = p.x + blob.xN * p.r * 0.95;
        const cy = p.y + blob.yN * p.r * 0.95;
        ctx.beginPath();
        for (let k = 0; k <= steps; k++) {
          const ang = (k / steps) * TAU;
          const jitter = (hashFloat(`${blob.seed}:${k}`) - 0.5) * blob.jag;
          const rr = blobR * (1 + jitter);
          const px = cx + Math.cos(ang) * rr;
          const py = cy + Math.sin(ang) * rr;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `hsl(${blob.hue} 85% 52%)`;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawRockyRimAndCracks(p, rocky, alpha) {
      const avgHue = (typeof rocky.avgHue === "number") ? rocky.avgHue : hueFromName(rocky.monoColor || "yellow");
      const seed = p._id || p.id || 1;
      const rimAngle = hashFloat(`rim:${seed}`) * Math.PI * 2;

      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${avgHue} 85% 72% / ${world.ROCKY_RIM_ALPHA})`;
      ctx.lineWidth = Math.max(1, p.r * 0.05);
      ctx.arc(p.x, p.y, p.r * 0.98, rimAngle - 0.7, rimAngle + 0.7);
      ctx.stroke();

      const crackRng = makeRng(hash32(`cracks:${seed}`));
      ctx.lineWidth = Math.max(0.6, p.r * 0.02);
      ctx.strokeStyle = `hsla(0 0% 100% / ${world.ROCKY_CRACK_ALPHA})`;
      for (let i = 0; i < world.ROCKY_CRACK_COUNT; i++) {
        const ang = crackRng() * Math.PI * 2;
        const r0 = p.r * (0.15 + 0.7 * crackRng());
        const len = p.r * (0.05 + 0.12 * crackRng());
        const sx = p.x + Math.cos(ang) * r0;
        const sy = p.y + Math.sin(ang) * r0;
        const ex = p.x + Math.cos(ang) * (r0 + len);
        const ey = p.y + Math.sin(ang) * (r0 + len);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawRockyPlanet(p, nowMs) {
      const rocky = p.rocky || {};
      const rockySurface = p.rockySurface || {};
      const avgHue = (typeof rocky.avgHue === "number") ? rocky.avgHue : hueFromName(rocky.monoColor || "yellow");
      const form = p.rockyForm;

      if (form && form.active) {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${avgHue} 35% 30%)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        let ringAlpha = world.ROCKY_RING_OPACITY;
        let blendAlpha = 0;
        let shrinkT = 1;
        if (form.phase === "shrink") {
          const u = clamp(form.t / Math.max(0.001, form.shrinkDur), 0, 1);
          shrinkT = easeInOutCubic(u);
        } else if (form.phase === "fade") {
          const v = clamp(form.t / Math.max(0.001, form.fadeDur), 0, 1);
          ringAlpha = lerp(world.ROCKY_RING_OPACITY, 0, easeOutQuad(v));
          blendAlpha = v;
        }

        for (const ring of form.rings || []) {
          const rNow = lerp(ring.startR, ring.endR, shrinkT);
          drawPlanetRings({
            x: p.x,
            y: p.y,
            rings: [{
              r: rNow,
              bandWidth: ring.thickness,
              hue: ring.hue,
              colorName: ring.colorName,
              palette: [{ hue: ring.hue, colorName: ring.colorName }],
              dashBase: 6,
              gapBase: 10,
              dashOffset: ring.dashOffset,
              seed: ring.seed,
              alpha: ringAlpha,
            }],
          }, nowMs);
        }

        if (blendAlpha > 0) {
          if (p.spinLikeAsteroid) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.spinAngle || 0);
            ctx.translate(-p.x, -p.y);
          }
          drawRockyPatchwork(p, rockySurface, blendAlpha);
          if (p.spinLikeAsteroid) ctx.restore();
        }
        return;
      }

      if (p.spinLikeAsteroid) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spinAngle || 0);
        ctx.translate(-p.x, -p.y);
      }

      const baseColor = rockySurface.isMono ? rockySurface.monoColor : rockySurface.dominantColor;
      const baseHue = hueFromName(baseColor || "yellow");
      ctx.beginPath();
      ctx.fillStyle = `hsl(${baseHue} 85% 55%)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (!rockySurface.isMono) {
        drawRockyPatchwork(p, rockySurface, 1);
      }
      drawRockyRimAndCracks(p, rocky, 1);

      if (p.spinLikeAsteroid) ctx.restore();
    }

    function drawStar(s, nowMs) {
      const colorName = s.gradientOuterColor || "yellow";
      const hue = hueFromName(colorName);
      let flicker = 1;
      if (s.starKind === "rare" && s.shimmer && s.shimmer.active) {
        const phase = (s.shimmer.seed || 1) * 0.4;
        flicker = 0.85 + 0.15 * Math.sin((nowMs * 0.004) + phase);
      }

      let whiteMix = 0;
      if (s.birth && s.birth.active) {
        const u = clamp(s.birth.t / Math.max(0.001, s.birth.duration), 0, 1);
        const freq = lerp(2, 13, u * u);
        const pulse = 0.5 + 0.5 * Math.sin(Math.PI * 2 * freq * s.birth.timeAbs);
        whiteMix = 0.7 * pulse;
      }

      ctx.save();
      ctx.beginPath();
      const light = 56 + (flicker * 8) + (whiteMix * 35);
      ctx.fillStyle = `hsl(${hue} 90% ${light}%)`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.35 * flicker;
      ctx.beginPath();
      ctx.fillStyle = `hsl(${hue} 90% 70%)`;
      ctx.arc(s.x, s.y, s.r * 1.08, 0, Math.PI * 2);
      ctx.fill();

      if (s.birth && s.birth.active && s.birth.absorb && s.birth.absorb.length) {
        for (const ab of s.birth.absorb) {
          const x = s.x + Math.cos(ab.theta) * ab.r;
          const y = s.y + Math.sin(ab.theta) * ab.r;
          ctx.globalAlpha = Math.max(0, ab.alpha || 1) * 0.9;
          ctx.beginPath();
          ctx.fillStyle = `hsla(${ab.hue} 85% 60% / 0.8)`;
          ctx.arc(x, y, Math.max(1, (ab.ref?.r || 3) * 0.45), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawPlanetSoftEdgeAndGrain(p, baseHue) {
      const TAU = Math.PI * 2;
      const scale = cam.zoom || cam.scale || 1;
      const softWidth = world.PLANET_SOFT_EDGE_WIDTH / scale;
      const grainMin = world.PLANET_EDGE_GRAIN_SIZE_MIN / scale;
      const grainMax = world.PLANET_EDGE_GRAIN_SIZE_MAX / scale;

      ctx.save();
      ctx.globalAlpha *= world.PLANET_SOFT_EDGE_ALPHA;
      ctx.lineWidth = softWidth;
      ctx.strokeStyle = `hsl(${baseHue} 85% 60%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.r - softWidth * 0.25), 0, TAU);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha *= world.PLANET_SOFT_INNER_ALPHA;
      ctx.fillStyle = `hsl(${baseHue} 85% 62%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.85, 0, TAU);
      ctx.fill();
      ctx.restore();

      const seed = p._id || p.id || 1;
      const rnd = makeRng(hash32(`grain:${seed}`));
      ctx.save();
      ctx.globalAlpha *= world.PLANET_EDGE_GRAIN_ALPHA;
      ctx.fillStyle = `hsl(${baseHue} 85% 60%)`;
      for (let i = 0; i < world.PLANET_EDGE_GRAIN_COUNT; i++) {
        const a = (i / world.PLANET_EDGE_GRAIN_COUNT) * TAU + (rnd() * 2 - 1) * world.PLANET_EDGE_GRAIN_JITTER;
        const rr = p.r * (1 + (rnd() * 2 - 1) * world.PLANET_EDGE_GRAIN_R_JITTER);
        const px = p.x + Math.cos(a) * rr;
        const py = p.y + Math.sin(a) * rr;
        const sz = grainMin + (grainMax - grainMin) * rnd();
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    function drawPlanet(p) {
      const nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.orbitPx, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 215, 0, 0.55)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 10]);
      ctx.stroke();
      ctx.restore();

      drawPlanetRings(p, nowMs);
    ctx.beginPath();
      drawPlanetOrbiters(p);

      ctx.beginPath();
      if (p.isRocky) {
        drawRockyPlanet(p, nowMs);
      } else {
        ctx.fillStyle = makePlanetGradient(p.x, p.y, p.r, p.hueA, p.hueB);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const rockyFormActive = p.isRocky && p.rockyForm && p.rockyForm.active;
      if (!rockyFormActive) {
        let baseHue = p.hueA;
        if (p.isRocky) {
          const rockySurface = p.rockySurface || {};
          const baseColor = rockySurface.isMono ? rockySurface.monoColor : rockySurface.dominantColor;
          baseHue = hueFromName(baseColor || "yellow");
        }
        drawPlanetSoftEdgeAndGrain(p, baseHue);
      }

      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }


    // Draw orbiters (captured meteors) around a planet
    function drawPlanetOrbiters(p) {
      if (!p.orbiters || !p.orbiters.length) return;

      for (const o of p.orbiters) {
        const ox = p.x + Math.cos(o.angle) * o.orbitR;
        const oy = p.y + Math.sin(o.angle) * o.orbitR;

        ctx.beginPath();
        ctx.fillStyle = `hsl(${o.hue} 95% 70%)`;
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(ox - o.r * 0.25, oy - o.r * 0.25, o.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function drawPointerRing() {
      if (!Input.pointerDown) return;

      const pointerRadiusMul = CardEngine.state.engineStats.pointer_radius_mul || 1.0;
      const r = view.worldScale * world.pointerRadius * pointerRadiusMul;

      ctx.save();
      ctx.beginPath();
      ctx.arc(Input.wx, Input.wy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = Math.max(1.5, view.worldScale * 0.0015);
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.restore();
    }

    function drawMeteor(m) {
      if (!window.HC || !window.HC.Meteors || !window.HC.Meteors.drawMeteor) return;
      window.HC.Meteors.drawMeteor(m);
    }

    function frame() {
      drawBackground();

      // world render with camera zoom
      const sx = view.w * 0.5;
      const sy = view.h * 0.5;
      const zoom = cam.zoom || cam.scale || 1;
      const camX = Number.isFinite(cam.x) ? cam.x : sx;
      const camY = Number.isFinite(cam.y) ? cam.y : sy;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(sx, sy);
      ctx.scale(zoom, zoom);
      ctx.translate(-camX, -camY);

      drawPointerRing();
      window.HC.Comets.draw(ctx);
      for (const a of world.asteroids) drawAsteroid(a);
      for (const p of world.planets) drawPlanet(p);
      if (world.stars && world.stars.length) {
        const nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        for (const s of world.stars) drawStar(s, nowMs);
      }
      for (const m of world.meteors) drawMeteor(m);

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // UI: card offer (foundation)
      ctx.save();
      ctx.font = ctx.font || "14px sans-serif";
      ctx.fillStyle = "rgba(20,20,20,0.85)";
      // CardEngine.render will draw panel; it will switch fillStyle for text internally
      CardEngine.render(ctx, view.w, view.h);
      ctx.restore();
    }

    window.HC.Render = {
      frame,
      drawMeteor,
      drawPlanet,
      drawStar,
    };

    return window.HC.Render;
  };
})();
