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
      harmonicDustStepPercents: [10, 20, 50],
      harmonicDustSequenceMaxStep: 3,
      harmonicDustPercentCollectMsMul: 55,
      harmonicDustMaxReservoirPercentValue: 100,
      harmonicDustMixedIncomingPercent: 10,
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
    if (!World.harmonicDustSequence || typeof World.harmonicDustSequence !== "object") {
      World.harmonicDustSequence = { colorName: null, step: 0, lastCollisionAt: 0 };
    }
    if (!World.harmonicDustReservoir || typeof World.harmonicDustReservoir !== "object") {
      World.harmonicDustReservoir = { activeColorName: null, isMixedGray: false, fillPercent: 0, pureFillPercent: 0, grayFillPercent: 0, lastCollectedColorName: null, samplesCollected: 0 };
    }
    return World;
  }

  function stepPercents(World) {
    const raw = ensureWorldState(World)?.spaceMechanics?.harmonicDustStepPercents;
    const values = Array.isArray(raw) ? raw.map((v) => positive(v, 0)).filter((v) => v > 0) : [];
    return values.length >= 3 ? values.slice(0, 3) : [10, 20, 50];
  }

  function percentForStep(World, step) {
    const values = stepPercents(World);
    const maxStep = Math.max(1, Math.floor(positive(World.spaceMechanics.harmonicDustSequenceMaxStep, 3)));
    const idx = clamp(Math.floor(positive(step, 1)), 1, Math.min(maxStep, values.length)) - 1;
    return values[idx] || values[values.length - 1] || 10;
  }

  function advanceDustSequence(World, colorName, nowMs) {
    ensureWorldState(World);
    const seq = World.harmonicDustSequence;
    const maxStep = Math.max(1, Math.floor(positive(World.spaceMechanics.harmonicDustSequenceMaxStep, 3)));
    seq.step = seq.colorName === colorName ? Math.min(maxStep, Math.floor(finite(seq.step, 0)) + 1) : 1;
    seq.colorName = colorName;
    seq.lastCollisionAt = finite(nowMs, World.nowMs || Date.now());
    return { step: seq.step, percent: percentForStep(World, seq.step) };
  }

  function collectMsForPercent(World, reservoirPercentValue) {
    const sm = ensureWorldState(World)?.spaceMechanics || {};
    const base = positive(sm.harmonicDustBaseCollectMs, 2400);
    const mul = positive(sm.harmonicDustPercentCollectMsMul, 55);
    const max = positive(sm.harmonicDustMaxCollectMs, 8000);
    return clamp(base + positive(reservoirPercentValue, 10) * mul, base, max);
  }

  function collectMsForMass(World, mass) {
    return collectMsForPercent(World, Math.sqrt(positive(mass, 1)) * 10);
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
    const sequence = advanceDustSequence(World, colorName, nowMs);
    const incomingPercent = sequence.percent;
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
      target.dustSequenceStep = sequence.step;
      target.reservoirPercentValue = clamp(finite(target.reservoirPercentValue, 0) + incomingPercent, 0, positive(World.spaceMechanics.harmonicDustMaxReservoirPercentValue, 100));
      target.reservoirColorName = colorName;
      target.collectRequiredMs = collectMsForPercent(World, target.reservoirPercentValue);
      target.collectDecayMs = target.collectRequiredMs * positive(World.spaceMechanics.harmonicDustCollectDecayMul, 0.35);
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
      dustSequenceStep: sequence.step,
      reservoirPercentValue: incomingPercent,
      reservoirColorName: colorName,
      collectRequiredMs: collectMsForPercent(World, incomingPercent),
      collectDecayMs: collectMsForPercent(World, incomingPercent) * positive(World.spaceMechanics.harmonicDustCollectDecayMul, 0.35),
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
    ensureWorldState(World);
    const sampleColor = canonicalColorName(dust.reservoirColorName || dust.colorName);
    if (!sampleColor) return;
    const samplePercent = clamp(positive(dust.reservoirPercentValue, percentForStep(World, dust.dustSequenceStep || 1)), 0, 100);
    const reservoir = World.harmonicDustReservoir;
    let addedPercent = samplePercent;
    let mixedTransition = false;
    const previousColorName = reservoir.activeColorName;
    if (!reservoir.activeColorName && !reservoir.isMixedGray) {
      reservoir.activeColorName = sampleColor;
      reservoir.pureFillPercent = clamp(finite(reservoir.pureFillPercent, 0) + samplePercent, 0, 100);
    } else if (!reservoir.isMixedGray && reservoir.activeColorName === sampleColor) {
      reservoir.pureFillPercent = clamp(finite(reservoir.pureFillPercent, 0) + samplePercent, 0, 100);
    } else {
      addedPercent = positive(World.spaceMechanics.harmonicDustMixedIncomingPercent, 10);
      reservoir.isMixedGray = true;
      reservoir.activeColorName = "GRAY";
      reservoir.grayFillPercent = clamp(finite(reservoir.grayFillPercent, 0) + addedPercent, 0, 100);
      mixedTransition = !previousColorName || previousColorName !== "GRAY";
    }
    reservoir.fillPercent = clamp(finite(reservoir.fillPercent, 0) + addedPercent, 0, 100);
    reservoir.lastCollectedColorName = sampleColor;
    reservoir.samplesCollected = Math.max(0, Math.floor(finite(reservoir.samplesCollected, 0))) + 1;
    World.harmonicDustCollected[sampleColor] = clamp(finite(World.harmonicDustCollected[sampleColor], 0) + addedPercent, 0, 100);
    const adapter = World.hudDustReservoir || window.HC?.HudDustReservoir || window.HC?.DustReservoir;
    if (adapter && typeof adapter.addCollectedDust === "function") {
      adapter.addCollectedDust(reservoir.activeColorName || sampleColor, addedPercent, { source: "harmonic_dust", dust, reservoir });
    }
    if (mixedTransition && window.Events?.emit) {
      window.Events.emit("HARMONIC_DUST_RESERVOIR_MIXED", { previousColorName, incomingColorName: sampleColor, addedPercent, fillPercent: reservoir.fillPercent, isMixedGray: true });
    }
    const pile = window.HC?.DustPileHud;
    if (pile && typeof pile.setDebugState === "function") {
      pile.setDebugState({ activeType: reservoir.isMixedGray ? "GREY" : sampleColor, percent: reservoir.fillPercent });
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
      const valueScale = 1 + clamp(finite(dust.reservoirPercentValue, 10), 10, 100) / 220;
      const r = positive(dust.r, 1) * pulse * valueScale;
      const alpha = clamp(finite(dust.visualAlpha, 0.58) + clamp(finite(dust.reservoirPercentValue, 10), 10, 100) / 500, 0.15, 0.82);
      const grad = ctx.createRadialGradient(dust.x, dust.y, r * 0.1, dust.x, dust.y, r * 1.35);
      grad.addColorStop(0, `hsla(${hue} 95% 72% / ${alpha})`);
      grad.addColorStop(1, `hsla(${hue} 95% 55% / 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, r * 1.35, 0, Math.PI * 2);
      ctx.fill();
      if (finite(dust.reservoirPercentValue, 0) >= 50) {
        ctx.strokeStyle = `hsla(${hue} 100% 82% / 0.28)`;
        ctx.lineWidth = Math.max(1, r * 0.045);
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, r * 1.42, 0, Math.PI * 2);
        ctx.stroke();
      }
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
    window.HC.HarmonicDust = { ensureWorldState, createOrMergeFromMeteorCollision, update, draw, collectMsForMass, collectMsForPercent, canonicalColorName, percentForStep };
    return window.HC.HarmonicDust;
  };
})();
