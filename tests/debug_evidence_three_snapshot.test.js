const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = {
  console,
  performance: { now: () => 1234 },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  Blob: function Blob() {},
  URL: { createObjectURL: () => "blob:test", revokeObjectURL: () => {} },
  document: { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } },
  window: {
    addEventListener() {},
    HC: {},
    World: null,
    CardEngine: null,
  },
};
context.window.window = context.window;
context.window.console = console;
context.window.performance = context.performance;
context.window.localStorage = context.localStorage;
context.window.Blob = context.Blob;
context.window.URL = context.URL;
context.window.document = context.document;
context.window.HC.WorldRenderer = {
  getDiagnostics() {
    return {
      requestedMode: "three",
      effectiveMode: "three",
      fallbackUsed: false,
      hasThreeImplementation: true,
      hasThreeDependency: true,
      threeDependencySource: "vendor",
      threeReady: true,
      threeLoadStatus: "ready",
      threeMaterialSettings: {
        enabled: true,
        materialMode: "clay_lit",
        envIntensity: 0.42,
        toneExposure: 1.12,
        forceAuditLog: true,
      },
      threeMaterialOverrideStatus: {
        activeGlbObjects: 3,
        activeGlbMeshCount: 9,
        meshesUsingCurrentMaterialMode: 9,
        currentMaterialMode: "clay_lit",
        lastAppliedFrame: 77,
        lastAppliedAtMs: 123456,
        restoredImportedMaterials: 0,
      },
      glbMaterialAudit: [{
        assetName: "meteor.glb",
        meshCount: 2,
        materialCount: 2,
        hasMaps: true,
        hasNormalMaps: false,
        materials: [{
          meshName: "mesh_a",
          source: "glb_imported_pbr",
          type: "MeshStandardMaterial",
          reactsToLight: true,
          map: true,
          normalMap: false,
          metalness: 0.1,
          roughness: 0.7,
        }],
      }],
      glbMaterialAuditStatus: { auditedAssets: 1, consoleWrites: 1 },
      threeLights: {
        enabled: true,
        ambientIntensity: 0.13,
        ambientIsolate: true,
        debugKeyLightEnabled: false,
        debugKeyLightIntensity: 0,
        debugRimLightEnabled: false,
        debugRimLightIntensity: 0,
        forceHeadlightEnabled: false,
        forceHeadlightIntensity: 0,
        mainStageSpotEnabled: true,
        mainStageSpotIntensity: 3.9,
        mainStageSpotAngle: Math.PI / 2.8,
        mainStageSpotPenumbra: 0.72,
        mainStageSpotDistance: 0,
        mainStageSpotDecay: 0,
        mainStageSpotTargetMode: "sampleObject",
        showLightHelpers: false,
      },
      globalHelpersEnabled: false,
      threeLightHelpers: { mode: "global_off", count: 4, visible: false, enabled: false, globalEnabled: false },
      threeLightDiagnostics: {
        effectiveAmbientIntensity: 0.13,
        sampleObject: { kind: "meteor_glb", position: { x: 10, y: 20, z: 0 } },
        debugKeyLight: { position: { x: 2, y: 3, z: 4 }, intensity: 0, visible: false },
        debugRimLight: { position: { x: 5, y: 6, z: 7 }, intensity: 0, visible: false },
        forceHeadlight: null,
        mainStageSpot: {
          visible: true,
          intensity: 3.9,
          angle: Math.PI / 2.8,
          penumbra: 0.72,
          distance: 0,
          decay: 0,
          position: { x: -50, y: -30, z: 120 },
          targetPosition: { x: 10, y: 20, z: 0 },
        },
        mainStageSpotTargetMode: "sampleObject",
        sampleObjectProjected: { x: 100, y: 110 },
        sampleObjectFrustumVisible: true,
      },
      activeLightCount: 1,
      diagnosticLightCount: 3,
      totalLightObjects: 4,
      threeLightCount: 4,
      threeLightCountSemantics: "deprecated_totalLightObjects",
      lightingModelVersion: "stage_spot_v1",
      removedLegacyCornerLights: true,
      stageLighting: {
        enabled: true,
        model: "stage_spot",
        lightingModelVersion: "stage_spot_v1",
        ambientEffectiveIntensity: 0.13,
      },
      mainStageSpot: {
        enabled: true,
        intensity: 3.9,
        angle: Math.PI / 2.8,
        penumbra: 0.72,
        distance: 0,
        decay: 0,
        position: { x: -50, y: -30, z: 120 },
        targetPosition: { x: 10, y: 20, z: 0 },
        targetMode: "sampleObject",
        helperVisible: false,
        targetInScene: true,
        castShadow: false,
      },
    };
  },
  getThreeLightsSettings() { return this.getDiagnostics().threeLights; },
  getThreeMaterialSettings() { return this.getDiagnostics().threeMaterialSettings; },
};
context.window.HC.getWorld = () => ({
  score: 0,
  cardsPool: [],
  cardsTemp: [],
  meteors: [],
  asteroids: [],
  planets: [],
  stars: [],
});

