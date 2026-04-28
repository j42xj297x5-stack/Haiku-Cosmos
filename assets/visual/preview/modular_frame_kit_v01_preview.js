const manifestUrl = "/assets/visual/modular_frame_kit_v01_manifest.json";

const statusNode = document.querySelector("[data-manifest-status]");

function assetUrl(path) {
  return `/${path.replace(/\\/g, "/")}`;
}

function setStatus(message, isError = false) {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.style.color = isError ? "#e05f5b" : "#afc0d6";
}

async function loadPreviewAssets() {
  const response = await fetch(manifestUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Manifest request failed: ${response.status}`);
  }

  const manifest = await response.json();
  const assetsByName = new Map(manifest.assets.map((asset) => [asset.logicalName, asset]));
  const imageNodes = [...document.querySelectorAll("[data-asset]")];
  const missing = [];

  for (const imageNode of imageNodes) {
    const logicalName = imageNode.dataset.asset;
    const asset = assetsByName.get(logicalName);

    if (!asset) {
      imageNode.classList.add("asset-missing");
      imageNode.alt = `${logicalName} missing from manifest`;
      missing.push(logicalName);
      continue;
    }

    imageNode.src = assetUrl(asset.path);
    imageNode.title = `${asset.logicalName} -> ${asset.path}`;
  }

  const uniquePreviewAssets = new Set(imageNodes.map((node) => node.dataset.asset));
  if (missing.length) {
    setStatus(
      `Manifest loaded: ${manifest.assetCount} assets. Missing preview refs: ${missing.join(", ")}`,
      true
    );
    return;
  }

  setStatus(
    `Manifest loaded: ${manifest.assetCount} assets. Preview refs: ${uniquePreviewAssets.size}.`
  );
}

loadPreviewAssets().catch((error) => {
  setStatus(`Preview failed to load manifest: ${error.message}`, true);
});
