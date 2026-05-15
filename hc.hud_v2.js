(function initHudV2(globalRoot) {
  const root = globalRoot || (typeof window !== 'undefined' ? window : globalThis);
  const HC = (root.HC = root.HC || {});

  const COLOR_ORDER = ['red', 'yellow', 'green', 'blue'];
  const COLOR_LABELS = {
    red: 'Czerwony',
    yellow: 'Żółty',
    green: 'Zielony',
    blue: 'Niebieski'
  };

  function normalizeColorKey(value) {
    const key = String(value || '').toLowerCase();
    return COLOR_ORDER.includes(key) ? key : null;
  }

  function getCardCountFromPool(cardsPool, kind, colorKey) {
    if (!Array.isArray(cardsPool) || !kind || !colorKey) return 0;
    let total = 0;
    for (const card of cardsPool) {
      if (!card || card.inSlotKey) continue;
      const cardKind = String(card.kind || card.type || '').toUpperCase();
      if (cardKind !== String(kind).toUpperCase()) continue;
      if (normalizeColorKey(card.colorA) === colorKey) total += 1;
    }
    return total;
  }

  function getStageLabel(sequence) {
    const raw = String(sequence?.stage || 'IDLE').toUpperCase();
    const allowed = ['IDLE', 'R1', 'AA', 'AAA', 'R2', 'R3', 'R4'];
    return allowed.includes(raw) ? raw : 'IDLE';
  }

  function buildViewModel(World, CardEngine, nowMs) {
    const warnings = [];
    const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const runtimeWorld = World && typeof World === 'object' ? World : null;
    const runtimeCardEngine = CardEngine && typeof CardEngine === 'object' ? CardEngine : null;

    if (!runtimeWorld) warnings.push('HUDV2_VM_NO_WORLD');
    if (!runtimeCardEngine) warnings.push('HUDV2_VM_NO_CARD_ENGINE');

    const cardsPool = Array.isArray(runtimeWorld?.cardsPool) ? runtimeWorld.cardsPool : [];
    if (!Array.isArray(runtimeWorld?.cardsPool)) warnings.push('HUDV2_VM_NO_CARDS_POOL_FALLBACK');

    const sequence = runtimeCardEngine?.state?.sequence || null;
    const pendingCard = runtimeWorld?.pendingCard || null;
    const pendingUntilMs = Number(runtimeWorld?.pendingCardUntilMs || 0);
    const activeColor = normalizeColorKey(sequence?.currentColor || sequence?.expectedColor);
    const pendingColor = normalizeColorKey(pendingCard?.colorA || (Array.isArray(pendingCard?.colors) ? pendingCard.colors[0] : null));
    const pendingKind = String(pendingCard?.kind || pendingCard?.type || '').toUpperCase();
    const pendingTier = String(pendingCard?.id || '');

    const stageLabel = getStageLabel(sequence);
    const sequencePath = sequence?.track === 'A' ? 'A_LOOP' : (sequence?.track === 'R' ? 'R_TRACK' : 'IDLE');

    const sequenceRows = COLOR_ORDER.map((colorKey) => {
      const r1Count = getCardCountFromPool(cardsPool, 'R1', colorKey);
      const hasR1Card = r1Count > 0;
      const timerUntil = Number(runtimeWorld?.runColorTimers?.[colorKey] || 0);
      const timerDuration = Number(runtimeWorld?.runColorDurations?.[colorKey] || 0);
      const timerLeft = Math.max(0, timerUntil - safeNowMs);
      const timerRatio = timerDuration > 0 ? Math.max(0, Math.min(1, timerLeft / timerDuration)) : 0;
      const pulseState = Array.isArray(runtimeWorld?.sequencePulseColors) && runtimeWorld.sequencePulseColors.includes(colorKey) ? 'pulse' : 'none';
      const flashState = Array.isArray(runtimeWorld?.sequenceFlashColors) && runtimeWorld.sequenceFlashColors.includes(colorKey) ? 'flash' : 'none';
      const isCollecting = activeColor === colorKey && Number(sequence?.hits || 0) > 0;
      const hitProgress = isCollecting ? Math.max(0, Math.min(3, Number(sequence?.hits || 0))) : 0;
      const canCollectCard = pendingColor === colorKey && pendingUntilMs > safeNowMs && pendingKind !== 'R1';
      const canActivateR1 = hasR1Card && pendingColor === colorKey && pendingUntilMs > safeNowMs && pendingKind === 'R1';
      const diamondState = canCollectCard
        ? 'ready'
        : (timerRatio > 0 ? 'active' : (hasR1Card ? 'collecting' : 'empty'));

      return {
        colorKey,
        colorLabel: COLOR_LABELS[colorKey],
        hasR1Card,
        r1Count,
        isCollecting,
        hitProgress,
        stageLabel,
        diamondState,
        canActivateR1,
        canCollectCard,
        collectCardId: canCollectCard ? String(pendingCard?.id || '') : null,
        collectTier: canCollectCard ? pendingKind : null,
        pendingDecisionUntilMs: pendingUntilMs > safeNowMs ? pendingUntilMs : null,
        timerRatio,
        pulseState,
        flashState,
        debug: {
          pendingKind,
          pendingColor,
          timerUntil
        }
      };
    });

    if (pendingCard && pendingKind !== 'R1' && !['R2', 'R3', 'R4', 'AA'].includes(pendingKind)) {
      warnings.push('HUDV2_VM_PENDING_TIER_UNMAPPED');
    }

    const pendingCollect = pendingCard && pendingUntilMs > safeNowMs && pendingKind !== 'R1'
      ? {
          cardId: String(pendingCard.id || ''),
          kind: pendingKind,
          colorKey: pendingColor,
          untilMs: pendingUntilMs
        }
      : null;

    const pendingActivation = pendingCard && pendingUntilMs > safeNowMs && pendingKind === 'R1'
      ? {
          colorKey: pendingColor,
          cardId: String(pendingCard.id || ''),
          untilMs: pendingUntilMs
        }
      : null;

    return {
      rp: Number(runtimeWorld?.score || 0),
      sequenceRows,
      activeColor,
      sequenceLevel: Number(sequence?.stepIndex || 0),
      sequencePath,
      pendingActivation,
      pendingCollect,
      specialSlots: [
        { state: 'empty' },
        { state: 'locked' },
        { state: 'unavailable' }
      ],
      timers: {
        nowMs: safeNowMs,
        runActiveUntilMs: Number(runtimeWorld?.runWorldActiveUntilMs || 0)
      },
      warnings,
      debug: {
        stageLabel,
        pendingKind,
        hasSequence: Boolean(sequence)
      }
    };
  }

  HC.HUDV2 = HC.HUDV2 || {};
  HC.HUDV2.buildViewModel = buildViewModel;
  HC.HUDV2.probe = function probe(nowMs) {
    const vm = buildViewModel(root.World, root.CardEngine, nowMs);
    HC.HUDV2.lastViewModel = vm;
    return vm;
  };
})(typeof window !== 'undefined' ? window : globalThis);