vm.createContext(context);
vm.runInContext(fs.readFileSync("hc.debug.js", "utf8"), context, { filename: "hc.debug.js" });

const session = context.window.HC.Session;
session.debugConfig = context.window.HC.createDebugConfig("debug", {});
const snapshot = session.getRuntimeSnapshot();

assert.equal(snapshot.visual.three.materialMode, "clay_lit");
assert.equal(snapshot.visual.three.threeMaterials.enabled, true);
assert.equal(snapshot.visual.three.ambientIsolate, true);
assert.equal(snapshot.visual.three.threeLights.debugKeyLightEnabled, false);
assert.equal(snapshot.visual.three.showLightHelpers, false);
assert.equal(snapshot.visual.three.globalHelpersEnabled, false);
assert.equal(snapshot.visual.three.threeLights.mainStageSpotEnabled, true);
assert.equal(snapshot.visual.three.threeLights.mainStageSpotIntensity, 3.9);
assert.equal(snapshot.visual.three.threeLights.ambientIntensity, 0.13);
assert.equal(snapshot.visual.three.mainStageSpot.intensity, 3.9);
assert.equal(snapshot.visual.three.ambientEffectiveIntensity, 0.13);
assert.equal(snapshot.visual.three.mainStageSpot.targetMode, "sampleObject");
assert.equal(snapshot.visual.three.mainStageSpot.castShadow, false);
assert.equal(snapshot.visual.three.lights.sampleObjectFrustumVisible, true);
assert.equal(snapshot.visual.three.lightingModelVersion, "stage_spot_v1");
assert.equal(snapshot.visual.three.stageLighting.enabled, true);
assert.equal(snapshot.visual.three.stageLightingEnabled, true);
assert.equal(snapshot.visual.three.threeLights.enabled, true);
assert.equal(snapshot.visual.three.threeLights.deprecatedEnabledSemantics, "stageLightingEnabled");
assert.equal(snapshot.visual.three.stageLighting.model, "stage_spot");
assert.equal(snapshot.visual.three.removedLegacyCornerLights, true);
assert.equal(snapshot.visual.three.activeLightCount, 1);
assert.equal(snapshot.visual.three.diagnosticLightCount, 3);
assert.equal(snapshot.visual.three.totalLightObjects, 4);
assert.equal(snapshot.visual.three.threeLightCount, 4);
assert.equal(snapshot.visual.three.threeLightCountSemantics, "deprecated_totalLightObjects");
assert.equal(Object.prototype.hasOwnProperty.call(snapshot.visual.three, "debugSpotLight"), false);
assert.equal(Object.prototype.hasOwnProperty.call(snapshot.visual.three.lights, "debugSpotLight"), false);
assert.equal(Object.prototype.hasOwnProperty.call(snapshot.visual.three.lights, "cornerLights"), false);
assert.equal(Object.prototype.hasOwnProperty.call(snapshot.visual.three.lights, "legacyCornerLights"), false);
assert.equal(snapshot.visual.three.helper.count, 4);
assert.equal(snapshot.visual.three.helper.globalEnabled, false);
assert.equal(snapshot.visual.three.materials.activeGlbObjectCount, 3);
assert.equal(snapshot.visual.three.materials.activeGlbMeshCount, 9);
assert.equal(snapshot.visual.three.materials.auditEntries[0].assetName, "meteor.glb");
assert.equal(snapshot.visual.worldRendererDiagnostics.threeMaterialSettings.materialMode, "clay_lit");

const uiDebugSource = fs.readFileSync("hc.ui_debug.js", "utf8");
for (const eventType of [
  "debug.three_material_mode_changed",
  "debug.three_light_setting_changed",
  "debug.three_ambient_isolate_changed",
  "debug.three_helper_visibility_changed",
  "debug.global_helper_visibility_changed",
]) {
  assert.match(uiDebugSource, new RegExp(eventType.replace(/[.]/g, "\\.")), `${eventType} event is wired`);
}

const cfg = context.window.HC.createDebugConfig("debug", {});
assert.equal(cfg.loggingMode, "compact");
assert.equal(cfg.heartbeatIntervalMs, 5000);
assert.equal(cfg.verboseDiagnostics, false);
assert.equal(cfg.visual.globalHelpersEnabled, false);
assert.ok(context.window.HC.DebugEventTypes.SUBMETA_OPENED);
assert.ok(context.window.HC.DebugEventTypes.DEBUG_HEARTBEAT);

console.log("debug evidence Three snapshot contract ok");
