import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Printer,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { downloadPosterPng } from "@/components/srt-poster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  MONTHS,
  MONTH_ABBR,
  PROJECTS,
  SOURCE_NAME,
  bangkokToday,
  monthsInYear,
  weekEndDay,
  weeksInMonth,
  yearsIn,
  type FieldKey,
} from "@/lib/rail";
import { useRail } from "@/lib/store";

export function BoardBar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const month = useRail((s) => s.month);
  const year = useRail((s) => s.year);
  const periodMode = useRail((s) => s.periodMode);
  const week = useRail((s) => s.week);
  const notice = useRail((s) => s.notice);
  const syncedAt = useRail((s) => s.syncedAt);
  const records = useRail((s) => s.records);
  const select = useRail((s) => s.select);
  const step = useRail((s) => s.step);
  const stepYear = useRail((s) => s.stepYear);
  const setPeriodMode = useRail((s) => s.setPeriodMode);
  const setWeek = useRail((s) => s.setWeek);
  const stepWeek = useRail((s) => s.stepWeek);
  const reset = useRail((s) => s.reset);
  const syncSheet = useRail((s) => s.syncSheet);
  const downloadCsv = useRail((s) => s.downloadCsv);
  const uploadCsv = useRail((s) => s.uploadCsv);
  const pulling = useRail((s) => s.pulling);
  const years = yearsIn(records);
  const months = monthsInYear(records, year);
  const weekCount = weeksInMonth(month, year);
  const today = bangkokToday();
  const weekLabel = `สัปดาห์ที่ ${week} · ${weekEndDay(month, year, week)} ${MONTH_ABBR[month as keyof typeof MONTH_ABBR] ?? month}`;

  return (
    <section className="no-print" aria-label="แผงควบคุม">
      <header className="board-head">
        <div className="board-brand">
          <img src="/srt-logo.png" alt="" />
          <div className="min-w-0">
            <h1 className="board-mark">สถานะโครงการรถไฟ</h1>
            <p className="mt-1 text-sm text-muted">
              ภาพรวมทางคู่ · {periodMode === "week" ? weekLabel : `${month} ${year}`}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted">{today.label}</p>
          </div>
        </div>
      </header>

      <div className="control-desk">
        <div className="control-toolbar">
          <p className="text-muted">
            {syncedAt ? `ซิงก์แล้ว ${syncedAt}` : SOURCE_NAME}
            {notice ? ` · ${notice}` : ""}
          </p>
          <div className="control-actions">
            <Button variant="solid" onClick={() => void downloadPosterPng()}>
              <Download /> ดาวน์โหลด PNG
            </Button>
            <Button onClick={() => window.print()}>
              <Printer /> พิมพ์
            </Button>
            <Button onClick={() => void syncSheet()} disabled={pulling}>
              <RefreshCw /> {pulling ? "กำลังดึง…" : "ดึงชีต"}
            </Button>
            <Button onClick={reset}>
              <RotateCcw /> คืนค่า
            </Button>
            <Button onClick={downloadCsv}>
              <Download /> CSV
            </Button>
            <Button onClick={() => fileRef.current?.click()}>
              <FileUp /> อัปโหลด
            </Button>
          </div>
        </div>

        <div className="nav-block">
          <p className="nav-label">ปีงบประมาณ</p>
          <div className="nav-row">
            <Button size="sm" className="nav-step" onClick={() => stepYear(-1)} aria-label="ปีก่อน">
              <ChevronLeft />
            </Button>
            <div className="nav-chips">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={cn("chip", y === year && "is-active")}
                  onClick={() => select(month, y)}
                >
                  {y}
                </button>
              ))}
            </div>
            <Button size="sm" className="nav-step" onClick={() => stepYear(1)} aria-label="ปีถัดไป">
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="nav-block">
          <p className="nav-label">เดือน</p>
          <div className="nav-row">
            <Button size="sm" className="nav-step" onClick={() => step(-1)} aria-label="เดือนก่อน">
              <ChevronLeft />
            </Button>
            <div className="grid min-w-0 grid-cols-6 gap-1.5">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={cn("chip text-xs", m === month && "is-active", months.includes(m) && "has-data")}
                  onClick={() => select(m, year)}
                >
                  {MONTH_ABBR[m]}
                </button>
              ))}
            </div>
            <Button size="sm" className="nav-step" onClick={() => step(1)} aria-label="เดือนถัดไป">
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="nav-block">
          <p className="nav-label">ช่วงรายงาน</p>
          <div className="period-switch" role="group" aria-label="ช่วงรายงาน">
            <button
              type="button"
              className={cn("chip", periodMode === "month" && "is-active")}
              onClick={() => setPeriodMode("month")}
            >
              รายเดือน
            </button>
            <button
              type="button"
              className={cn("chip", periodMode === "week" && "is-active")}
              onClick={() => setPeriodMode("week")}
            >
              รายสัปดาห์
            </button>
          </div>
        </div>

        {periodMode === "week" ? (
          <div className="nav-row">
            <Button size="sm" className="nav-step" onClick={() => stepWeek(-1)} aria-label="สัปดาห์ก่อน">
              <ChevronLeft />
            </Button>
            <div className="grid min-w-0 grid-cols-5 gap-1.5">
              {Array.from({ length: weekCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={cn("chip text-xs", n === week && "is-active")}
                  onClick={() => setWeek(n)}
                >
                  ส.{n}
                </button>
              ))}
            </div>
            <Button size="sm" className="nav-step" onClick={() => stepWeek(1)} aria-label="สัปดาห์ถัดไป">
              <ChevronRight />
            </Button>
          </div>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void file.text().then(uploadCsv);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}

export function EditPanel() {
  const month = useRail((s) => s.month);
  const year = useRail((s) => s.year);
  const current = useRail((s) => s.current());
  const update = useRail((s) => s.update);

  return (
    <section className="no-print edit-desk" aria-labelledby="edit-title">
      <div className="mb-4">
        <p className="text-kicker font-semibold tracking-[0.16em] text-muted">แก้เปอร์เซ็นต์เดือนนี้</p>
        <h2 id="edit-title" className="mt-1 font-display text-xl font-semibold text-ink">
          {month} {year}
        </h2>
      </div>
      <div className="edit-grid">
        {PROJECTS.map((project) => (
          <div key={project.id} className="edit-project">
            <h3 className="font-display text-sm font-semibold leading-snug text-ink">{project.title}</h3>
            <p className="mb-3 text-xs text-muted">{project.hint}</p>
            <div className="edit-fields">
              {project.contracts.map((field) => (
                <label key={field.key} className="text-xs font-medium text-muted">
                  {field.label}
                  {field.hint ? <span className="ml-1 font-normal">({field.hint})</span> : null}
                  <span className="relative mt-1 block">
                    <input
                      className="desk-input pr-7"
                      inputMode="decimal"
                      value={current[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      aria-label={`${project.title} ${field.label}`}
                    />
                    <i className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 not-italic text-muted">
                      %
                    </i>
                  </span>
                </label>
              ))}
              {project.yearKey ? (
                <label className="text-xs font-medium text-muted">
                  {project.yearLabel}
                  <input
                    className="desk-input mt-1"
                    inputMode="numeric"
                    value={current[project.yearKey]}
                    onChange={(e) => update(project.yearKey as FieldKey, e.target.value)}
                  />
                </label>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
