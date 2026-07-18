(async () => {
  const info = window.HC_BUILD_INFO, boot = window.HC_RELEASE_BOOTSTRAP;
  if (!info?.id || !info?.assetBase || !info?.appPath || !info?.integrityPath) throw new Error("Missing immutable HC build metadata");
  const hex = async (response) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await response.arrayBuffer())), b => b.toString(16).padStart(2, "0")).join("");
  const integrity = await (await fetch(info.integrityPath, { cache: "no-store", credentials: "same-origin" })).json();
  const urls = ["/Haiku-Cosmos/", "/Haiku-Cosmos/build-meta.json", info.appPath, info.integrityPath, ...["runtime/game.boot.js", "runtime/hc.public_path.js", "settings/ui-typography.json", "settings/hud-top-layout.json", "settings/submeta-png-layout.json"].map(p => info.assetBase + p)];
  const rows = [];
  for (const url of urls) {
    const [a,b,c] = await Promise.all([fetch(url), fetch(url,{cache:"reload"}), fetch(url,{cache:"no-store"})]);
    const [defaultHash,reloadHash,noStoreHash] = await Promise.all([hex(a),hex(b),hex(c)]);
    const rel=url.startsWith(info.assetBase) ? url.slice(info.assetBase.length) : "";
    const expected=integrity.files?.[rel]?.sha256;
    const status=!url.startsWith("/Haiku-Cosmos/")||url==="/Haiku-Cosmos/"||url==="/Haiku-Cosmos/build-meta.json"||url===info.appPath||url===info.integrityPath?"OK":!url.startsWith(info.assetBase)?"WRONG_BUILD_PATH":defaultHash!==reloadHash||defaultHash!==noStoreHash?"CACHE_MISMATCH":expected&&noStoreHash!==expected?"INTEGRITY_MISMATCH":"OK";
    rows.push({url,status,defaultHash,reloadHash,noStoreHash,expected:expected||"n/a"});
  }
  console.table(rows); console.info("HC cache probe", { info, boot, rows }); return rows;
})();
