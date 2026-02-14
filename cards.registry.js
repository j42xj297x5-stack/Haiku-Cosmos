console.log("[HC] cards.registry.js loaded");

var CardRegistry = (typeof window !== "undefined" && window.CardRegistry)
  ? window.CardRegistry
  : {
    PACK01_COLOR_HEX: {
      red: "#FF5E5E",
      yellow: "#FFD66B",
      green: "#7DFF9A",
      blue: "#7BCBFF"
    },
    PACK01_COLOR_LABEL: {
      red: "Czerwony",
      yellow: "Żółty",
      green: "Zielony",
      blue: "Niebieski"
    },
    SUB_META_COLORS: ["red", "yellow", "green", "blue"],
    CARD_KEY_ORDER: ["red", "yellow", "green", "blue"],
    CARD_KEY_LETTER: {
      red: "A",
      yellow: "B",
      green: "C",
      blue: "D"
    },
    SUB_META_TIERS: ["DR", "sDR", "pDR"],
    SUB_META_R2_PAIRS: [
      ["red", "yellow"],
      ["red", "green"],
      ["red", "blue"],
      ["yellow", "green"],
      ["yellow", "blue"],
      ["green", "blue"]
    ],
    TIMINGS: {
      pendingCardTtlMs: 3000,
      sequenceOverlayTtlMs: 3000,
      sequenceToastTtlMs: 1500,
      sequenceFailToastTtlMs: 2000
    }
  };

if (typeof window !== "undefined") {
  window.CardRegistry = window.CardRegistry || CardRegistry;
}
