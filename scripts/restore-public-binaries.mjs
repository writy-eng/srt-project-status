#!/usr/bin/env node
/**
 * Materialize public/ poster binaries from text payloads.
 *
 * GitHub's file APIs here store UTF-8 text, not raw image bytes, so the
 * JPEG/PNG assets live in scripts/assets as base64 and this script writes
 * public/poster-base.jpg, public/icon-crane.png, and public/icon-train.png
 * before Vite copies public/ into the build. Existing valid originals (the
 * sandbox copies) are left untouched.
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
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "scripts/assets");
const pub = join(root, "public");

const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const POSTER_PARTS = 13;
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

function restore(name, partPaths, magic, minBytes) {
  const dest = join(pub, name);
  if (isValidImage(dest, magic, minBytes)) {
    const buf = readFileSync(dest);
    console.log(`[restore] keep ${name}`);
    return { name, dest, buf };
  }
  const b64 = partPaths.map((p) => readFileSync(p, "utf8").replace(/\s+/g, "")).join("");
  const buf = Buffer.from(b64, "base64");
  if (!isValidImageBuf(buf, magic, minBytes)) {
    throw new Error(`[restore] decoded ${name} is not a valid image (${buf.length} bytes)`);
  }
  mkdirSync(pub, { recursive: true });
  writeFileSync(dest, buf);
  console.log(`[restore] wrote ${name} (${buf.length} bytes)`);
  return { name, dest, buf };
}

function posterPartPaths() {
  const posterDir = join(assets, "poster-base");
  const posterParts = readdirSync(posterDir)
    .filter((f) => f.endsWith(".b64"))
    .sort()
    .map((f) => join(posterDir, f));
  if (posterParts.length < POSTER_PARTS) {
    throw new Error(
      `[restore] poster-base payload incomplete (${posterParts.length} parts, need ${POSTER_PARTS})`,
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
