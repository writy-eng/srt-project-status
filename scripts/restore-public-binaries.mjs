#!/usr/bin/env node
/**
 * Materialize public/ poster binaries from text payloads.
 *
 * GitHub's file APIs here store UTF-8 text, not raw image bytes, so the
 * JPEG/PNG assets live in scripts/assets as base64 and this script writes
 * public/poster-base.jpg, public/icon-crane.png, and public/icon-train.png
 * before Vite copies public/ into the build. Existing valid originals (the
 * sandbox copies) are left untouched.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "scripts/assets");
const pub = join(root, "public");

const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

mkdirSync(pub, { recursive: true });

function isValidImage(dest, magic, minBytes) {
  if (!existsSync(dest)) return false;
  try {
    const buf = readFileSync(dest);
    return buf.length >= minBytes && buf.subarray(0, magic.length).equals(magic);
  } catch {
    return false;
  }
}

function restore(name, partPaths, magic, minBytes) {
  const dest = join(pub, name);
  if (isValidImage(dest, magic, minBytes)) {
    console.log(`[restore] keep ${name}`);
    return dest;
  }
  const b64 = partPaths.map((p) => readFileSync(p, "utf8").replace(/\s+/g, "")).join("");
  const buf = Buffer.from(b64, "base64");
  if (buf.length < minBytes || !buf.subarray(0, magic.length).equals(magic)) {
    throw new Error(`[restore] decoded ${name} is not a valid image (${buf.length} bytes)`);
  }
  writeFileSync(dest, buf);
  console.log(`[restore] wrote ${name} (${buf.length} bytes)`);
  return dest;
}

restore("icon-crane.png", [join(assets, "icon-crane.png.b64")], PNG_MAGIC, 1000);
restore("icon-train.png", [join(assets, "icon-train.png.b64")], PNG_MAGIC, 1000);

const posterDir = join(assets, "poster-base");
const posterParts = readdirSync(posterDir)
  .filter((f) => f.endsWith(".b64"))
  .sort()
  .map((f) => join(posterDir, f));
if (posterParts.length === 0) {
  throw new Error("[restore] missing scripts/assets/poster-base/*.b64");
}
restore("poster-base.jpg", posterParts, JPEG_MAGIC, 8000);
