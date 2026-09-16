#!/usr/bin/env node
/**
 * Materialize public/ poster binaries from text payloads.
 *
 * GitHub's file APIs here store UTF-8 text, not raw image bytes, so the
 * JPEG/PNG assets live in scripts/assets as base64 and this script writes
 * public/poster-base.jpg, public/icon-crane.png, and public/icon-train.png
 * before Vite copies public/ into the build. Existing valid originals (the
 * sandbox copies) are left untouched unless the decoded payload is larger
 * (upgrade the muddy 96KB JPEG to the full-quality poster).
 *
 * Full-quality JPEG is stored gzipped in scripts/assets/poster-gz because
 * raw JPEG base64 contains long repeated runs that the GitHub file API
 * collapses. Decode: concat .b64 → base64 → gunzip.
 *
 * The Vite plugin restores during config/buildStart, emits the files as
 * build assets, and copies them into Nitro/Vercel static output so
 * `/poster-base.jpg` and `/icon-crane.png` exist even when public/ was
 * snapshotted before the files were written.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "scripts/assets");
const pub = join(root, "public");

const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const GZIP_MAGIC = Buffer.from([0x1f, 0x8b]);
const POSTER_PARTS = 13;
const POSTER_GZ_PARTS = 16;
const OUTPUT_DIRS = [
  join(root, ".vercel/output/static"),
  join(root, ".output/public"),
  join(root, "dist"),
];

function isValidImageBuf(buf, magic, minBytes) {
  return Buffer.isBuffer(buf) && buf.length >= minBytes && buf.subarray(0, magic.length).equals(magic);
}

function isValidImage(dest, magic, minBytes) {
  if (!existsSync(dest)) return false;
  try {
    return isValidImageBuf(readFileSync(dest), magic, minBytes);
  } catch {
    return false;
  }
}

function decodeParts(partPaths) {
  const b64 = partPaths.map((p) => readFileSync(p, "utf8").replace(/\s+/g, "")).join("");
  let buf = Buffer.from(b64, "base64");
  if (buf.length >= 2 && buf.subarray(0, 2).equals(GZIP_MAGIC)) {
    buf = gunzipSync(buf);
  }
  return buf;
}

function restore(name, partPaths, magic, minBytes) {
  const dest = join(pub, name);
  const buf = decodeParts(partPaths);
  if (!isValidImageBuf(buf, magic, minBytes)) {
    throw new Error(`[restore] decoded ${name} is not a valid image (${buf.length} bytes)`);
  }
  if (isValidImage(dest, magic, minBytes)) {
    const existing = readFileSync(dest);
    if (existing.length >= buf.length) {
      console.log(`[restore] keep ${name}`);
      return { name, dest, buf: existing };
    }
    console.log(`[restore] upgrade ${name} (${existing.length} -> ${buf.length} bytes)`);
  }
  mkdirSync(pub, { recursive: true });
  writeFileSync(dest, buf);
  console.log(`[restore] wrote ${name} (${buf.length} bytes)`);
  return { name, dest, buf };
}

function b64PartsIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".b64"))
    .sort()
    .map((f) => join(dir, f));
}

function posterPartPaths() {
  const gz = b64PartsIn(join(assets, "poster-gz"));
  if (gz.length >= POSTER_GZ_PARTS) return gz;
  const hq = b64PartsIn(join(assets, "poster-hq"));
  if (hq.length >= POSTER_PARTS) return hq;
  const posterParts = b64PartsIn(join(assets, "poster-base"));
  if (posterParts.length < POSTER_PARTS) {
    throw new Error(
      `[restore] poster payload incomplete (gz=${gz.length}, hq=${hq.length}, base=${posterParts.length})`,
    );
  }
  return posterParts;
}

export function restorePublicBinaries() {
  mkdirSync(pub, { recursive: true });
  return [
    restore("icon-crane.png", [join(assets, "icon-crane.png.b64")], PNG_MAGIC, 1000),
    restore("icon-train.png", [join(assets, "icon-train.png.b64")], PNG_MAGIC, 1000),
    restore("poster-base.jpg", posterPartPaths(), JPEG_MAGIC, 90000),
  ];
}

function copyToOutputDirs(files) {
  for (const dir of OUTPUT_DIRS) {
    if (!existsSync(dir)) continue;
    for (const { name, buf } of files) {
      writeFileSync(join(dir, name), buf);
      console.log(`[restore] copied ${name} -> ${dir}`);
    }
  }
}

export function restorePublicBinariesPlugin() {
  let files = [];
  const emit = (plugin) => {
    for (const { name, buf } of files) {
      plugin.emitFile({ type: "asset", fileName: name, source: buf });
    }
  };
  return {
    name: "restore-public-binaries",
    enforce: "pre",
    config() {
      files = restorePublicBinaries();
    },
    buildStart() {
      files = restorePublicBinaries();
      emit(this);
    },
    generateBundle() {
      if (!files.length) files = restorePublicBinaries();
      emit(this);
    },
    closeBundle() {
      if (!files.length) files = restorePublicBinaries();
      copyToOutputDirs(files);
    },
  };
}

const invokedDirectly =
  Boolean(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
if (invokedDirectly) restorePublicBinaries();
