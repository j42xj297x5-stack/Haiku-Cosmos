// HC harmonic dust subsystem: same-color meteor collision residue + PRG collection.
(function () {
  window.HC = window.HC || {};

  const COLORS = Object.freeze({ red: 10, yellow: 45, green: 120, blue: 210, RED: 10, YELLOW: 45, GREEN: 120, BLUE: 210 });
  const COLOR_KEYS = Object.freeze(["RED", "YELLOW", "GREEN", "BLUE"]);
  const DEPOSIT_KEYS = Object.freeze(["RED", "YELLOW", "GREEN", "BLUE", "GRAY"]);
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
      harmonicDustManualCollectionEnabled: true,
      harmonicDustAutoTestCollectionEnabled: false,
      harmonicDustBodyTransformEnabled: true,
      harmonicDustAsteroidGrayEnabled: true,
      harmonicDustAsteroidGrayRate: 0.35,
      harmonicDustAsteroidMinOverlapRatio: 0.15,
      harmonicDustMoonRingAbsorbEnabled: true,
      harmonicDustMoonRingAbsorbRate: 0.30,
      harmonicDustMoonRingMinOverlapRatio: 0.15,
      harmonicDustMoonRingMaxCount: 4,
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
      World.harmonicDustReservoir = createEmptyReservoir();
    } else {
      World.harmonicDustReservoir = Object.assign(createEmptyReservoir(), World.harmonicDustReservoir);
      World.harmonicDustReservoir.fillPercent = clamp(finite(World.harmonicDustReservoir.fillPercent, 0), 0, 100);
    }
    ensureDepositState(World);
    syncDustPileHudState(World);
    return World;
  }

  function createEmptyReservoir() {
    return { activeColorName: null, isMixedGray: false, fillPercent: 0, pureFillPercent: 0, grayFillPercent: 0, lastCollectedColorName: null, samplesCollected: 0 };
  }

  function resetHarmonicDustReservoir(World) {
    if (!World) return null;
    World.harmonicDustReservoir = createEmptyReservoir();
    syncDustPileHudState(World);
    return World.harmonicDustReservoir;
  }

  function ensureDepositState(World) {
    if (!World) return null;
    if (!World.harmonicDustDeposits || typeof World.harmonicDustDeposits !== "object") World.harmonicDustDeposits = {};
    for (const key of DEPOSIT_KEYS) World.harmonicDustDeposits[key] = Math.max(0, Math.floor(finite(World.harmonicDustDeposits[key], 0)));
    return World.harmonicDustDeposits;
  }

  function getReservoirVisualState(World) {
    const reservoir = ensureWorldState(World)?.harmonicDustReservoir || createEmptyReservoir();
    const displayFillPercent = clamp(finite(reservoir.fillPercent, 0), 0, 100);
    const mixed = reservoir.isMixedGray === true || reservoir.activeColorName === "GRAY";
    const displayColorName = mixed ? "GRAY" : (canonicalColorName(reservoir.activeColorName) || null);
    return {
      displayColorName: displayFillPercent > 0 ? (displayColorName || "EMPTY") : "EMPTY",
      displayFillPercent,
      isFull: displayFillPercent >= 100,
      isMixedGray: mixed,
      activeColorName: reservoir.activeColorName || null,
      lastCollectedColorName: reservoir.lastCollectedColorName || null,
      samplesCollected: Math.max(0, Math.floor(finite(reservoir.samplesCollected, 0))),
    };
  }

  function syncDustPileHudState(World) {
    if (!World) return null;
    const reservoir = World.harmonicDustReservoir || createEmptyReservoir();
    const visual = {
      displayColorName: (reservoir.isMixedGray || reservoir.activeColorName === "GRAY") ? "GRAY" : (canonicalColorName(reservoir.activeColorName) || "EMPTY"),
      displayFillPercent: clamp(finite(reservoir.fillPercent, 0), 0, 100),
      isFull: clamp(finite(reservoir.fillPercent, 0), 0, 100) >= 100,
      isMixedGray: reservoir.isMixedGray === true || reservoir.activeColorName === "GRAY",
    };
    World.harmonicDustReservoirVisual = visual;
    World.dustPile = {
      activeType: visual.displayFillPercent > 0 ? (visual.displayColorName === "GRAY" ? "GREY" : visual.displayColorName) : "NONE",
      percent: visual.displayFillPercent,
      source: "harmonicDustReservoir",
    };
    return visual;
  }

  function depositFullReservoir(World, reason = "auto_full") {
    ensureWorldState(World);
    const reservoir = World.harmonicDustReservoir;
    if (finite(reservoir.fillPercent, 0) < 100) return null;
    const depositColor = (reservoir.isMixedGray || reservoir.activeColorName === "GRAY") ? "GRAY" : canonicalColorName(reservoir.activeColorName);
    if (!depositColor) return null;
    const deposits = ensureDepositState(World);
    deposits[depositColor] += 1;
    const deposited = { colorName: depositColor, count: deposits[depositColor], reason, reservoir: Object.assign({}, reservoir) };
    World.lastHarmonicDustDeposit = deposited;
    if (window.Events?.emit) window.Events.emit("HARMONIC_DUST_RESERVOIR_DEPOSITED", deposited);
    resetHarmonicDustReservoir(World);
    return deposited;
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
    return { x: Number(Input.wx), y: Number(Input.wy), z: 0, r: radius, radius };
  }

  function addCollectedDust(World, dust) {
    ensureWorldState(World);
    const rawSampleColor = String(dust.reservoirColorName || dust.colorName || '').trim().toUpperCase();
    const sampleColor = rawSampleColor === "GRAY" ? "GRAY" : canonicalColorName(rawSampleColor);
    if (!sampleColor) return;
    const samplePercent = clamp(positive(dust.reservoirPercentValue, percentForStep(World, dust.dustSequenceStep || 1)), 0, 100);
    const reservoir = World.harmonicDustReservoir;
    let addedPercent = samplePercent;
    let mixedTransition = false;
    const previousColorName = reservoir.activeColorName;
    if (sampleColor === "GRAY") {
      addedPercent = positive(World.spaceMechanics.harmonicDustMixedIncomingPercent, 10);
      reservoir.isMixedGray = true;
      reservoir.activeColorName = "GRAY";
      reservoir.grayFillPercent = clamp(finite(reservoir.grayFillPercent, 0) + addedPercent, 0, 100);
      mixedTransition = previousColorName !== "GRAY";
    } else if (!reservoir.activeColorName && !reservoir.isMixedGray) {
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
    syncDustPileHudState(World);
    depositFullReservoir(World, "auto_full");
  }

  function getDustBodyOverlap(dust, body) {
    if (!dust || !body || dust._dead || body._dead) return { ratio: 0, distance: Infinity, contactRadius: 0 };
    const dx = finite(body.x, 0) - finite(dust.x, 0);
    const dy = finite(body.y, 0) - finite(dust.y, 0);
    const dustR = positive(dust.r ?? dust.radius, 1);
    const bodyR = positive(body.collisionRadius ?? body.r ?? body.radius, 1);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const contactRadius = dustR + bodyR;
    if (distance >= contactRadius) return { ratio: 0, distance, contactRadius };
    const overlapDepth = Math.max(0, contactRadius - distance);
    return { ratio: clamp(overlapDepth / Math.max(1, Math.min(dustR, bodyR)), 0, 1), distance, contactRadius };
  }

  function isColoredHarmonicDust(dust) {
    return !!dust && !dust._dead && dust.type === "harmonic_dust" && dust.dustKind === "harmonic" && canonicalColorName(dust.colorName);
  }

  function transformDustByAsteroids(World, dt, nowMs) {
    const sm = ensureWorldState(World)?.spaceMechanics || {};
    if (sm.harmonicDustBodyTransformEnabled === false || sm.harmonicDustAsteroidGrayEnabled === false) return;
    const rate = positive(sm.harmonicDustAsteroidGrayRate, 0.35);
    const minOverlap = positive(sm.harmonicDustAsteroidMinOverlapRatio, 0.15);
    for (const dust of World.harmonicDust) {
      if (!isColoredHarmonicDust(dust)) continue;
      for (const asteroid of (Array.isArray(World.asteroids) ? World.asteroids : [])) {
        const overlap = getDustBodyOverlap(dust, asteroid);
        if (overlap.ratio < minOverlap) continue;
        dust.grayMixRatio = clamp(finite(dust.grayMixRatio, 0) + Math.max(0, finite(dt, 0)) * rate * overlap.ratio, 0, 1);
        dust.transformState = "gray_mixed_by_asteroid";
        dust.dustKind = "harmonic";
        dust.type = "harmonic_dust";
        dust.collectible = true;
        dust.lastTransformedAt = nowMs || World.nowMs || Date.now();
        if (dust.grayMixRatio >= 1) { dust.colorName = "GRAY"; dust.reservoirColorName = "GRAY"; }
        World.lastDustTransformEvent = { kind: "asteroid_gray", dustId: dust.id || null, asteroidId: asteroid.id || asteroid._id || null, colorName: dust.colorName, grayMixRatio: dust.grayMixRatio, atMs: dust.lastTransformedAt };
        break;
      }
    }
  }

  function upsertMoonDustRing(World, moon, colorName, mass, density, nowMs) {
    if (!Array.isArray(moon.dustRings)) moon.dustRings = [];
    let ring = moon.dustRings.find((r) => r && r.colorName === colorName && r.source === "harmonic_dust_absorption");
    if (!ring) {
      const maxCount = Math.max(1, Math.floor(positive(World.spaceMechanics.harmonicDustMoonRingMaxCount, 4)));
      if (moon.dustRings.length >= maxCount) moon.dustRings.shift();
      ring = { id: `moon_dust_ring_${moon.id || moon._id || 'moon'}_${colorName}_${moon.dustRings.length + 1}`, colorName, mass: 0, density: 0, radius: positive(moon.r ?? moon.radius, 1) * 1.25, source: "harmonic_dust_absorption", createdAt: nowMs || World.nowMs || Date.now(), updatedAt: nowMs || World.nowMs || Date.now() };
      moon.dustRings.push(ring);
    }
    ring.mass = positive(ring.mass, 0) + Math.max(0, finite(mass, 0));
    ring.density = positive(ring.density, 0) + Math.max(0, finite(density, 0));
    ring.radius = Math.max(positive(ring.radius, 0), positive(moon.r ?? moon.radius, 1) * 1.25);
    ring.updatedAt = nowMs || World.nowMs || Date.now();
    return ring;
  }

  function absorbDustByMoons(World, dt, nowMs) {
    const sm = ensureWorldState(World)?.spaceMechanics || {};
    if (sm.harmonicDustBodyTransformEnabled === false || sm.harmonicDustMoonRingAbsorbEnabled === false) return;
    const rate = positive(sm.harmonicDustMoonRingAbsorbRate, 0.30);
    const minOverlap = positive(sm.harmonicDustMoonRingMinOverlapRatio, 0.15);
    for (const dust of World.harmonicDust) {
      if (!isColoredHarmonicDust(dust)) continue;
      for (const moon of (Array.isArray(World.moons) ? World.moons : [])) {
        const overlap = getDustBodyOverlap(dust, moon);
        if (overlap.ratio < minOverlap) continue;
        const colorName = canonicalColorName(dust.colorName);
        const fraction = clamp(Math.max(0, finite(dt, 0)) * rate * overlap.ratio, 0, 0.95);
        const oldMass = positive(dust.mass, 1);
        const oldDensity = positive(dust.density, 0.42);
        const absorbedMass = Math.max(0.001, oldMass * fraction);
        const absorbedDensity = Math.max(0.001, oldDensity * fraction);
        dust.mass = Math.max(0, oldMass - absorbedMass);
        dust.density = Math.max(0, oldDensity - absorbedDensity);
        dust.r = radiusForMass(World, Math.max(0.01, dust.mass), dust.r);
        const ring = upsertMoonDustRing(World, moon, colorName, absorbedMass, absorbedDensity, nowMs);
        World.lastDustTransformEvent = { kind: "moon_ring_absorb", dustId: dust.id || null, moonId: moon.id || moon._id || null, ringId: ring.id, colorName, absorbedMass, atMs: nowMs || World.nowMs || Date.now() };
        if (dust.mass <= 0.02 || dust.density <= 0.002) { dust._dead = true; dust.absorbedByMoonId = moon.id || moon._id || null; }
        break;
      }
    }
  }

  function updateBodyTransformations(World, dt, nowMs) {
    ensureWorldState(World);
    if (World.spaceMechanics.harmonicDustBodyTransformEnabled === false) return;
    transformDustByAsteroids(World, dt, nowMs);
    absorbDustByMoons(World, dt, nowMs);
    World.harmonicDust = World.harmonicDust.filter((dust) => dust && !dust._dead);
  }

  function update(dt, nowMs) {
    const World = ensureWorldState((window.HC.getWorld && window.HC.getWorld()) || window.World);
    if (!World) return;
    const dtMs = Math.max(0, finite(dt, 0) * 1000);
    const manualCollectionEnabled = World.spaceMechanics.harmonicDustManualCollectionEnabled !== false;
    const autoTestCollectionEnabled = World.spaceMechanics.harmonicDustAutoTestCollectionEnabled === true;
    updateBodyTransformations(World, dt, nowMs);
    const prg = manualCollectionEnabled ? getPrg(World) : null;
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
      dust.isBeingCollected = overlapping && manualCollectionEnabled;
      if (overlapping) dust.collectProgressMs = Math.min(dust.collectRequiredMs, finite(dust.collectProgressMs, 0) + dtMs * rateMul);
      else if (autoTestCollectionEnabled) dust.collectProgressMs = Math.min(dust.collectRequiredMs, finite(dust.collectProgressMs, 0) + dtMs * rateMul);
      else {
        const decayMs = positive(dust.collectDecayMs, dust.collectRequiredMs * 0.35);
        const decayPerMs = dust.collectRequiredMs / decayMs;
        dust.collectProgressMs = Math.max(0, finite(dust.collectProgressMs, 0) - dtMs * decayPerMs);
      }
      if (dust.collectProgressMs >= dust.collectRequiredMs) {
        dust._dead = true;
        addCollectedDust(World, dust);
        World.lastHarmonicDustCollectedEvent = { id: dust.id || null, colorName: dust.colorName || null, reservoirPercentValue: finite(dust.reservoirPercentValue, 0), atMs: nowMs || World.nowMs || Date.now(), via: dust.isBeingCollected ? "manual_prg" : "auto_test_flag" };
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
      const grayMix = clamp(finite(dust.grayMixRatio, dust.colorName === "GRAY" ? 1 : 0), 0, 1);
      const hue = hueFor(dust.colorName);
      const sat = dust.colorName === "GRAY" ? 8 : Math.max(8, 95 - grayMix * 82);
      const light = dust.colorName === "GRAY" ? 68 : Math.max(58, 72 - grayMix * 12);
      const visual = dust.visual || {};
      const collectRatio = Number.isFinite(Number(dust.collectRatio)) ? clamp(Number(dust.collectRatio), 0, 1) : clamp(finite(dust.collectProgressMs, 0) / positive(dust.collectRequiredMs, 1), 0, 1);
      const pulse = 0.9 + Math.sin(finite(dust.visualPulse, 0)) * 0.08;
      const valueScale = 1 + clamp(finite(dust.reservoirPercentValue, 10), 10, 100) / 220;
      const r = positive(visual.radius, positive(dust.r, 1)) * pulse * valueScale;
      const densityAlpha = positive(dust.density, 0.42) * 0.45;
      const massAlpha = Math.min(0.18, Math.sqrt(positive(dust.mass, 1)) / 90);
      const alpha = clamp(finite(visual.alpha, finite(dust.visualAlpha, densityAlpha + massAlpha + 0.24)) + clamp(finite(dust.reservoirPercentValue, 10), 10, 100) / 650, 0.15, 0.72);
      const grad = ctx.createRadialGradient(dust.x, dust.y, r * 0.1, dust.x, dust.y, r * 1.35);
      grad.addColorStop(0, `hsla(${hue} ${sat}% ${light}% / ${alpha})`);
      grad.addColorStop(1, `hsla(${hue} ${sat}% ${Math.max(44, light - 16)}% / 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, r * 1.35, 0, Math.PI * 2);
      ctx.fill();
      if (finite(dust.reservoirPercentValue, 0) >= 50) {
        ctx.strokeStyle = `hsla(${hue} ${Math.max(8, 100 - grayMix * 86)}% 82% / 0.28)`;
        ctx.lineWidth = Math.max(1, r * 0.045);
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, r * 1.42, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (collectRatio > 0) {
        const t = collectRatio;
        ctx.strokeStyle = `hsla(${hue} ${Math.max(8, 80 - grayMix * 68)}% 78% / ${dust.isBeingCollected ? 0.72 : 0.38})`;
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
    window.HC.HarmonicDust = { ensureWorldState, createOrMergeFromMeteorCollision, update, draw, collectMsForMass, collectMsForPercent, canonicalColorName, percentForStep, resetHarmonicDustReservoir, ensureDepositState, depositFullReservoir, getReservoirVisualState, syncDustPileHudState, getPrgActionField: getPrg, updateBodyTransformations, transformDustByAsteroids, absorbDustByMoons, getDustBodyOverlap, addCollectedDust };
    return window.HC.HarmonicDust;
  };
})();
