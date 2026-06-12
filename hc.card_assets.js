// Haiku Cosmos card asset resolver for base-aware public SVG/PNG URLs.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const COLOR_ORDER = Object.freeze(["RED", "YELLOW", "GREEN", "BLUE"]);
  const VALID_TIERS = Object.freeze(["DR", "SDR", "PDR"]);
  const failedAssetUrls = new Set();
  const warnedKeys = new Set();
  const CARD_PNG_ASSET_PATHS = Object.freeze({
    "R1:RED:DR": "png/cards/card_r1_red_dr.png",
    "R1:RED:SDR": "png/cards/card_r1_red_sdr.png",
    "R1:RED:PDR": "png/cards/card_r1_red_pdr.png"
  });

  function warnOnce(key, message, details) {
    if (warnedKeys.has(key)) return;
    warnedKeys.add(key);
    console.warn(`[HC.CardAssets] ${message}`, details);
  }

  function getIdentity(card) {
    return `${card?.id || ""} ${card?.key || ""} ${card?.cardKey || ""}`.toUpperCase();
  }

  function normalizeKind(card) {
    const identity = getIdentity(card);
    const explicitKind = String(card?.kind || card?.type || "").toUpperCase();
    if (["R1", "R2", "R3"].includes(explicitKind)) return explicitKind;
    if (/(?:CARD|PRG)_R3(?:_|\b)|\bR3\b/.test(identity)) return "R3";
    if (/(?:CARD|PRG)_R2(?:_|\b)|\bR2\b/.test(identity)) return "R2";
    if (/(?:CARD|PRG)_R1(?:_|\b)|\bR1\b/.test(identity)) return "R1";
    return explicitKind;
  }

  function normalizeTier(card) {
    const identity = getIdentity(card);
    const explicitTier = String(card?.tier || card?.fromTier || "").toUpperCase();
    if (VALID_TIERS.includes(explicitTier)) return explicitTier;
    if (/(?:^|_)PDR(?:_|$)/.test(identity)) return "PDR";
    if (/(?:^|_)SDR(?:_|$)/.test(identity)) return "SDR";
    if (/(?:^|_)DR(?:_|$)/.test(identity)) return "DR";
    return "DR";
  }

  function collectColors(card) {
    const identity = getIdentity(card);
    const explicitColors = Array.isArray(card?.colors)
      ? card.colors
      : [card?.color, card?.colorA, card?.colorB, card?.colorC, card?.colorD];
    const normalized = explicitColors
      .filter(Boolean)
      .map((color) => String(color).toUpperCase())
      .filter((color) => COLOR_ORDER.includes(color));
    for (const color of COLOR_ORDER) {
      if (identity.includes(color) && !normalized.includes(color)) normalized.push(color);
    }
    return [...new Set(normalized)].sort((a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b));
  }

  function getCardAssetKey(card) {
    const kind = normalizeKind(card);
    const tier = normalizeTier(card);
    const colors = collectColors(card);
    if (kind === "R1" && colors.length >= 1) return `${kind}:${colors[0]}:${tier}`;
    if (kind === "R2" && colors.length >= 2) return `${kind}:${colors[0]}_${colors[1]}:${tier}`;
    if (kind === "R3" && colors.length >= 3) return `${kind}:${colors[0]}_${colors[1]}_${colors[2]}:${tier}`;
    return null;
  }

  function getCardSvgPath(card) {
    const kind = normalizeKind(card);
    const tier = normalizeTier(card).toLowerCase();
    const colors = collectColors(card);
    if (kind === "R1" && colors.length >= 1) {
      return `svg/card_r1_${colors[0].toLowerCase()}_${tier}.svg`;
    }
    if (kind === "R2" && colors.length >= 2) {
      return `svg/card_r2_${colors.slice(0, 2).map((color) => color.toLowerCase()).join("_")}_${tier}.svg`;
    }
    if (kind === "R3" && colors.length >= 3) {
      return `svg/card_r3_${colors.slice(0, 3).map((color) => color.toLowerCase()).join("_")}_${tier}.svg`;
    }
    return null;
  }

  function resolvePublicAsset(path, format) {
    if (!path) return null;
    const helper = root.HC.publicAssetPath || root.HC.publicPath;
    if (typeof helper !== "function") {
      warnOnce("missing-public-path", "publicPath helper unavailable; using procedural card fallback", { path });
      return null;
    }
    const url = helper(path);
    if (failedAssetUrls.has(url)) return null;
    return { path, url, format };
  }

  function resolveCardSvgAsset(card) {
    return resolvePublicAsset(getCardSvgPath(card), "svg");
  }

  function resolveCardPngAsset(card) {
    const key = getCardAssetKey(card);
    return resolvePublicAsset(key ? CARD_PNG_ASSET_PATHS[key] : null, "png");
  }

  function resolveCardAsset(card, options = {}) {
    const context = options.context === "detail" ? "detail" : "card";
    const asset = context === "detail"
      ? (resolveCardPngAsset(card) || resolveCardSvgAsset(card))
      : resolveCardSvgAsset(card);
    const kind = normalizeKind(card);
    if (!asset && (kind === "R2" || kind === "R3")) {
      warnOnce(`unresolved:${getCardAssetKey(card) || getIdentity(card)}`, `${kind} card asset could not be resolved; using procedural fallback`, {
        cardId: card?.id || card?.key || card?.cardKey || null,
        tier: card?.tier || card?.fromTier || null,
        colors: collectColors(card),
        context
      });
    }
    return asset;
  }

  function markAssetFailed(assetOrUrl, card) {
    const url = typeof assetOrUrl === "string" ? assetOrUrl : assetOrUrl?.url;
    if (!url) return;
    failedAssetUrls.add(url);
    warnOnce(`load-failed:${url}`, "card asset failed to load; using the next available fallback", {
      url,
      cardId: card?.id || card?.key || card?.cardKey || null
    });
  }

  root.HC.CardAssets = Object.freeze({
    COLOR_ORDER,
    normalizeKind,
    normalizeTier,
    collectColors,
    getCardAssetKey,
    getCardSvgPath,
    resolveCardAsset,
    resolveCardSvgAsset,
    resolveCardPngAsset,
    markAssetFailed,
    hasAssetFailed: (url) => failedAssetUrls.has(url)
  });
})(window);
