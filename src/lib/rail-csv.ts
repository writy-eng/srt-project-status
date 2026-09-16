import { CSV_COLUMNS, type MonthRecord } from "./rail-model";
import { latestRecord, recKey, sortRecords } from "./rail-fn";

export function recordsToCsv(records: MonthRecord[]): string {
  const header = CSV_COLUMNS.map((c) => c.header).join(",");
  const lines = sortRecords(records).map((row) =>
    CSV_COLUMNS.map((c) => {
      const value = c.key === "month" || c.key === "year" ? row[c.key] : row[c.key];
      return `"${String(value).replaceAll('"', '""')}"`;
    }).join(","),
  );
  return [header, ...lines].join("\n");
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function csvToRecords(text: string, fallback: MonthRecord[]): MonthRecord[] | { error: string } {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { error: "ไฟล์ว่างหรือมีแค่หัวตาราง" };

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const idx = (name: string) => header.findIndex((h) => h === name || h.includes(name));

  const col = {
    month: idx("เดือน"),
    year: idx("ปี"),
    mabkaba: idx("มาบกะเบา"),
    khonkaenNongkhai: idx("ขอนแก่น"),
    khonkaenYear: idx("ปีแล้วเสร็จ"),
    denchaiOverall: idx("เด่นชัย รวม") >= 0 ? idx("เด่นชัย รวม") : idx("เด่นชัย"),
    denchaiC1: idx("ส.1") >= 0 && idx("เด่นชัย ส.1") >= 0 ? idx("เด่นชัย ส.1") : header.findIndex((h) => h.includes("เด่นชัย") && h.includes("ส.1")),
    denchaiC2: header.findIndex((h) => h.includes("เด่นชัย") && h.includes("ส.2")),
    denchaiC3: header.findIndex((h) => h.includes("เด่นชัย") && h.includes("ส.3")),
    denchaiOpenYear: header.findIndex((h) => h.includes("ปีเปิด") && h.includes("เด่นชัย")),
    banphaiOverall: header.findIndex((h) => h.includes("บ้านไผ่") && (h.includes("รวม") || h === "บ้านไผ่")),
    banphaiC1: header.findIndex((h) => h.includes("บ้านไผ่") && h.includes("ส.1")),
    banphaiC2: header.findIndex((h) => h.includes("บ้านไผ่") && h.includes("ส.2")),
    banphaiOpenYear: header.findIndex((h) => h.includes("ปีเปิด") && h.includes("บ้านไผ่")),
  };

  if (col.month < 0 || col.year < 0) return { error: "ต้องมีคอลัมน์เดือนและปี" };

  const byKey = new Map(fallback.map((r) => [recKey(r.month, r.year), r]));
  const cell = (cells: string[], i: number, fb: string) => (i >= 0 && cells[i] != null && cells[i] !== "" ? cells[i].trim() : fb);

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const month = cells[col.month]?.trim();
    const year = cells[col.year]?.trim();
    if (!month || !year) continue;
    const prev = byKey.get(recKey(month, year)) ?? latestRecord(fallback);
    const next: MonthRecord = {
      ...prev,
      month,
      year,
      mabkaba: cell(cells, col.mabkaba, prev.mabkaba),
      khonkaenNongkhai: cell(cells, col.khonkaenNongkhai, prev.khonkaenNongkhai),
      khonkaenYear: cell(cells, col.khonkaenYear, prev.khonkaenYear),
      denchaiOverall: cell(cells, col.denchaiOverall, prev.denchaiOverall),
      denchaiC1: cell(cells, col.denchaiC1, prev.denchaiC1),
      denchaiC2: cell(cells, col.denchaiC2, prev.denchaiC2),
      denchaiC3: cell(cells, col.denchaiC3, prev.denchaiC3),
      denchaiOpenYear: cell(cells, col.denchaiOpenYear, prev.denchaiOpenYear),
      banphaiOverall: cell(cells, col.banphaiOverall, prev.banphaiOverall),
      banphaiC1: cell(cells, col.banphaiC1, prev.banphaiC1),
      banphaiC2: cell(cells, col.banphaiC2, prev.banphaiC2),
      banphaiOpenYear: cell(cells, col.banphaiOpenYear, prev.banphaiOpenYear),
      deltas: { ...prev.deltas },
    };
    byKey.set(recKey(month, year), next);
  }

  return sortRecords([...byKey.values()]);
}
