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
        pointIntensity: 1.1,
        distanceMultiplier: 1.8,
        decay: 1.2,
        zOffsetMultiplier: 0.5,
        ambientIntensity: 0.2,
        ambientIsolate: true,
        debugKeyLightEnabled: true,
        debugKeyLightIntensity: 2.4,
        debugRimLightEnabled: true,
        debugRimLightIntensity: 0.7,
        forceHeadlightEnabled: false,
        forceHeadlightIntensity: 4.5,
        debugSpotLightEnabled: true,
        debugSpotLightIntensity: 12,
        debugSpotLightAngle: Math.PI / 5,
        debugSpotLightPenumbra: 0.35,
        debugSpotLightDistance: 0,
        debugSpotLightDecay: 1,
        debugSpotLightTargetMode: "sampleObject",
        showLightHelpers: true,
      },
      threeLightHelpers: { mode: "pointLightHelper", count: 6, visible: true, enabled: true },
      threeLightPositions: [{ name: "corner_0", position: { x: 1, y: 2, z: 3 } }],
      threeLightDiagnostics: {
        effectiveAmbientIntensity: 0,
        sampleObject: { kind: "meteor_glb", position: { x: 10, y: 20, z: 0 } },
        cornerLights: [{ name: "corner_0", objectDistance: 10, distance: 20, objectInRange: true, decay: 1.2 }],
        debugKeyLight: { position: { x: 2, y: 3, z: 4 }, intensity: 2.4 },
        debugRimLight: { position: { x: 5, y: 6, z: 7 }, intensity: 0.7 },
        forceHeadlight: null,
        debugSpotLight: {
          visible: true,
          intensity: 12,
          angle: Math.PI / 5,
          penumbra: 0.35,
          distance: 0,
          decay: 1,
          position: { x: -50, y: -30, z: 120 },
          targetPosition: { x: 10, y: 20, z: 0 },
        },
        debugSpotLightTargetMode: "sampleObject",
        debugSpotLightHelperVisible: true,
        sampleObjectProjected: { x: 100, y: 110 },
        sampleObjectFrustumVisible: true,
      },
      debugSpotLight: {
        enabled: true,
        intensity: 12,
        angle: Math.PI / 5,
        penumbra: 0.35,
        distance: 0,
        decay: 1,
        position: { x: -50, y: -30, z: 120 },
        targetPosition: { x: 10, y: 20, z: 0 },
        targetMode: "sampleObject",
        helperVisible: true,
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
assert.equal(snapshot.visual.three.threeLights.debugKeyLightEnabled, true);
assert.equal(snapshot.visual.three.showLightHelpers, true);
assert.equal(snapshot.visual.three.threeLights.debugSpotLightEnabled, true);
assert.equal(snapshot.visual.three.debugSpotLight.targetMode, "sampleObject");
assert.equal(snapshot.visual.three.debugSpotLight.castShadow, false);
assert.equal(snapshot.visual.three.lights.debugSpotLightHelperVisible, true);
assert.equal(snapshot.visual.three.lights.sampleObjectFrustumVisible, true);
assert.equal(snapshot.visual.three.helper.count, 6);
assert.equal(snapshot.visual.three.materials.activeGlbObjectCount, 3);
assert.equal(snapshot.visual.three.materials.activeGlbMeshCount, 9);
assert.equal(snapshot.visual.three.materials.auditEntries[0].assetName, "meteor.glb");
assert.equal(snapshot.visual.three.lights.cornerLights[0].objectInRange, true);
assert.equal(snapshot.visual.worldRendererDiagnostics.threeMaterialSettings.materialMode, "clay_lit");

const uiDebugSource = fs.readFileSync("hc.ui_debug.js", "utf8");
for (const eventType of [
  "debug.three_material_mode_changed",
  "debug.three_light_setting_changed",
  "debug.three_ambient_isolate_changed",
  "debug.three_helper_visibility_changed",
]) {
  assert.match(uiDebugSource, new RegExp(eventType.replace(/[.]/g, "\\.")), `${eventType} event is wired`);
}

console.log("debug evidence Three snapshot contract ok");
