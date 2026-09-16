import { create } from "zustand";
import {
  BUNDLED,
  SOURCE_NAME,
  bangkokClock,
  clampWeek,
  csvToRecords,
  findRecord,
  latestRecord,
  recordsToCsv,
  sortRecords,
  stepMonth,
  weeksInMonth,
  type FieldKey,
  type MonthRecord,
  type PeriodMode,
} from "@/lib/rail";
import { pullProgressSheet } from "@/lib/pull-sheet";

type RailState = {
  records: MonthRecord[];
  month: string;
  year: string;
  periodMode: PeriodMode;
  week: number;
  notice: string | null;
  syncedAt: string;
  pulling: boolean;
  current: () => MonthRecord;
  select: (month: string, year: string) => void;
  step: (dir: 1 | -1) => void;
  stepYear: (dir: 1 | -1) => void;
  setPeriodMode: (mode: PeriodMode) => void;
  setWeek: (week: number) => void;
  stepWeek: (dir: 1 | -1) => void;
  update: (field: FieldKey, value: string) => void;
  reset: () => void;
  syncSheet: () => Promise<void>;
  downloadCsv: () => void;
  uploadCsv: (text: string) => void;
};

const seed = latestRecord(BUNDLED);

function cloneRecords(records: MonthRecord[]): MonthRecord[] {
  return records.map((r) => ({ ...r, deltas: { ...r.deltas } }));
}

export const useRail = create<RailState>((set, get) => ({
  records: cloneRecords(BUNDLED),
  month: seed.month,
  year: seed.year,
  periodMode: "month",
  week: weeksInMonth(seed.month, seed.year),
  notice: null,
  syncedAt: "",
  pulling: false,
  current: () => {
    const { records, month, year } = get();
    return findRecord(records, month, year) ?? latestRecord(records);
  },
  select: (month, year) => {
    const { records } = get();
    const hit = findRecord(records, month, year);
    if (hit) {
      set({
        month: hit.month,
        year: hit.year,
        week: clampWeek(hit.month, hit.year, get().week),
        notice: null,
      });
      return;
    }
    const inYear = sortRecords(records.filter((r) => r.year === year));
    const fallback = inYear[inYear.length - 1] ?? latestRecord(records);
    set({
      month: fallback.month,
      year: fallback.year,
      week: clampWeek(fallback.month, fallback.year, get().week),
      notice: `ยังไม่มีเดือน ${month} ${year} — เปิดเดือนล่าสุดของปีนั้น`,
    });
  },
  step: (dir) => {
    const { month, year, records } = get();
    let cursor = { month, year };
    for (let i = 0; i < 24; i += 1) {
      cursor = stepMonth(cursor.month, cursor.year, dir);
      const hit = findRecord(records, cursor.month, cursor.year);
      if (hit) {
        set({
          month: hit.month,
          year: hit.year,
          week: clampWeek(hit.month, hit.year, get().week),
          notice: null,
        });
        return;
      }
    }
  },
  stepYear: (dir) => {
    const { month, year, select } = get();
    select(month, String(Number(year) + dir));
  },
  setPeriodMode: (mode) => {
    const { month, year, week } = get();
    set({
      periodMode: mode,
      week: mode === "week" ? clampWeek(month, year, week || weeksInMonth(month, year)) : week,
    });
  },
  setWeek: (week) => {
    const { month, year } = get();
    set({ periodMode: "week", week: clampWeek(month, year, week) });
  },
  stepWeek: (dir) => {
    const { month, year, week } = get();
    const max = weeksInMonth(month, year);
    const next = week + dir;
    if (next < 1 || next > max) {
      get().step(dir);
      const after = get();
      set({
        periodMode: "week",
        week: dir > 0 ? 1 : weeksInMonth(after.month, after.year),
      });
      return;
    }
    set({ periodMode: "week", week: next });
  },
  update: (field, value) => {
    const { records, month, year } = get();
    set({
      records: records.map((row) =>
        row.month === month && row.year === year ? { ...row, [field]: value } : row,
      ),
      notice: "แก้ตัวเลขเดือนนี้แล้ว — ยังไม่เขียนทับไฟล์ต้นทาง",
    });
  },
  reset: () => {
    const { month, year } = get();
    const fresh = cloneRecords(BUNDLED);
    const hit = findRecord(fresh, month, year) ?? latestRecord(fresh);
    set({
      records: fresh,
      month: hit.month,
      year: hit.year,
      week: clampWeek(hit.month, hit.year, get().week),
      notice: `คืนค่าจาก ${SOURCE_NAME} แล้ว`,
    });
  },
  syncSheet: async () => {
    set({ pulling: true, notice: "กำลังดึงชีตจาก Dropbox…" });
    try {
      const records = await pullProgressSheet();
      const last = latestRecord(records);
      const clock = bangkokClock();
      set({
        records: cloneRecords(records),
        month: last.month,
        year: last.year,
        week: clampWeek(last.month, last.year, get().week),
        syncedAt: clock,
        pulling: false,
        notice: `${records.length} เดือนจากชีต Dropbox`,
      });
    } catch (err) {
      const clock = bangkokClock();
      const fresh = cloneRecords(BUNDLED);
      const last = latestRecord(fresh);
      set({
        records: fresh,
        month: last.month,
        year: last.year,
        week: clampWeek(last.month, last.year, get().week),
        syncedAt: clock,
        pulling: false,
        notice: `ดึงชีตไม่ผ่าน — ใช้ ${SOURCE_NAME} แทน (${err instanceof Error ? err.message : "error"})`,
      });
    }
  },
  downloadCsv: () => {
    const csv = recordsToCsv(get().records);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `สถานะโครงการรถไฟ-${get().year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    set({ notice: "ดาวน์โหลด CSV แล้ว" });
  },
  uploadCsv: (text) => {
    const parsed = csvToRecords(text, get().records);
    if ("error" in parsed) {
      set({ notice: parsed.error });
      return;
    }
    const last = latestRecord(parsed);
    set({
      records: parsed,
      month: last.month,
      year: last.year,
      syncedAt: bangkokClock(),
      notice: `อัปโหลดแล้ว ${parsed.length} เดือน · เปิดเดือนล่าสุด`,
    });
  },
}));
