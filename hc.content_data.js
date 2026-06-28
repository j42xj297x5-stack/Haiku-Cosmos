(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "content-data-v0.1";
  const DATA_ROOT = "data";
  const warned = new Set();
  const state = {
    loaded: false,
    loading: null,
    elementsById: new Map(),
    haikuById: new Map(),
    haikuByEntityId: new Map(),
    effectsById: new Map()
  };

  function warnOnce(key, message, details) {
    if (warned.has(key)) return;
    warned.add(key);
    if (details === undefined) console.warn(`[HC.Content] ${message}`);
    else console.warn(`[HC.Content] ${message}`, details);
  }

  function publicPath(path) {
    const helper = root.HC?.publicPath || root.HC?.publicAssetPath;
    if (typeof helper === "function") return helper(path);
    warnOnce("missing-public-path", "HC.publicPath unavailable; falling back to relative path.");
    return String(path || "").replace(/^\/+/, "").replace(/^public\//, "");
  }

  async function fetchJson(logicalPath) {
    const url = publicPath(logicalPath);
    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) {
        warnOnce(`fetch:${logicalPath}`, `Missing content data file: ${logicalPath}`, { status: response.status, url });
        return null;
      }
      return await response.json();
    } catch (error) {
      warnOnce(`fetch:${logicalPath}`, `Could not load content data file: ${logicalPath}`, error);
      return null;
    }
  }

  function itemsFromPayload(payload, logicalPath) {
    if (!payload || typeof payload !== "object") {
      warnOnce(`format:${logicalPath}`, `Invalid content data payload: ${logicalPath}`);
      return [];
    }
    if (!Array.isArray(payload.items)) {
      warnOnce(`items:${logicalPath}`, `Content data file has no items array: ${logicalPath}`);
      return [];
    }
    return payload.items.filter((item) => {
      if (!item || typeof item !== "object" || !item.id) {
        warnOnce(`item-format:${logicalPath}`, `Content data file contains invalid item: ${logicalPath}`, item);
        return false;
      }
      return true;
    });
  }

  function indexById(map, item, namespace) {
    const id = String(item.id);
    if (map.has(id)) warnOnce(`duplicate:${namespace}:${id}`, `Duplicate ${namespace} id: ${id}`);
    map.set(id, item);
  }

  async function loadRegistry(folder, registryName, targetMap, onItem) {
    const registryPath = `${DATA_ROOT}/${folder}/${registryName}`;
    const registry = await fetchJson(registryPath);
    if (!registry || !Array.isArray(registry.files)) {
      warnOnce(`registry:${folder}`, `Invalid or missing content registry: ${registryPath}`);
      return;
    }
    for (const file of registry.files) {
      const fileName = String(file || "").trim();
      if (!fileName) continue;
      const logicalPath = `${DATA_ROOT}/${folder}/${fileName}`;
      const payload = await fetchJson(logicalPath);
      for (const item of itemsFromPayload(payload, logicalPath)) {
        indexById(targetMap, item, folder);
        if (typeof onItem === "function") onItem(item);
      }
    }
  }

  async function load(options = {}) {
    if (state.loading && options.force !== true) return state.loading;
    if (state.loaded && options.force !== true) return Promise.resolve(api);
    state.loading = (async () => {
      state.elementsById.clear();
      state.haikuById.clear();
      state.haikuByEntityId.clear();
      state.effectsById.clear();
      await loadRegistry("haiku", "haiku.registry.json", state.haikuById, (item) => {
        if (item.entityId) {
          const entityId = String(item.entityId);
          if (state.haikuByEntityId.has(entityId)) warnOnce(`duplicate:haiku-entity:${entityId}`, `Duplicate haiku entityId: ${entityId}`);
          state.haikuByEntityId.set(entityId, item);
        }
      });
      await loadRegistry("elements", "elements.registry.json", state.elementsById);
      await loadRegistry("mechanics", "effects.registry.json", state.effectsById);
      state.loaded = true;
      return api;
    })();
    return state.loading;
  }

  function getElement(id) {
    if (!id) return null;
    return state.elementsById.get(String(id)) || null;
  }

  function getHaiku(id) {
    if (!id) return null;
    return state.haikuById.get(String(id)) || null;
  }

  function getHaikuForElement(elementId) {
    if (!elementId) return null;
    const id = String(elementId);
    const element = getElement(id);
    const haiku = (element?.haikuId ? getHaiku(element.haikuId) : null) || state.haikuByEntityId.get(id) || null;
    if (!haiku) warnOnce(`missing-haiku:${id}`, `Missing haiku for element: ${id}`);
    return haiku;
  }

  function getEffectsForElement(elementId) {
    const effectIds = getElement(elementId)?.mechanics?.effectIds;
    if (!Array.isArray(effectIds)) return [];
    return effectIds.map((id) => state.effectsById.get(String(id))).filter(Boolean);
  }

  const api = {
    VERSION,
    load,
    getElement,
    getHaiku,
    getHaikuForElement,
    getEffectsForElement,
    get loaded() { return state.loaded; },
    get promise() { return state.loading; },
    _state: state
  };

  root.HC.Content = api;
  api.load();
})(window);
