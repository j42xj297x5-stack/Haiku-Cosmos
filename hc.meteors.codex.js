// HC meteors subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  const MeteorColors = window.MeteorColors || [
    { name: "blue", hue: 210 },
    { name: "green", hue: 120 },
    { name: "red", hue: 10 },
    { name: "yellow", hue: 45 },
  ];
  window.MeteorColors = MeteorColors;

  window.HC.initMeteors = () => {
    const World = window.World || (window.HC.getWorld && window.HC.getWorld());
    const Events = window.Events;
    const View = window.View || (window.HC.getView && window.HC.getView());
    const Camera = window.Camera || (window.HC.getCamera && window.HC.getCamera());
    const Input = window.Input;
    const CardEngine = window.CardEngine;
    const rand = window.rand;
    const meteorBaseRadius = window.meteorBaseRadius;
    const massFromR = window.massFromR;
    const getWorldViewBounds = window.getWorldViewBounds;
    const ctx = window.ctx;

    // ---------- Meteor palette ----------
    function pickColor() {
      return MeteorColors[(Math.random() * MeteorColors.length) | 0];
    }

    function spawnMeteor() {
      const c = pickColor();
      const Rm = meteorBaseRadius();
      const r = rand(0.75, 1.35) * Rm;

      const b = getWorldViewBounds();
      const side = (Math.random() * 4) | 0;
      let x = 0, y = 0;
      if (side === 0) { x = rand(b.l, b.r); y = b.t - r * 2; }
      if (side === 1) { x = b.r + r * 2; y = rand(b.t, b.b); }
      if (side === 2) { x = rand(b.l, b.r); y = b.b + r * 2; }
      if (side === 3) { x = b.l - r * 2; y = rand(b.t, b.b); }

      // random through-screen direction (not to center)
      let angle = 0;
      if (side === 0) angle = rand(Math.PI * 0.25, Math.PI * 0.75);
      if (side === 2) angle = rand(-Math.PI * 0.75, -Math.PI * 0.25);
      if (side === 1) angle = rand(Math.PI * 0.75, Math.PI * 1.25);
      if (side === 3) angle = rand(-Math.PI * 0.25, Math.PI * 0.25);
      angle += rand(-0.35, 0.35);

      const speed = rand(0.08, 0.22) * View.worldScale;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      World.meteors.push({
        x, y, vx, vy,
        r,
        colorName: c.name,
        hue: c.hue,
        age: 0,
        life: rand(60, 120),
        trail: [{ x, y, t: 0 }],
            // prevent instant meteor-meteor re-aggregation after release
            noMeteorCollisionUntilMs: (World.nowMs ?? performance.now()) + 1200,
          });

      Events.emit("METEOR_SPAWNED", {});
    }

    function spawnStreamMeteor(angle, streamIndex) {
      const c = pickColor();
      const Rm = meteorBaseRadius();
      const r = rand(0.7, 1.2) * Rm;

      const cx = View.w / 2;
      const cy = View.h / 2;
      const s = Camera.scale || 1;
      const worldHalfW = (View.w * 0.5) / s;
      const worldHalfH = (View.h * 0.5) / s;
      const spawnR = Math.max(worldHalfW, worldHalfH) * 1.25;

      const sx = cx - Math.cos(angle) * spawnR;
      const sy = cy - Math.sin(angle) * spawnR;

      const speed = rand(0.18, 0.32) * View.worldScale * 1.6;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      World.meteors.push({
        x: sx,
        y: sy,
        vx,
        vy,
        r,
        colorName: c.name,
        hue: c.hue,
        age: 0,
        life: rand(60, 120),
        trail: [{ x: sx, y: sy, t: 0 }],
        isStream: true,
        streamIndex,
      });
    }

    function drawMeteor(m) {
      const maxTrail = 10;
      if (!m.trail) {
        m.trail = [{ x: m.x, y: m.y, t: 0 }];
      }
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > maxTrail) m.trail.shift();

      ctx.globalAlpha = 0.18;
      for (let i = 0; i < m.trail.length; i++) {
        const t = m.trail[i];
        const k = (i + 1) / m.trail.length;
        const rr = m.r * (0.6 + 0.8 * k);
        ctx.beginPath();
        ctx.fillStyle = `hsl(${m.hue} 90% 70%)`;
        ctx.arc(t.x, t.y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.fillStyle = `hsl(${m.hue} 90% 70%)`;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(m.x - m.r * 0.25, m.y - m.r * 0.25, m.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function updateMeteors(dt, nowMs) {
      if (World.meteorStreams && World.meteorStreams.enabled && World.meteorStreams.untilMs != null) {
        const currentMs = nowMs ?? World.nowMs ?? performance.now();
        if (currentMs >= World.meteorStreams.untilMs) {
          if (window.HC?.WorldEvents?.stopMeteorShower) {
            window.HC.WorldEvents.stopMeteorShower();
          } else {
            World.meteorStreams.enabled = false;
            World.meteorStreams.untilMs = null;
          }
        }
      }
      World.spawnTimer += dt;
      while (World.spawnTimer >= (World.spawnInterval * (World.spawnIntervalMul || 1.0))) {
        World.spawnTimer -= (World.spawnInterval * (World.spawnIntervalMul || 1.0));
        if (World.meteors.length < World.maxMeteors) spawnMeteor();
      }

      if (World.epoch === "STAR" && World.meteorStreams && World.meteorStreams.enabled) {
        const ms = World.meteorStreams;
        ms.t += dt;
        ms.baseAngle += ms.driftSpeed * dt;
        ms.shiftTimer += dt;
        if (ms.shiftTimer >= ms.shiftEvery) {
          ms.shiftTimer = 0;
          ms.baseAngle += (Math.random() * 2 - 1) * ms.shiftAmount;
        }
        const totalRate = ms.spawnRate * ms.streams;
        ms.acc += dt * totalRate;
        while (ms.acc >= 1) {
          ms.acc -= 1;
          const i = Math.floor(Math.random() * ms.streams);
          const spread = 0.18;
          const a = ms.baseAngle + (i - (ms.streams - 1) / 2) * spread + ((Math.random() * 2 - 1) * 0.06);
          spawnStreamMeteor(a, i);
        }
      }

      const controlMul = CardEngine.state.engineStats.meteor_mouse_control || 1.0;
      const pointerRadiusMul = CardEngine.state.engineStats.pointer_radius_mul || 1.0;
      const pointerStrengthMul = CardEngine.state.engineStats.pointer_strength_mul || 1.0;

      const pointerRadiusPx = View.worldScale * World.pointerRadius * pointerRadiusMul;
      const pointerRadiusSq = pointerRadiusPx * pointerRadiusPx;

      const attract = Input.pointerDown;
      const ax = Input.wx;
      const ay = Input.wy;

      const attractionStrength = World.pointerStrength * controlMul * pointerStrengthMul;

      for (let i = World.meteors.length - 1; i >= 0; i--) {
        const m = World.meteors[i];
        m.age += dt;

        if (attract) {
          const dx = ax - m.x;
          const dy = ay - m.y;
          const d2 = dx * dx + dy * dy;

          if (d2 <= pointerRadiusSq) {
    const d = Math.sqrt(d2) || 1;
    const t = 1 - (d / pointerRadiusPx);
    const falloff = t * t * (3 - 2 * t);

    // 1) przyciąganie do kursora
    const pull = attractionStrength * falloff * (View.worldScale / 800);
    m.vx += (dx / d) * pull * View.worldScale * dt;
    m.vy += (dy / d) * pull * View.worldScale * dt;

    // 2) "klejenie": tłumienie prędkości gdy meteor jest w ring-u
    // (mniej mijania, bardziej kontrolowalne zderzenia)
    const glue = World.pointerGlueDamp * falloff; // mocniej bliżej środka ring-u
    m.vx *= (1 - glue);
    m.vy *= (1 - glue);
  }

        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        m.vx *= (1 - 0.06 * dt);
        m.vy *= (1 - 0.06 * dt);

        if (World.meteorBounceEnabled) {
          const bounceLoss = 0.92;
          const b = getWorldViewBounds();
          if (m.x - m.r < b.l) { m.x = b.l + m.r; m.vx = Math.abs(m.vx) * bounceLoss; }
          if (m.x + m.r > b.r) { m.x = b.r - m.r; m.vx = -Math.abs(m.vx) * bounceLoss; }
          if (m.y - m.r < b.t) { m.y = b.t + m.r; m.vy = Math.abs(m.vy) * bounceLoss; }
          if (m.y + m.r > b.b) { m.y = b.b - m.r; m.vy = -Math.abs(m.vy) * bounceLoss; }
        }

        if (World.epoch === "STAR" && m.isStream) {
          const cx = View.w / 2;
          const cy = View.h / 2;
          const s = Camera.scale || 1;
          const worldHalfW = (View.w * 0.5) / s;
          const worldHalfH = (View.h * 0.5) / s;
          const spawnR = Math.max(worldHalfW, worldHalfH) * 1.6;
          if (Math.hypot(m.x - cx, m.y - cy) > spawnR) {
            World.meteors.splice(i, 1);
            continue;
          }
        }

        if (World.stars && World.stars.length) {
          for (const s of World.stars) {
            const dx = m.x - s.x;
            const dy = m.y - s.y;
            const rr = s.r + m.r;
            if (dx * dx + dy * dy <= rr * rr) {
              s.mass = (s.mass || 0) + massFromR(m.r);
              World.meteors.splice(i, 1);
              break;
            }
          }
          if (i >= World.meteors.length || World.meteors[i] !== m) continue;
        }

        m.life -= dt;
        if (m.life <= 0) World.meteors.splice(i, 1);
      }
    }

    const Meteors = { update: updateMeteors, drawMeteor, spawnMeteor, spawnStreamMeteor };
    if (window.Meteors) {
      window.HC.Meteors = window.Meteors;
    } else {
      window.Meteors = Meteors;
      window.HC.Meteors = Meteors;
    }

    return Meteors;
  };
})();
