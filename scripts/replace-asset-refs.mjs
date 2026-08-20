import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const map = JSON.parse(readFileSync("scripts/asset-map.json", "utf8"));
// Replace longer local paths first to avoid any partial overlap.
const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (exts.has(extname(p))) out.push(p);
  }
  return out;
}

const files = walk("src");
let changedFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  let content = readFileSync(file, "utf8");
  let fileChanged = false;
  for (const [local, url] of entries) {
    if (content.includes(local)) {
      const count = content.split(local).length - 1;
      content = content.split(local).join(url);
      totalReplacements += count;
      fileChanged = true;
    }
  }
  if (fileChanged) {
    writeFileSync(file, content);
    changedFiles += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(`\n${totalReplacements} replacements across ${changedFiles} files.`);
