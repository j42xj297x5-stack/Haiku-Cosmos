// HC world render snapshot builder (Stage 1)
(function () {
  window.HC = window.HC || {};

  function toNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function pickArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function mapBody(body, fallbackKind, index) {
    if (!body || typeof body !== "object") return null;
    const radius = toNumber(body.r, toNumber(body.radius, undefined));
    const scale = toNumber(body.scale, undefined);
    return {
      renderKey: body.renderKey || body.id || body._id || `${fallbackKind}:${index}:${Math.round(toNumber(body.x, 0))}:${Math.round(toNumber(body.y, 0))}`,
      id: body.id || body._id || null,
      kind: body.kind || body.type || fallbackKind,
      x: toNumber(body.x, 0),
      y: toNumber(body.y, 0),
      radius,
      scale,
      color: body.color || body.fill || body.colorName || body.gradientOuterColor || null,
      colorKey: body.colorKey || body.colorName || body.dominantKey || null,
      alpha: toNumber(body.alpha, undefined),
      state: body.state || body.phase || null,
      velocity: {
        vx: toNumber(body.vx, 0),
        vy: toNumber(body.vy, 0),
      },
      flags: {
        dead: !!body._dead,
        active: !!body.active,
      },
    };
  }

  function mapCollection(items, kind) {
    const result = [];
    const src = pickArray(items);
    for (let i = 0; i < src.length; i += 1) {
      const mapped = mapBody(src[i], kind, i);
      if (mapped) result.push(mapped);
    }
    return result;
  }

  function build(options) {
    const opts = options || {};
    const World = opts.World || {};
    const Camera = opts.Camera || {};
    const View = opts.View || {};

    let worldBounds = null;
    let worldBoundsSource = "fallback_null";
    if (typeof opts.getWorldViewBounds === "function") {
      try {
        worldBounds = opts.getWorldViewBounds() || null;
        worldBoundsSource = worldBounds ? "getWorldViewBounds" : "fallback_null";
      } catch (_err) {
        worldBounds = null;
        worldBoundsSource = "getWorldViewBounds_error";
      }
    } else if (World.bounds && typeof World.bounds === "object") {
      worldBounds = World.bounds;
      worldBoundsSource = "world.bounds";
    }

    const snapshot = {
      version: "world-render-snapshot-v1",
      nowMs: toNumber(opts.nowMs, 0),
      dt: toNumber(opts.dt, 0),
      camera: {
        x: toNumber(Camera.x, toNumber(Camera.centerX, 0)),
        y: toNumber(Camera.y, toNumber(Camera.centerY, 0)),
        centerX: toNumber(Camera.centerX, toNumber(Camera.x, 0)),
        centerY: toNumber(Camera.centerY, toNumber(Camera.y, 0)),
        zoom: toNumber(Camera.zoom, toNumber(Camera.scale, 1)),
        viewport: {
          width: toNumber(View.w, 0),
          height: toNumber(View.h, 0),
        },
        worldBounds,
      },
      world: {
        meteors: mapCollection(World.meteors, "meteor"),
        comets: mapCollection(World.comets, "comet"),
        asteroids: mapCollection(World.asteroids, "asteroid"),
        planets: mapCollection(World.planets, "planet"),
        stars: mapCollection(World.stars, "star"),
        prg: World.prg || null,
        background: World.background || null,
        sequenceVisualSignals: World.sequenceVisualSignals || null,
        debug: World.debug || null,
      },
      renderSettings: opts.renderSettings || null,
      debugSettings: opts.debugSettings || null,
      diagnostics: {
        version: "world-render-snapshot-v1",
        objectCounts: {
          meteors: pickArray(World.meteors).length,
          comets: pickArray(World.comets).length,
          asteroids: pickArray(World.asteroids).length,
          planets: pickArray(World.planets).length,
          stars: pickArray(World.stars).length,
        },
        cameraAvailability: {
          hasCamera: !!opts.Camera,
          hasView: !!opts.View,
          hasWorldBounds: !!worldBounds,
          worldBoundsSource,
        },
        hasWorldBounds: !!worldBounds,
      },
    };

    return snapshot;
  }

  window.HC.WorldRenderSnapshot = {
    build,
  };
})();
