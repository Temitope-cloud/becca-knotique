import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// ---- load env from .env.local ----
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const IMG = /\.(png|jpe?g|webp|gif)$/i;
const VID = /\.(mp4|webm|mov)$/i;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const all = walk("public").filter((p) => IMG.test(p) || VID.test(p));
// skip files with spaces/parens in path (unreferenced compressed dupes) to keep public_ids clean
const files = all.filter((p) => !/[()\s]/.test(p));
const skipped = all.filter((p) => /[()\s]/.test(p));

console.log(`Found ${all.length} assets; uploading ${files.length}, skipping ${skipped.length} (spaces/parens).`);

const map = {};
for (const file of files) {
  const rel = relative("public", file); // e.g. images/about1.png
  const ext = extname(file);
  const publicId = "beccas-knotique/" + rel.slice(0, -ext.length);
  const resourceType = VID.test(file) ? "video" : "image";
  try {
    const res = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
      invalidate: true,
    });
    map["/" + rel] = res.secure_url;
    process.stdout.write(".");
  } catch (e) {
    console.error(`\nFailed ${rel}:`, e.message);
  }
}
console.log(`\nUploaded ${Object.keys(map).length} assets.`);

writeFileSync("scripts/asset-map.json", JSON.stringify(map, null, 2));
console.log("Wrote scripts/asset-map.json");

// ---- update product docs in MongoDB ----
await mongoose.connect(env.MONGODB_URI, { bufferCommands: false });
const products = mongoose.connection.db.collection("products");
const remap = (u) => (u && map[u] ? map[u] : u);

let updated = 0;
for (const p of await products.find({}).toArray()) {
  const set = {};
  if (p.image) set.image = remap(p.image);
  if (p.hoverImage) set.hoverImage = remap(p.hoverImage);
  if (Array.isArray(p.images)) set.images = p.images.map(remap);
  await products.updateOne({ _id: p._id }, { $set: set });
  updated += 1;
}
console.log(`Updated ${updated} product docs.`);
await mongoose.disconnect();
console.log("Done.");
