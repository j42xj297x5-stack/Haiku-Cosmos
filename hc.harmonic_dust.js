// HC harmonic dust subsystem: same-color meteor collision residue + PRG collection.
(function () {
  window.HC = window.HC || {};

  const COLORS = Object.freeze({ red: 10, yellow: 45, green: 120, blue: 210, RED: 10, YELLOW: 45, GREEN: 120, BLUE: 210 });
  const COLOR_KEYS = Object.freeze(["RED", "YELLOW", "GREEN", "BLUE"]);
  let nextDustId = 1;

  function finite(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  function positive(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function canonicalColorName(value) {
    const upper = String(value || "").trim().toUpperCase();
    return COLOR_KEYS.includes(upper) ? upper : null;
  }
  function hueFor(colorName) { return COLORS[colorName] ?? COLORS[String(colorName || "").toLowerCase()] ?? 0; }

  function ensureWorldState(World) {
    if (!World) return null;
    if (!Array.isArray(World.harmonicDust)) World.harmonicDust = [];
    World.spaceMechanics = Object.assign({
      harmonicDustMergeRadiusMul: 2.0,
      harmonicDustBaseCollectMs: 2400,
      harmonicDustMassCollectMsMul: 850,
      harmonicDustCollectDecayMul: 0.35,
      harmonicDustPrgCollectRateMul: 1.0,
      harmonicDustMaxCollectMs: 8000,
    }, World.spaceMechanics || {});
    if (!World.harmonicDustCollected || typeof World.harmonicDustCollected !== "object") {
      World.harmonicDustCollected = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0 };
    } else {
      for (const key of COLOR_KEYS) if (!Number.isFinite(Number(World.harmonicDustCollected[key]))) World.harmonicDustCollected[key] = 0;
    }
    return World;
  }

  function collectMsForMass(World, mass) {
    const sm = ensureWorldState(World)?.spaceMechanics || {};
    const base = positive(sm.harmonicDustBaseCollectMs, 2400);
    const mul = positive(sm.harmonicDustMassCollectMsMul, 850);
    const max = positive(sm.harmonicDustMaxCollectMs, 8000);
    return clamp(base + Math.sqrt(positive(mass, 1)) * mul, base, max);
  }

  function radiusForMass(World, mass, fallback) {
    const SpaceBodies = window.HC?.SpaceBodies;
    if (SpaceBodies?.radiusFromMass) return SpaceBodies.radiusFromMass("dustCloud", mass, { density: 0.42, minRadius: positive(fallback, 1) });
    return Math.max(positive(fallback, 1), Math.sqrt(positive(mass, 1)));
  }

  function createOrMergeFromMeteorCollision(a, b, nowMs) {
    const World = ensureWorldState((window.HC.getWorld && window.HC.getWorld()) || window.World);
    if (!World || !a || !b) return null;
    const colorName = canonicalColorName(a.colorName);
    if (!colorName || colorName !== canonicalColorName(b.colorName)) return null;
    const x = (finite(a.x, 0) + finite(b.x, 0)) * 0.5;
    const y = (finite(a.y, 0) + finite(b.y, 0)) * 0.5;
    const z = (finite(a.z, 0) + finite(b.z, 0)) * 0.5;
    const massA = positive(a.mass, Math.max(1, positive(a.r, 1) * positive(a.r, 1)));
    const massB = positive(b.mass, Math.max(1, positive(b.r, 1) * positive(b.r, 1)));
    const incomingMass = Math.max(1, (massA + massB) * 0.5);
    const incomingR = radiusForMass(World, incomingMass, (positive(a.r, 1) + positive(b.r, 1)) * 0.55);
    const mergeRadiusMul = positive(World.spaceMechanics.harmonicDustMergeRadiusMul, 2.0);
    let target = null;
    for (const dust of World.harmonicDust) {
      if (!dust || dust._dead || dust.dustKind !== "harmonic" || dust.colorName !== colorName) continue;
      const dx = finite(dust.x, 0) - x;
      const dy = finite(dust.y, 0) - y;
      const mergeRadius = (positive(dust.r, 1) + incomingR) * mergeRadiusMul;
      if (dx * dx + dy * dy <= mergeRadius * mergeRadius) { target = dust; break; }
    }
    if (target) {
      const totalMass = positive(target.mass, 1) + incomingMass;
      target.x = ((finite(target.x, x) * positive(target.mass, 1)) + x * incomingMass) / totalMass;
      target.y = ((finite(target.y, y) * positive(target.mass, 1)) + y * incomingMass) / totalMass;
      target.z = ((finite(target.z, z) * positive(target.mass, 1)) + z * incomingMass) / totalMass;
      target.mass = totalMass;
      target.r = radiusForMass(World, totalMass, target.r);
      target.collectRequiredMs = collectMsForMass(World, totalMass);
      target.lastMergedAt = nowMs || World.nowMs || Date.now();
      target.sourceMeteorIds = Array.from(new Set([...(target.sourceMeteorIds || []), a.id || a._id, b.id || b._id].filter(Boolean)));
      return target;
    }
    const dust = {
      id: `harmonic_dust_${nextDustId++}`,
      type: "harmonic_dust",
      dustKind: "harmonic",
      collectible: true,
      isCosmicGrayDust: false,
      colorName,
      x, y, z,
      r: incomingR,
      mass: incomingMass,
      density: 0.42,
      collectProgressMs: 0,
      collectRequiredMs: collectMsForMass(World, incomingMass),
      collectDecayMs: collectMsForMass(World, incomingMass) * positive(World.spaceMechanics.harmonicDustCollectDecayMul, 0.35),
      source: "same_color_meteor_collision",
      createdAt: nowMs || World.nowMs || Date.now(),
      age: 0,
      lastMergedAt: nowMs || World.nowMs || Date.now(),
      visualAlpha: 0.58,
      visualPulse: 0,
      sourceMeteorIds: [a.id || a._id, b.id || b._id].filter(Boolean),
      _dead: false,
    };
    World.harmonicDust.push(dust);
    return dust;
  }

  function getPrg(World) {
    const Input = window.Input;
    if (!Input || !Input.pointerDown || !Number.isFinite(Number(Input.wx)) || !Number.isFinite(Number(Input.wy))) return null;
    const View = (window.HC.getView && window.HC.getView()) || window.View || {};
    const CE = window.CardEngine;
    const mul = CE?.state?.engineStats?.pointer_radius_mul || 1;
    const radius = positive(View.worldScale, 1) * positive(World.pointerRadius, 0.2) * positive(mul, 1);
    return { x: Number(Input.wx), y: Number(Input.wy), r: radius };
  }

  function addCollectedDust(World, dust) {
    const amount = positive(dust.mass, 1);
    const adapter = World.hudDustReservoir || window.HC?.HudDustReservoir || window.HC?.DustReservoir;
    if (adapter && typeof adapter.addCollectedDust === "function") {
      adapter.addCollectedDust(dust.colorName, amount, { source: "harmonic_dust", dust });
    } else {
      ensureWorldState(World).harmonicDustCollected[dust.colorName] += amount;
    }
    const pile = window.HC?.DustPileHud;
    if (pile && typeof pile.setDebugState === "function") {
      pile.setDebugState({ activeType: dust.colorName, percent: 100 });
    }
  }

  function update(dt, nowMs) {
    const World = ensureWorldState((window.HC.getWorld && window.HC.getWorld()) || window.World);
    if (!World) return;
    const dtMs = Math.max(0, finite(dt, 0) * 1000);
    const prg = getPrg(World);
    const rateMul = positive(World.spaceMechanics.harmonicDustPrgCollectRateMul, 1.0);
    for (const dust of World.harmonicDust) {
      if (!dust || dust._dead) continue;
      dust.age = Math.max(0, ((nowMs || World.nowMs || Date.now()) - finite(dust.createdAt, nowMs || 0)) / 1000);
      dust.visualPulse = (finite(dust.visualPulse, 0) + finite(dt, 0) * 2) % (Math.PI * 2);
      let overlapping = false;
      if (prg) {
        const dx = prg.x - finite(dust.x, 0);
        const dy = prg.y - finite(dust.y, 0);
        const contact = prg.r + positive(dust.r, 1);
        overlapping = dx * dx + dy * dy <= contact * contact;
      }
      if (overlapping) dust.collectProgressMs = Math.min(dust.collectRequiredMs, finite(dust.collectProgressMs, 0) + dtMs * rateMul);
      else {
        const decayMs = positive(dust.collectDecayMs, dust.collectRequiredMs * 0.35);
        const decayPerMs = dust.collectRequiredMs / decayMs;
        dust.collectProgressMs = Math.max(0, finite(dust.collectProgressMs, 0) - dtMs * decayPerMs);
      }
      if (dust.collectProgressMs >= dust.collectRequiredMs) {
        dust._dead = true;
        addCollectedDust(World, dust);
      }
    }
    World.harmonicDust = World.harmonicDust.filter((dust) => dust && !dust._dead);
  }

  function draw(ctx, nowMs) {
    const World = ensureWorldState((window.HC.getWorld && window.HC.getWorld()) || window.World);
    if (!World || !ctx || !World.harmonicDust.length) return;
    ctx.save();
    for (const dust of World.harmonicDust) {
      if (!dust || dust._dead) continue;
      const hue = hueFor(dust.colorName);
      const pulse = 0.9 + Math.sin(finite(dust.visualPulse, 0)) * 0.08;
      const r = positive(dust.r, 1) * pulse;
      const alpha = clamp(finite(dust.visualAlpha, 0.58), 0.15, 0.75);
      const grad = ctx.createRadialGradient(dust.x, dust.y, r * 0.1, dust.x, dust.y, r * 1.35);
      grad.addColorStop(0, `hsla(${hue} 95% 72% / ${alpha})`);
      grad.addColorStop(1, `hsla(${hue} 95% 55% / 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, r * 1.35, 0, Math.PI * 2);
      ctx.fill();
      if (dust.collectProgressMs > 0) {
        const t = clamp(dust.collectProgressMs / positive(dust.collectRequiredMs, 1), 0, 1);
        ctx.strokeStyle = `hsla(${hue} 100% 80% / 0.85)`;
        ctx.lineWidth = Math.max(1.5, r * 0.08);
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  window.HC.initHarmonicDust = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    ensureWorldState(World);
    window.HC.HarmonicDust = { ensureWorldState, createOrMergeFromMeteorCollision, update, draw, collectMsForMass, canonicalColorName };
    return window.HC.HarmonicDust;
  };
})();
