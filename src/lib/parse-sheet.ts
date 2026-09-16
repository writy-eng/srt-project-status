import * as XLSX from "xlsx";
import {
  MONTHS,
  type MonthRecord,
} from "@/lib/rail";

type Point = {
  month: string;
  year: string;
  plan: number;
  actual: number;
  delta: number;
};

function beFromDate(value: unknown): { month: string; year: string } | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const monthIdx = value.getUTCMonth();
    const be = year >= 2400 ? year : 2500 + (year % 100);
    return { month: MONTHS[monthIdx], year: String(be) };
  }
  if (typeof value === "string") {
    const m = value.trim().match(/^([ก-๞.]+)\s*\.?\s*(\d{2})$/);
    if (!m) return null;
    const abbr: Record<string, (typeof MONTHS)[number]> = {
      "ม.ค.": "มกราคม",
      "ก.พ.": "กุมภาพันธ์",
      "มี.ค.": "มีนาคม",
      "เม.ย.": "เมษายน",
      "พ.ค.": "พฤษภาคม",
      "มิ.ย.": "มิถุนายน",
      "ก.ค.": "กรกฎาคม",
      "ส.ค.": "สิงหาคม",
      "ก.ย.": "กันยายน",
      "ต.ค.": "ตุลาคม",
      "พ.ย.": "พฤศจิกายน",
      "ธ.ค.": "ธันวาคม",
    };
    const month = abbr[m[1]] ?? abbr[`${m[1]}.`];
    if (!month) return null;
    return { month, year: String(2500 + Number(m[2])) };
  }
  return null;
}

function hasActual(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function fmtFixed(n: number, digits: number): string {
  return n.toFixed(digits);
}

type Row = unknown[];

function collectBlocks(rows: Row[]): Map<string, Point[]> {
  const blocks = new Map<string, Point[]>();
  let current = "";
  for (const row of rows) {
    const name = row[1];
    if (typeof name === "string" && name.trim()) {
      current = name.replace(/\s+/g, " ").trim();
      if (!blocks.has(current)) blocks.set(current, []);
    }
    if (!current) continue;
    const when = beFromDate(row[2]);
    if (!when) continue;
    if (!hasActual(row[4])) continue;
    const actual = row[4];
    if (actual === 0 && !hasActual(row[3])) continue;
    const plan = hasActual(row[3]) ? row[3] : actual;
    const delta = hasActual(row[5]) ? row[5] : actual - plan;
    blocks.get(current)!.push({ ...when, plan, actual, delta });
  }
  return blocks;
}

function pick(blocks: Map<string, Point[]>, test: (name: string) => boolean): Point[] {
  for (const [name, points] of blocks) {
    if (test(name) && points.length) return points;
  }
  return [];
}

function keyOf(month: string, year: string): string {
  return `${year}::${month}`;
}

function sortKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const [ya, ma] = a.split("::");
    const [yb, mb] = b.split("::");
    const dy = Number(ya) - Number(yb);
    if (dy !== 0) return dy;
    return MONTHS.indexOf(ma as (typeof MONTHS)[number]) - MONTHS.indexOf(mb as (typeof MONTHS)[number]);
  });
}

function indexPoints(points: Point[]): Map<string, Point> {
  const map = new Map<string, Point>();
  for (const p of points) map.set(keyOf(p.month, p.year), p);
  return map;
}

function fill(series: Map<string, Point>, keys: string[]): Map<string, Point> {
  const out = new Map<string, Point>();
  let last: Point | undefined;
  for (const k of keys) {
    const hit = series.get(k);
    if (hit) last = hit;
    if (last) {
      const [year, month] = k.split("::");
      out.set(k, { ...last, month, year });
    }
  }
  return out;
}

