console.log("[HC] cards.sequences.js loaded");

(function initCardSequences(global) {
  function create(deps) {
    const {
      state,
      config,
      CardRegistry,
      nowMs,
      shouldTraceSeq,
      pushSeqTrace,
      getSeqTraceSnapshot,
      getHitSnapshot,
      setSequencePhase,
      canStartStepWithColor,
      applyDirectionSelection,
      addScoreToWorld,
      getSequenceMultiplier,
      commitSequenceNewRewards,
      rewardSequenceFail,
      recomputeTotalCards,
      resetSequenceState,
      normalizePack01Color,
      ensureCardsPool,
      createCardEntity,
      getRewardDedupeKey,
      cardMatches,
      applyWorldSlotEffectsOnRunActivation,
      getFormaTimeBonusMs,
      computeActivationDurationMs,
      startRunTimerForColor,
      startR1TimerForColor,
      startFormaEffect,
    } = deps;

    function traceSeqHit(action, normalizedColor, details) {
      if (!shouldTraceSeq()) return;
      const seq = state.sequence;
      const entry = {
        t: nowMs(),
        action,
        color: normalizedColor,
        ...getSeqTraceSnapshot(seq),
        ...(details && typeof details === "object" ? details : {})
      };
      pushSeqTrace(entry);
      console.log("[SEQ_TRACE]", entry);
    }

    function showSequenceOverlay(level, colors, colorKey, ttlMs) {
      const options = arguments.length > 4 ? arguments[4] : null;
      const now = nowMs();
      state.sequenceOverlay = {
        visible: true,
        level: Math.max(1, Math.min(4, Number(level || 1))),
        colors: Array.isArray(colors) ? colors.slice() : [],
        colorKey: colorKey || null,
        shownAtMs: now,
        ttlMs: Math.max(0, Number(ttlMs || 0)),
        mode: options && options.mode ? String(options.mode) : "sequence"
      };
    }

    function showSequenceToast(title, subtitle, colorKey, ttlMs) {
      const options = arguments.length > 4 ? arguments[4] : null;
      const now = nowMs();
      state.sequenceToast = {
        visible: true,
        title: String(title || ""),
        subtitle: String(subtitle || ""),
        colorKey: colorKey || null,
        colors: [],
        cards: Array.isArray(options?.cards) ? options.cards.slice() : [],
        rp: Number.isFinite(options?.rp) ? options.rp : null,
        shownAtMs: now,
        ttlMs: Math.max(0, Number(ttlMs || 0)),
        mode: "text"
      };
    }

    function showSequenceFailToast(pointsLabel, colors, ttlMs) {
      const options = arguments.length > 3 ? arguments[3] : null;
      const now = nowMs();
      state.sequenceToast = {
        visible: true,
        title: String(pointsLabel || "+RP"),
        subtitle: "",
        colorKey: null,
        colors: Array.isArray(colors) ? colors.slice() : [],
        cards: Array.isArray(options?.cards) ? options.cards.slice() : [],
        rp: Number.isFinite(options?.rp) ? options.rp : null,
        shownAtMs: now,
        ttlMs: Math.max(0, Number(ttlMs || 0)),
        mode: "fail"
      };
    }

    function showSequenceDsToast(colorKey, ttlMs) {
      const options = arguments.length > 2 ? arguments[2] : null;
      const now = nowMs();
      state.sequenceToast = {
        visible: true,
        title: "",
        subtitle: "",
        colorKey: colorKey || null,
        colors: [],
        cards: Array.isArray(options?.cards) ? options.cards.slice() : [],
        rp: Number.isFinite(options?.rp) ? options.rp : null,
        shownAtMs: now,
        ttlMs: Math.max(0, Number(ttlMs || 0)),
        mode: "ds"
      };
    }

    function startSequenceSession() {
      const seq = state.sequence;
      seq.active = true;
      seq.mode = "IDLE";
      seq.track = null;
      seq.stepIndex = 0;
      seq.A = null;
      seq.B = null;
      seq.C = null;
      seq.D = null;
      seq.currentColor = null;
      seq.hits = 0;
      seq.phase = null;
      seq.opened = false;
      seq.colorsClosed = [];
      seq.chainIndex = 0;
      seq.chainPattern = [];
      seq.baseColor = null;
      seq.rpStart = Math.floor(Number(state.world?.score || 0));
      seq.committedKeys = new Set();
      seq.earned = [];
      seq.lastHitSnapshot = null;
      if (!Array.isArray(seq.tempCards)) seq.tempCards = [];
      seq.tempCards.length = 0;
      seq.commitDuplicateLogged = false;
      if (state.world) {
        state.world.cardsTemp = seq.tempCards;
      }
    }

    function pushSequenceReward(World, seq, payload, { setPending = false } = {}) {
      if (!payload) return null;
      if (!Array.isArray(seq.tempCards)) seq.tempCards = [];
      const entity = createCardEntity(payload);
      if (!entity) return null;
      const rewardKey = getRewardDedupeKey(entity);
      if (rewardKey) {
        const existing = seq.tempCards.find((card) => getRewardDedupeKey(card) === rewardKey);
        if (existing) {
          if (setPending) {
            const now = nowMs();
            World.pendingCard = existing;
            World.pendingCardUntilMs = now + CardRegistry.TIMINGS.pendingCardTtlMs;
          }
          return existing;
        }
      }
      seq.tempCards.push(entity);
      if (setPending) {
        const now = nowMs();
        World.pendingCard = entity;
        World.pendingCardUntilMs = now + CardRegistry.TIMINGS.pendingCardTtlMs;
      }
      return entity;
    }

    function awardSequenceStep(World, seq) {
      if (!World) return null;
      const level = seq.stepIndex;
      const baseColor = normalizePack01Color(seq.A || seq.baseColor);
      if (!baseColor) return null;
      let reward = null;
      if (level === 1) {
        reward = pushSequenceReward(World, seq, { kind: "R1", tier: "DR", colorA: baseColor }, { setPending: true });
      } else if (seq.track === "R") {
        if (level === 2) reward = pushSequenceReward(World, seq, { kind: "R2", tier: "DR", colorA: seq.A, colorB: seq.B });
        else if (level === 3) reward = pushSequenceReward(World, seq, { kind: "R3", tier: "DR", colorA: seq.A, colorB: seq.B, colorC: seq.C });
        else if (level === 4) reward = pushSequenceReward(World, seq, { kind: "R4", tier: "DR", colorA: seq.A, colorB: seq.B, colorC: seq.C, colorD: seq.D });
      } else if (seq.track === "A") {
        if (level === 2) reward = pushSequenceReward(World, seq, { kind: "R1", tier: "DR", colorA: baseColor });
        else if (level === 3) reward = pushSequenceReward(World, seq, { kind: "DS", tier: "DR", colorA: baseColor });
      }
      if (reward) {
        commitSequenceNewRewards(World, seq, [reward]);
        seq.earned.push(reward);
      }
      return reward;
    }

    function closeSequenceStep(World) {
      const seq = state.sequence;
      const colorKey = seq.currentColor;
      seq.stepIndex += 1;
      if (seq.stepIndex === 1 && colorKey) { seq.A = colorKey; seq.baseColor = colorKey; }
      if (seq.track === "R") {
        if (seq.stepIndex === 2 && colorKey) seq.B = seq.B || colorKey;
        else if (seq.stepIndex === 3 && colorKey) seq.C = seq.C || colorKey;
        else if (seq.stepIndex === 4 && colorKey) seq.D = seq.D || colorKey;
      } else if (seq.track === "A" && colorKey) {
        if (!seq.A) seq.A = colorKey;
        if (!seq.baseColor) seq.baseColor = colorKey;
      }
      const rewardCard = awardSequenceStep(World, seq);
      handleSequenceStepClosed(World, rewardCard);
    }

    function handleSequenceStepClosed(World, rewardCard) {
      const seq = state.sequence;
      const colorKey = seq.currentColor;
      if (colorKey) seq.colorsClosed.push(colorKey);
      if (!seq.baseColor && colorKey) seq.baseColor = colorKey;
      const level = seq.stepIndex;
      const colors = seq.colorsClosed.slice(0, level);
      const normalizedColors = colors.map((color) => normalizePack01Color(color)).filter(Boolean);
      const overlayMode = seq.track === "A" ? "A" : "R";
      const maxLevel = seq.track === "A" ? 3 : 4;
      const isTerminal = seq.track && level >= maxLevel;
      if (!isTerminal) showSequenceOverlay(level, colors, colorKey, CardRegistry.TIMINGS.sequenceOverlayTtlMs, { mode: overlayMode });
      if (World && colorKey) {
        const flashColors = normalizedColors.slice(0, level);
        flashColors.startedAtMs = nowMs();
        flashColors.durationMs = 450;
        World.sequenceFlashColors = flashColors;
      }
      if (level >= 4 && seq.chainPattern.length === 0) seq.chainPattern = seq.colorsClosed.slice(0, 4);
      if (seq.chainPattern.length && seq.chainIndex === 1) {
        const expected = seq.chainPattern;
        const mismatch = seq.colorsClosed.some((closedColor, idx) => closedColor !== expected[idx]);
        if (mismatch || level >= 4) { seq.chainIndex = 0; seq.chainPattern = []; }
      }
      seq.currentColor = null; seq.hits = 0; seq.opened = false; seq.phase = null; seq.mode = "IDLE";
      if (World) World.sequencePulseColors = [];
      if (isTerminal) finalizeSequence(World, level, colors, rewardCard);
    }

    function failSequence(World) {
      const seq = state.sequence;
      const completedColors = seq.colorsClosed.slice();
      const awardedCards = Array.isArray(seq.tempCards) ? seq.tempCards.slice() : [];
      const rpDelta = Math.floor(Number(World?.score || 0)) - Math.floor(Number(seq.rpStart || 0));
      rewardSequenceFail(World);
      if (completedColors.length) showSequenceFailToast(`${rpDelta} RP`, completedColors, CardRegistry.TIMINGS.sequenceFailToastTtlMs, { cards: awardedCards, rp: rpDelta });
      resetSequenceState();
    }

    function finalizeSequence(World, level, colors, rewardCard) {
      const seq = state.sequence;
      if (!World) { resetSequenceState(); return; }
      const cappedLevel = Math.max(1, Math.min(4, Number(level || 1)));
      const seqColors = (Array.isArray(colors) ? colors : []).map(normalizePack01Color).filter(Boolean);
      const label = seq.track === "A" ? (["A", "AA", "AAA"][cappedLevel - 1] || `A${cappedLevel}`) : `R${cappedLevel}`;
      const rpDelta = Math.floor(Number(World?.score || 0)) - Math.floor(Number(seq.rpStart || 0));
      const awardedCards = rewardCard ? [rewardCard] : [];
      if (seq.track === "A" && cappedLevel >= 3) {
        if (Array.isArray(seq.earned) && seq.earned.length) {
          for (let i = World.cardsPool.length - 1; i >= 0; i--) {
            const poolCard = World.cardsPool[i];
            const shouldRemove = seq.earned.some((earnedCard) => earnedCard === poolCard && String(poolCard?.kind || poolCard?.type || "").toUpperCase() !== "DS");
            if (shouldRemove) World.cardsPool.splice(i, 1);
          }
        }
        recomputeTotalCards(World);
        showSequenceDsToast(seq.baseColor || seq.A, CardRegistry.TIMINGS.sequenceToastTtlMs, { cards: awardedCards, rp: rpDelta });
        World.pendingCard = null;
        World.pendingCardUntilMs = 0;
        if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
        if (Array.isArray(seq.earned)) seq.earned.length = 0;
      } else {
        showSequenceToast(`Kolekcja ${label}`, `Sekwencja zamknięta. ${rpDelta} RP`, seqColors[cappedLevel - 1] || seqColors[0], CardRegistry.TIMINGS.sequenceToastTtlMs, { cards: awardedCards, rp: rpDelta });
      }
      if (seq.tempCards) seq.tempCards.length = 0;
      if (World.cardsTemp) World.cardsTemp.length = 0;
      resetSequenceState();
    }

    function onHitColor(colorKey) {
      const World = state.world;
      const normalized = normalizePack01Color(colorKey);
      const debugSeq = typeof window !== "undefined" && window.HC && window.HC.debugSeq;
      const logIgnored = (reason, details) => {
        if (!debugSeq) return;
        if (details) { console.log("[SEQ_HIT_IGNORED]", reason, details); return; }
        console.log("[SEQ_HIT_IGNORED]", reason);
      };
      if (!World || !normalized) {
        logIgnored("invalid-world-or-color", { colorKey, normalized });
        traceSeqHit("ignored", normalized, { reason: "invalid-world-or-color" });
        return { action: "ignored", snapshot: null };
      }
      const seq = state.sequence;
      if (!seq.active) startSequenceSession();
      if (seq.mode === "IDLE") {
        const gate = canStartStepWithColor(seq, normalized);
        if (!gate.ok) {
          traceSeqHit("fail", normalized, { reason: gate.reason });
          const snapshot = getHitSnapshot(seq);
          seq.lastHitSnapshot = snapshot;
          failSequence(World);
          return { action: "fail", snapshot };
        }
        if (seq.chainPattern.length) {
          const expectedStart = normalizePack01Color(seq.chainPattern[0]);
          if (expectedStart && normalized === expectedStart) seq.chainIndex = 1;
          else { seq.chainIndex = 0; seq.chainPattern = []; }
        }
        applyDirectionSelection(seq, normalized);
        seq.currentColor = normalized; seq.hits = 1; seq.opened = false; seq.mode = "IN_STEP";
        setSequencePhase(seq, "DIR");
        addScoreToWorld(World, getSequenceMultiplier(seq.stepIndex + 1, seq.chainIndex));
        traceSeqHit("dir", normalized);
        const snapshot = getHitSnapshot(seq);
        seq.lastHitSnapshot = snapshot;
        return { action: "dir", snapshot };
      }
      if (normalized !== seq.currentColor) {
        traceSeqHit("fail", normalized, { reason: "color-mismatch" });
        const snapshot = getHitSnapshot(seq);
        seq.lastHitSnapshot = snapshot;
        failSequence(World);
        return { action: "fail", snapshot };
      }
      seq.hits += 1;
      addScoreToWorld(World, getSequenceMultiplier(seq.stepIndex + 1, seq.chainIndex));
      if (seq.hits === 2) {
        setSequencePhase(seq, "OPEN");
        const nextLevel = seq.stepIndex + 1;
        const isATrackStep = seq.track === "A" || (seq.track === null && seq.stepIndex === 1 && normalizePack01Color(seq.A) === normalizePack01Color(seq.currentColor));
        const label = isATrackStep ? (["A", "AA", "AAA"][nextLevel - 1] || `A${nextLevel}`) : `R${nextLevel}`;
        showSequenceToast(`Sekwencja ${label} rozpoczęta`, "", seq.currentColor, CardRegistry.TIMINGS.sequenceToastTtlMs);
        if (World) {
          const sequenceColors = new Set();
          const closed = Array.isArray(seq.colorsClosed) ? seq.colorsClosed : [];
          closed.forEach((color) => { const n = normalizePack01Color(color); if (n) sequenceColors.add(n); });
          const current = normalizePack01Color(seq.currentColor);
          if (current) sequenceColors.add(current);
          World.sequencePulseColors = [...sequenceColors];
        }
        traceSeqHit("open", normalized);
        const snapshot = getHitSnapshot(seq);
        seq.lastHitSnapshot = snapshot;
        return { action: "open", snapshot };
      }
      if (seq.hits === 3) {
        setSequencePhase(seq, "CLOSE");
        traceSeqHit("close", normalized);
        const snapshot = getHitSnapshot(seq);
        seq.lastHitSnapshot = snapshot;
        closeSequenceStep(World);
        return { action: "close", snapshot };
      }
      return { action: "noop", snapshot: getHitSnapshot(seq) };
    }

    function setPendingChoiceCard(World, payload) {
      if (!World) return null;
      ensureCardsPool(World);
      const entity = createCardEntity(payload);
      if (!entity) return null;
      const now = nowMs();
      World.pendingCard = entity;
      World.pendingCardUntilMs = now + CardRegistry.TIMINGS.pendingCardTtlMs;
      return entity;
    }

    function flushPendingCard(World, nowMsValue) {
      if (!World || !World.pendingCard) return false;
      const now = Number(nowMsValue);
      if (!Number.isFinite(now)) return false;
      if (now < (World.pendingCardUntilMs || 0)) return false;
      World.pendingCard = null;
      World.pendingCardUntilMs = 0;
      return true;
    }

    function consumePendingCard(World, { kind, tier, colors } = {}, nowMsValue) {
      if (!World) return false;
      ensureCardsPool(World);
      const pending = World.pendingCard;
      const now = Number(nowMsValue);
      if (!pending || !Number.isFinite(now) || now > (World.pendingCardUntilMs || 0)) return false;
      if (!cardMatches(pending, kind, colors, tier)) return false;
      World.pendingCard = null;
      World.pendingCardUntilMs = 0;
      if (state.sequence && Array.isArray(state.sequence.tempCards)) {
        const idx = state.sequence.tempCards.findIndex((card) => cardMatches(card, kind, colors, tier));
        if (idx >= 0) state.sequence.tempCards.splice(idx, 1);
      }
      if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
      return true;
    }

    function onRunActivateR1({ baseDurationMs, colorKey, tierKey, keepSequence } = {}) {
      const World = state.world;
      if (!World) return false;
      const t = nowMs();
      const normalizedColor = normalizePack01Color(colorKey);
      const tier = String(tierKey || "DR");
      if (!consumePendingCard(World, { kind: "R1", tier, colors: [normalizedColor] }, t)) return false;
      if (keepSequence) {
        if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
      } else {
        resetSequenceState();
      }
      applyWorldSlotEffectsOnRunActivation(World, t, [normalizedColor], "R1");
      const bonusMs = getFormaTimeBonusMs(World);
      const durationMs = computeActivationDurationMs(baseDurationMs, bonusMs, "R1");
      if (normalizedColor) {
        startRunTimerForColor(World, normalizedColor, durationMs, t, 1);
        startR1TimerForColor(World, normalizedColor, durationMs, t);
      }
      showSequenceToast("R1 DR aktywowany", "Sekwencja przerwana.", normalizedColor, CardRegistry.TIMINGS.sequenceToastTtlMs);
      return startFormaEffect(World, t, "R1", baseDurationMs);
    }

    function activateSequenceR1(colorKey, options = {}) {
      const normalized = normalizePack01Color(colorKey);
      if (!normalized) return false;
      return onRunActivateR1({
        baseDurationMs: config.pack01TargetDurationMs,
        colorKey: normalized,
        tierKey: "DR",
        keepSequence: Boolean(options.keepSequence)
      });
    }

    function cashOutSequence(level, colors) {
      const World = state.world;
      const seq = state.sequence;
      if (!World || !Array.isArray(seq.tempCards) || !seq.tempCards.length) return false;
      ensureCardsPool(World);
      const cappedLevel = Math.max(1, Math.min(4, Number(level || 1)));
      const cardsAwarded = seq.tempCards.filter((card) => card && !card._committed);
      commitSequenceNewRewards(World, seq, seq.tempCards);
      const seqColors = (Array.isArray(colors) ? colors : []).map(normalizePack01Color).filter(Boolean);
      const label = seq.track === "A" ? (["A", "AA", "AAA"][cappedLevel - 1] || `A${cappedLevel}`) : `R${cappedLevel}`;
      const rpDelta = Math.floor(Number(World?.score || 0)) - Math.floor(Number(seq.rpStart || 0));
      if (seq.track === "A" && cappedLevel >= 3) {
        const dsCards = seq.tempCards.filter((card) => String(card?.kind || card?.type || "").toUpperCase() === "DS");
        showSequenceDsToast(seq.baseColor || seq.A, CardRegistry.TIMINGS.sequenceToastTtlMs, { cards: dsCards, rp: rpDelta });
        if (World.pendingCard && String(World.pendingCard?.kind || World.pendingCard?.type || "").toUpperCase() === "R1") {
          World.pendingCard = null;
          World.pendingCardUntilMs = 0;
        }
      } else {
        showSequenceToast(`Kolekcja ${label}`, `Sekwencja zamknięta. ${rpDelta} RP`, seqColors[cappedLevel - 1] || seqColors[0], CardRegistry.TIMINGS.sequenceToastTtlMs, { cards: cardsAwarded, rp: rpDelta });
      }
      seq.tempCards.length = 0;
      if (World.cardsTemp) World.cardsTemp.length = 0;
      resetSequenceState();
      return true;
    }

    return {
      traceSeqHit,
      showSequenceOverlay,
      showSequenceToast,
      showSequenceFailToast,
      startSequenceSession,
      awardSequenceStep,
      closeSequenceStep,
      failSequence,
      finalizeSequence,
      onHitColor,
      setPendingChoiceCard,
      flushPendingCard,
      consumePendingCard,
      activateSequenceR1,
      cashOutSequence,
      onRunActivateR1,
    };
  }

  global.CardSequences = global.CardSequences || { create };
})(typeof window !== "undefined" ? window : globalThis);
