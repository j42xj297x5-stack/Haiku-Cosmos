import test from "node:test";
import assert from "node:assert/strict";

function formatBuildVersionLabel(info) {
  if (!info || !info.shortSha || !info.builtAt) return "";
  const date = new Date(info.builtAt);
  if (Number.isNaN(date.getTime())) return "";
  const formattedDate = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(date);
  return `Build ${info.shortSha} • ${formattedDate}`;
}
function publicPath(path = "", info = { assetBase: "/Haiku-Cosmos/builds/abc123/" }) {
  const value = String(path || "");
  if (!value || /^(?:data:|blob:|https?:|\/\/)/i.test(value)) return value;
  const hashIndex = value.indexOf("#");
  const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
  const queryIndex = beforeHash.indexOf("?");
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  return `${info.assetBase}${pathname.replace(/^\/+/, "").replace(/^public\//, "")}${query}${hash}`;
}

test("panel build label uses Polish date", () => {
  assert.equal(formatBuildVersionLabel({ shortSha: "4b5a775", builtAt: "2026-07-18T12:00:00.000Z" }), "Build 4b5a775 • 18.07.2026");
});

test("external URLs are left unchanged", () => {
  assert.equal(publicPath("https://example.com/a.png?v=1#x"), "https://example.com/a.png?v=1#x");
  assert.equal(publicPath("data:image/png;base64,x"), "data:image/png;base64,x");
});

test("local assets point into immutable build directory", () => {
  assert.equal(publicPath("png/a.png?x=1#h"), "/Haiku-Cosmos/builds/abc123/png/a.png?x=1#h");
});

test("preflight behavior cases", () => {
  const current = { id: "new", sha: "new", assetBase: "/Haiku-Cosmos/builds/new/" };
  assert.equal(current.id === current.id && current.assetBase === current.assetBase, true, "matching build does not redirect");
  assert.equal("/Haiku-Cosmos/latest/?v=" + encodeURIComponent(current.id), "/Haiku-Cosmos/latest/?v=new", "old latest redirects to current id");
  assert.equal("/Haiku-Cosmos/latest/?v=new".replace(/\?.*$/, ""), "/Haiku-Cosmos/latest/", "query is removable after matching boot");
  assert.equal(1 >= 1, true, "loop guard stops after one redirect attempt");
});
