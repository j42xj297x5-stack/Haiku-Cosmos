// HC collisions subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  window.HC.initCollisions = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    const Events = window.Events;
    const spawnAsteroidFromCollision = window.spawnAsteroidFromCollision;

    function notifyHitColor(colorName, collisionContext = null) {
      const CE = window.CardEngine;
      if (!CE || typeof CE.onHitColor !== "function") return;
      CE.onHitColor(colorName, collisionContext);
    }

    function isR1ColorActive(colorName, nowMs) {
      const CE = window.CardEngine;
      if (!CE || typeof CE.isColorR1Active !== "function") return false;
      return CE.isColorR1Active(colorName, nowMs);
    }

    function resolveMeteorCollisionsSafe() {
      const arr = World.meteors;
      if (arr.length < 2) return;

      const nowMs = (World.nowMs ?? performance.now());
      const toRemove = new Set();
      for (let i = 0; i < arr.length; i++) {
        if (toRemove.has(i)) continue;
        const a = arr[i];
        if (a.age < 0.25) continue;

        for (let j = i + 1; j < arr.length; j++) {
          if (toRemove.has(j)) continue;
          const b = arr[j];
          if (b.age < 0.25) continue;

          if ((a.noMeteorCollisionUntilMs && nowMs < a.noMeteorCollisionUntilMs) || (b.noMeteorCollisionUntilMs && nowMs < b.noMeteorCollisionUntilMs)) continue;

          const r1ActiveA = isR1ColorActive(a.colorName, nowMs);
          const r1ActiveB = isR1ColorActive(b.colorName, nowMs);
          if (r1ActiveA || r1ActiveB) {
            if (!(a.colorName === b.colorName && r1ActiveA && r1ActiveB)) continue;
          }

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist2 = dx * dx + dy * dy;
          const minDist = (a.r + b.r) * World.meteorCollisionFudge;

          if (dist2 <= minDist * minDist) {

            if (a.colorName === b.colorName) {
              Events.emit("METEOR_SAME_COLOR_COLLISION", { color: a.colorName });
              notifyHitColor(a.colorName, {
                sourceObject: "meteor_collision",
                meteorAColor: a.colorName,
                meteorBColor: b.colorName,
                nowMs,
              });
              toRemove.add(i);
              toRemove.add(j);
              break;
            } else {
              spawnAsteroidFromCollision(a, b);
              Events.emit("METEOR_DIFF_COLOR_COLLISION", {
                a: { color: a.colorName },
                b: { color: b.colorName }
              });
              toRemove.add(i);
              toRemove.add(j);
              break;
            }
          }
        }
      }

      if (toRemove.size) {
        const idxs = Array.from(toRemove).sort((x, y) => y - x);
        for (const idx of idxs) arr.splice(idx, 1);
      }
    }

    window.HC.Collisions = {
      resolve(dt, now) {
        resolveMeteorCollisionsSafe();
      }
    };

    return window.HC.Collisions;
  };
})();
