// Sum up 18 November 2026's world news in one image.
//
// The entry is a newspaper front page drawn for this day alone:
//   masthead names Wednesday 18 November 2026, the lead is the Gulf
//   escalation (Iran hits Kuwait and Bahrain after the US strike on
//   Qeshm Island), then Kerch Bridge, Xi–Putin in Shenzhen, Peltola's
//   Alaska win, and Ebola in DR Congo, with three more briefs below.
// The picture itself is the file entry.png beside this program; this
// program's job is to check that picture and copy it, byte for byte,
// to the output the grader reads. It runs with no network.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// The gate's limits for this competition: a whole PNG or JPEG, at most
// 1 MiB and at most 1024 by 1024 pixels. This entry is a PNG.
const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;

const here = new URL("./entry.png", import.meta.url);
const source = readFileSync(here);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

function fail(message: string): never {
  throw new Error(`entry.png rejected: ${message}`);
}

// A PNG starts with its eight-byte signature, then the IHDR chunk,
// whose first eight data bytes are width and height, big-endian.
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (source.length < 33 || !source.subarray(0, 8).equals(PNG_SIGNATURE)) {
  fail("not a PNG file");
}
if (source.subarray(12, 16).toString("ascii") !== "IHDR") {
  fail("first chunk is not IHDR");
}
const width = source.readUInt32BE(16);
const height = source.readUInt32BE(20);
if (width === 0 || height === 0 || width > MAX_SIDE || height > MAX_SIDE) {
  fail(`size ${width}x${height} is outside the 1024x1024 limit`);
}
if (source.length > MAX_BYTES) {
  fail(`${source.length} bytes is over the 1 MiB limit`);
}

// The file on disk and the bytes just read are the same file, so this
// copy is deterministic: both grader runs write identical bytes.
copyFileSync(here, target);
const written = statSync(target).size;
if (written !== source.length) {
  fail(`copied ${written} bytes, expected ${source.length}`);
}
