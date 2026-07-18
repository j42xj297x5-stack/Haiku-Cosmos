import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."), dist=path.join(root,"dist"), base="/Haiku-Cosmos/";
const fail=(m)=>{throw Error(m)}; const file=async p=>{try{return(await stat(p)).isFile()}catch{return false}};
const meta=JSON.parse(await readFile(path.join(dist,"build-meta.json"),"utf8"));
for(const k of ["id","sha","shortSha","builtAt","mode","appPath","assetBase","integrityPath"])if(!meta[k])fail(`build-meta missing ${k}`);
if(!/^[A-Za-z0-9._~-]+$/.test(meta.id))fail("unsafe build id");
const expected={appPath:`${base}builds/${meta.id}/index.html`,assetBase:`${base}builds/${meta.id}/`,integrityPath:`${base}builds/${meta.id}/build-integrity.json`};for(const[k,v]of Object.entries(expected))if(meta[k]!==v)fail(`${k} is not immutable build path`);
const appDir=path.join(dist,"builds",meta.id), app=await readFile(path.join(appDir,"index.html"),"utf8"), rootHtml=await readFile(path.join(dist,"index.html"),"utf8"), latest=await readFile(path.join(dist,"latest","index.html"),"utf8");
if(!rootHtml.includes('cache:"no-store"')||!rootHtml.includes("Date.now()")||!rootHtml.includes('credentials:"same-origin"')||!rootHtml.includes("location.replace(m.appPath)"))fail("root bootstrap must no-store redirect to meta.appPath");
if(/runtime\/|data-hc-release-manifest|HC_BUILD_INFO/.test(latest))fail("latest must be compatibility redirect only");
if(app.includes("/latest/"))fail("immutable app depends on latest");
const embedded=JSON.parse(app.match(/window\.HC_BUILD_INFO\s*=\s*Object\.freeze\((\{[\s\S]*?\})\);/)?.[1]||"null");if(JSON.stringify(embedded)!==JSON.stringify(meta))fail("embedded build metadata differs");
const manifest=JSON.parse(app.match(/data-hc-release-manifest[^>]*>([\s\S]*?)<\/script>/)?.[1]||"null");if(!Array.isArray(manifest)||!manifest.length)fail("missing release manifest");
for(const e of manifest){const rel=e.src||e.href;if(!rel||rel.startsWith("/")||rel.includes("..")||rel.includes("/latest/")||!(await file(path.join(appDir,rel))))fail(`invalid manifest entry ${rel}`)}
const integrity=JSON.parse(await readFile(path.join(appDir,"build-integrity.json"),"utf8"));if(integrity.buildId!==meta.id||integrity.sha!==meta.sha||!integrity.files)fail("invalid integrity manifest");
for(const [rel,entry] of Object.entries(integrity.files)){const body=await readFile(path.join(appDir,rel));if(body.length!==entry.size||createHash("sha256").update(body).digest("hex")!==entry.sha256)fail(`integrity mismatch ${rel}`)}
for(const d of ["runtime","assets","settings","data","png","svg","textures","glb","fonts","vendor","models"])try{if(!(await stat(path.join(appDir,d))).isDirectory())fail(`missing required build directory ${d}`)}catch{fail(`missing required build directory ${d}`)}
const latestEntries=await readdir(path.join(dist,"latest"));if(latestEntries.length!==1||latestEntries[0]!=="index.html")fail("latest must only contain redirect shell");
console.log(`Verified immutable release ${meta.id}: ${Object.keys(integrity.files).length} files with valid SHA-256.`);
