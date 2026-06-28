#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const dataRoot = path.join(repoRoot, "public", "data");
const VALID_STATUSES = new Set(["draft", "review", "approved", "deprecated", "legacy"]);
const ACTIVE_STATUSES = new Set(["draft", "review", "approved"]);
const CARD_COLORS = ["RED", "YELLOW", "GREEN", "BLUE"];
const CARD_COLOR_SET = new Set(CARD_COLORS);
const RANK_COLOR_COUNTS = { R1: 1, R2: 2, R3: 3, R4: 4 };

const errors = [];
const warnings = [];

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function addError(filePath, message, id) {
  errors.push(`${rel(filePath)}${id ? ` [${id}]` : ""}: ${message}`);
}

function addWarning(filePath, message, id) {
  warnings.push(`${rel(filePath)}${id ? ` [${id}]` : ""}: ${message}`);
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

async function readJson(filePath) {
  if (!existsSync(filePath)) {
    addError(filePath, "file does not exist");
    return null;
  }
  try {
    const text = await readFile(filePath, "utf8");
    if (!text.trim()) {
      addError(filePath, "file is empty");
      return null;
    }
    const payload = JSON.parse(text);
    if (!isObject(payload)) addError(filePath, "top-level JSON must be an object");
    return payload;
  } catch (error) {
    addError(filePath, `invalid JSON: ${error.message}`);
    return null;
  }
}

async function readRegistry(folder, registryName) {
  const registryPath = path.join(dataRoot, folder, registryName);
  const registry = await readJson(registryPath);
  const files = [];
  if (!registry) return { registryPath, registry: null, files };
  if (registry.schemaVersion == null) addError(registryPath, "registry is missing schemaVersion");
  if (!Array.isArray(registry.files) || registry.files.length === 0) {
    addError(registryPath, "registry must contain a non-empty files array");
    return { registryPath, registry, files };
  }
  for (const rawFile of registry.files) {
    const file = String(rawFile || "").trim();
    if (!file || file.includes("..") || path.isAbsolute(file)) {
      addError(registryPath, `invalid registry file entry: ${JSON.stringify(rawFile)}`);
      continue;
    }
    const filePath = path.join(dataRoot, folder, file);
    if (!existsSync(filePath)) addError(registryPath, `registry points to missing file: ${file}`);
    files.push({ file, filePath, payload: await readJson(filePath) });
  }
  return { registryPath, registry, files };
}

function requireFields(filePath, item, fields, namespace) {
  for (const field of fields) {
    const value = field.split(".").reduce((acc, key) => acc?.[key], item);
    const missingArray = Array.isArray(value) && value.length === 0;
    if (value == null || value === "" || missingArray) addError(filePath, `${namespace} is missing required field '${field}'`, item?.id);
  }
}

function indexUnique(index, filePath, item, namespace) {
  if (!item?.id) return;
  if (index.has(item.id)) addError(filePath, `duplicate ${namespace} id also seen in ${rel(index.get(item.id).filePath)}`, item.id);
  else index.set(item.id, { item, filePath });
}

function validateItemsPayload(filePath, payload, requiredFields) {
  if (!payload) return [];
  if (payload.schemaVersion == null) addError(filePath, "file is missing schemaVersion");
  for (const field of requiredFields) {
    if (payload[field] == null) addError(filePath, `file is missing ${field}`);
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    addError(filePath, "file must contain a non-empty items array");
    return [];
  }
  return payload.items.filter((item, index) => {
    if (!isObject(item)) {
      addError(filePath, `items[${index}] must be an object`);
      return false;
    }
    return true;
  });
}

function validateCardColors(filePath, item) {
  if (item.type !== "card") return;
  if (!Array.isArray(item.colors)) return addError(filePath, "card colors must be an array", item.id);
  const invalid = item.colors.filter((color) => !CARD_COLOR_SET.has(color));
  if (invalid.length) addError(filePath, `invalid card colors: ${invalid.join(", ")}`, item.id);
  const expected = RANK_COLOR_COUNTS[item.rank];
  if (expected && item.colors.length !== expected) addError(filePath, `${item.rank} card must have exactly ${expected} color(s)`, item.id);
  if (item.rank === "R4" && !CARD_COLORS.every((color) => item.colors.includes(color))) addError(filePath, "R4 card must include all four colors", item.id);
}

async function main() {
  const haikuIndex = new Map();
  const elementIndex = new Map();
  const effectIndex = new Map();

  const effects = await readRegistry("mechanics", "effects.registry.json");
  const runtimeHandlers = new Set(Array.isArray(effects.registry?.runtimeHandlers) ? effects.registry.runtimeHandlers : []);
  if (!runtimeHandlers.size) addError(effects.registryPath, "effects registry must contain a non-empty runtimeHandlers array");
  for (const { filePath, payload } of effects.files) {
    for (const item of validateItemsPayload(filePath, payload, ["items"])) {
      requireFields(filePath, item, ["id", "label", "category", "runtimeHandler", "params", "editor"], "effect");
      if (item.runtimeHandler && !runtimeHandlers.has(item.runtimeHandler)) addError(filePath, `runtimeHandler is not registered: ${item.runtimeHandler}`, item.id);
      if (item.params != null && !isObject(item.params)) addError(filePath, "effect params must be an object", item.id);
      if (item.editor != null && !isObject(item.editor)) addError(filePath, "effect editor must be an object", item.id);
      indexUnique(effectIndex, filePath, item, "effect");
    }
  }

  const haiku = await readRegistry("haiku", "haiku.registry.json");
  const activeEntityIds = new Map();
  for (const { filePath, payload } of haiku.files) {
    for (const item of validateItemsPayload(filePath, payload, ["locale", "items"])) {
      requireFields(filePath, item, ["id", "entityId", "locale", "status", "type", "rank", "colors", "title", "lines"], "haiku");
      if (item.status && !VALID_STATUSES.has(item.status)) addError(filePath, `invalid status: ${item.status}`, item.id);
      if (item.type === "card" && (!Array.isArray(item.lines) || item.lines.length !== 3)) addError(filePath, "card haiku must have exactly 3 lines", item.id);
      if (item.colors != null && !Array.isArray(item.colors)) addError(filePath, "haiku colors must be an array", item.id);
      indexUnique(haikuIndex, filePath, item, "haiku");
      if (item.entityId && ACTIVE_STATUSES.has(item.status)) {
        const variantKey = `${item.entityId}|${item.locale || ""}|${item.rank || ""}`;
        if (activeEntityIds.has(variantKey)) addError(filePath, `duplicate active entityId variant also seen in ${rel(activeEntityIds.get(variantKey).filePath)}`, item.id);
        else activeEntityIds.set(variantKey, { item, filePath });
      }
    }
  }

  const elements = await readRegistry("elements", "elements.registry.json");
  for (const { filePath, payload } of elements.files) {
    for (const item of validateItemsPayload(filePath, payload, ["items"])) {
      requireFields(filePath, item, ["id", "type", "rank", "colors", "haikuId", "mechanics.effectIds"], "element");
      validateCardColors(filePath, item);
      if (item.haikuId && !haikuIndex.has(item.haikuId)) addError(filePath, `haikuId does not exist: ${item.haikuId}`, item.id);
      const effectIds = item.mechanics?.effectIds;
      if (!Array.isArray(effectIds)) addError(filePath, "mechanics.effectIds must be an array", item.id);
      else for (const effectId of effectIds) if (!effectIndex.has(effectId)) addError(filePath, `effectId does not exist: ${effectId}`, item.id);
      indexUnique(elementIndex, filePath, item, "element");
    }
  }

  console.log("CONTENT VALIDATION OK");
  console.log(`Checked: ${haikuIndex.size} haiku, ${elementIndex.size} elements, ${effectIndex.size} effects.`);
  console.log("WARNINGS");
  if (warnings.length) warnings.slice(0, 50).forEach((warning) => console.log(`- ${warning}`));
  else console.log("- none");
  console.log("ERRORS");
  if (errors.length) errors.slice(0, 50).forEach((error) => console.log(`- ${error}`));
  else console.log("- none");
  if (warnings.length > 50) console.log(`- ... ${warnings.length - 50} more warning(s)`);
  if (errors.length > 50) console.log(`- ... ${errors.length - 50} more error(s)`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error("CONTENT VALIDATION FAILED", error);
  process.exitCode = 1;
});