export function parseProgressXlsx(buf: ArrayBuffer): MonthRecord[] {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheet = wb.Sheets["รวม"] ?? wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("ชีตว่าง");
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }) as Row[];
  const blocks = collectBlocks(rows);

  const mab = pick(blocks, (n) => n.includes("มาบกะเบา") && n.includes("อาณัติสัญญาณ"));
  const kk = pick(blocks, (n) => n.includes("ช่วงขอนแก่น-หนองคาย") || n.includes("ช่วงขอนแก่น–หนองคาย"));
  const denC1 = pick(blocks, (n) => n.includes("ช่วงเด่นชัย-งาว") || n.includes("ช่วงเด่นชัย–งาว"));
  const denC2 = pick(blocks, (n) => n.includes("ช่วงงาว-เชียงราย") || n.includes("ช่วงงาว–เชียงราย"));
  const denC3 = pick(blocks, (n) => n.includes("ช่วงเชียงราย-เชียงของ") || n.includes("ช่วงเชียงราย–เชียงของ"));
  const den = pick(blocks, (n) => n.includes("เด่นชัย") && n.includes("สรุปผล"));
  const banC1 = pick(blocks, (n) => n.includes("ช่วงบ้านไผ่-หนองพอก") || n.includes("ช่วงบ้านไผ่–หนองพอก"));
  const banC2 = pick(blocks, (n) => n.includes("หนองพอก-สะพาน") || n.includes("หนองพอก–สะพาน"));
  const ban = pick(blocks, (n) => n.includes("บ้านไผ่") && n.includes("สรุปผล"));

  const keys = new Set<string>();
  for (const series of [mab, kk, den, denC1, denC2, denC3, ban, banC1, banC2]) {
    for (const p of series) keys.add(keyOf(p.month, p.year));
  }
  const orderedAll = sortKeys([...keys]);
  const nativeEnds = [mab, kk, den, denC1, denC2, denC3, ban, banC1, banC2]
    .map((s) => (s.length ? keyOf(s[s.length - 1].month, s[s.length - 1].year) : null))
    .filter((k): k is string => Boolean(k));
  const end = sortKeys(nativeEnds).at(-1);
  const ordered = end
    ? orderedAll.filter((k) => sortKeys([k, end]).at(-1) === end)
    : orderedAll;
  if (!ordered.length) throw new Error("ไม่พบแถวความคืบหน้าในชีต");

  const filled = {
    mab: fill(indexPoints(mab), ordered),
    kk: fill(indexPoints(kk), ordered),
    den: fill(indexPoints(den), ordered),
    denC1: fill(indexPoints(denC1), ordered),
    denC2: fill(indexPoints(denC2), ordered),
    denC3: fill(indexPoints(denC3), ordered),
    ban: fill(indexPoints(ban), ordered),
    banC1: fill(indexPoints(banC1), ordered),
    banC2: fill(indexPoints(banC2), ordered),
  };

  const field = (p: Point | undefined, digits = 3): string =>
    p ? fmtFixed(p.actual, digits) : "0";
  const delta = (p: Point | undefined, digits = 3): string =>
    p ? String(Number(p.delta.toFixed(digits))) : "0";

  return ordered.map((k) => {
    const [year, month] = k.split("::");
    const rec: MonthRecord = {
      month,
      year,
      phase1Complete: "100",
      mabkaba: field(filled.mab.get(k)),
      khonkaenNongkhai: field(filled.kk.get(k)),
      khonkaenYear: "2571",
      denchaiOverall: field(filled.den.get(k)),
      denchaiOpenYear: "2571",
      denchaiC1: field(filled.denC1.get(k)),
      denchaiC2: field(filled.denC2.get(k)),
      denchaiC3: field(filled.denC3.get(k)),
      banphaiOverall: field(filled.ban.get(k)),
      banphaiOpenYear: "2572",
      banphaiC1: field(filled.banC1.get(k)),
      banphaiC2: field(filled.banC2.get(k)),
      deltas: {
        mabkaba: delta(filled.mab.get(k)),
        khonkaenNongkhai: delta(filled.kk.get(k)),
        denchaiOverall: delta(filled.den.get(k)),
        denchaiC1: delta(filled.denC1.get(k)),
        denchaiC2: delta(filled.denC2.get(k)),
        denchaiC3: delta(filled.denC3.get(k)),
        banphaiOverall: delta(filled.ban.get(k)),
        banphaiC1: delta(filled.banC1.get(k)),
        banphaiC2: delta(filled.banC2.get(k)),
      },
    };
    return rec;
  });
}
