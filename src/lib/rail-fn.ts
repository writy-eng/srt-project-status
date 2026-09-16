import { MONTHS, MONTH_ABBR, type FieldKey, type MonthRecord, type PctKey, type PeriodMode, type Tone } from "./rail-model";
import { BUNDLED } from "./rail-data";

export function num(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function pct(value: string | undefined): string {
  return num(value).toFixed(3);
}

export function toneOf(delta: number): Tone {
  if (Math.abs(delta) < 5e-4) return "even";
  return delta > 0 ? "ahead" : "behind";
}

export function deltaCopy(delta: number): { text: string; tone: Tone; caption: string } {
  const tone = toneOf(delta);
  if (tone === "even") return { text: "0.000", tone, caption: "ตามแผน" };
  if (tone === "ahead") return { text: `+${delta.toFixed(3)}`, tone, caption: "เร็วกว่าแผน" };
  return { text: delta.toFixed(3), tone, caption: "ช้ากว่าแผน" };
}

export function posterDelta(delta: number): { text: string; tone: Tone; caption: string } {
  const tone = toneOf(delta);
  if (tone === "even") return { text: "0.000", tone, caption: "ตามแผน" };
  if (tone === "ahead") return { text: `+${delta.toFixed(3)}`, tone, caption: "เร็วกว่าแผน" };
  return { text: delta.toFixed(3), tone, caption: "ช้ากว่าแผน" };
}

export function bangkokClock(): string {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

export function recKey(month: string, year: string): string {
  return `${year}::${month}`;
}

export function monthIndex(month: string): number {
  return MONTHS.indexOf(month as (typeof MONTHS)[number]);
}

export function stepMonth(month: string, year: string, dir: 1 | -1): { month: string; year: string } {
  const i = monthIndex(month);
  if (i < 0) return { month, year };
  const next = i + dir;
  if (next > 11) return { month: MONTHS[0], year: String(Number(year) + 1) };
  if (next < 0) return { month: MONTHS[11], year: String(Number(year) - 1) };
  return { month: MONTHS[next], year };
}

export function gregorianYear(be: string): number {
  return Number(be) - 543;
}

export function daysInMonth(month: string, year: string): number {
  const mi = monthIndex(month);
  if (mi < 0 || !Number.isFinite(Number(year))) return 30;
  return new Date(Date.UTC(gregorianYear(year), mi + 1, 0)).getUTCDate();
}

export function weeksInMonth(month: string, year: string): number {
  return Math.ceil(daysInMonth(month, year) / 7);
}

export function clampWeek(month: string, year: string, week: number): number {
  const max = weeksInMonth(month, year);
  if (!Number.isFinite(week) || week < 1) return max;
  return Math.min(Math.trunc(week), max);
}

export function weekEndDay(month: string, year: string, week: number): number {
  const last = daysInMonth(month, year);
  return Math.min(clampWeek(month, year, week) * 7, last);
}

export function periodOverlay(
  mode: PeriodMode,
  month: string,
  year: string,
  week: number,
): string {
  if (mode === "week") {
    const day = weekEndDay(month, year, week);
    const abbr = MONTH_ABBR[month as keyof typeof MONTH_ABBR] ?? month;
    return `รายสัปดาห์ ${day} ${abbr} ${year}`;
  }
  return `รายเดือน ${month} ${year}`;
}

export function sortRecords(records: MonthRecord[]): MonthRecord[] {
  return [...records].sort((a, b) => {
    const dy = Number(a.year) - Number(b.year);
    if (dy !== 0) return dy;
    return monthIndex(a.month) - monthIndex(b.month);
  });
}

export function latestRecord(records: MonthRecord[]): MonthRecord {
  const sorted = sortRecords(records);
  return sorted[sorted.length - 1] ?? BUNDLED[BUNDLED.length - 1];
}

export function findRecord(
  records: MonthRecord[],
  month: string,
  year: string,
): MonthRecord | undefined {
  return records.find((r) => r.month === month && r.year === year);
}

export function yearsIn(records: MonthRecord[]): string[] {
  return [...new Set(records.map((r) => r.year))].sort();
}

export function monthsInYear(records: MonthRecord[], year: string): string[] {
  return sortRecords(records.filter((r) => r.year === year)).map((r) => r.month);
}

export function bangkokToday(): { day: string; month: string; year: string; label: string } {
  const parts = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  const day = parts.day ?? "4";
  const month = parts.month ?? "กันยายน";
  const year = parts.year ?? "2569";
  return { day, month, year, label: `${day} ${month} ${year}` };
}

export function frozenStreak(
  records: MonthRecord[],
  current: MonthRecord,
  field: PctKey,
): number {
  const sorted = sortRecords(records);
  const idx = sorted.findIndex((r) => r.month === current.month && r.year === current.year);
  if (idx < 0) return 1;
  const value = current[field];
  let n = 0;
  for (let i = idx; i >= 0; i -= 1) {
    if (sorted[i][field] === value) n += 1;
    else break;
  }
  return n;
}

export function fieldValue(record: MonthRecord, key: FieldKey): string {
  return record[key];
}

export function fieldDelta(record: MonthRecord, key: PctKey): number {
  return num(record.deltas[key]);
}

export function planPct(actual: number, delta: number): number {
  return actual - delta;
}

export function fmt2(n: number): string {
  return n.toFixed(2);
}

export function fmt3(n: number): string {
  return n.toFixed(3);
}

export function fmtPct(n: number): string {
  const three = n.toFixed(3);
  return three.endsWith("0") ? n.toFixed(2) : three;
}

export function pair(record: MonthRecord, key: PctKey): { actual: number; plan: number } {
  const actual = num(record[key]);
  return { actual, plan: planPct(actual, fieldDelta(record, key)) };
}

export function previousRecord(
  records: MonthRecord[],
  month: string,
  year: string,
): MonthRecord | undefined {
  const prev = stepMonth(month, year, -1);
  return findRecord(records, prev.month, prev.year);
}

export function weekT(month: string, year: string, week: number): number {
  const n = weeksInMonth(month, year);
  return n <= 0 ? 1 : clampWeek(month, year, week) / n;
}

export function weekPair(
  records: MonthRecord[],
  month: string,
  year: string,
  week: number,
  key: PctKey,
): { actual: number; plan: number } | null {
  const current = findRecord(records, month, year);
  if (!current) return null;
  const t = weekT(month, year, week);
  const cur = pair(current, key);
  const prev = previousRecord(records, month, year);
  if (!prev) {
    return { actual: cur.actual * t, plan: cur.plan * t };
  }
  const before = pair(prev, key);
  return {
    actual: before.actual + (cur.actual - before.actual) * t,
    plan: before.plan + (cur.plan - before.plan) * t,
  };
}
