import { useState } from "react";
import {
  MONTH_ABBR,
  PROJECTS,
  fieldDelta,
  num,
  sortRecords,
  toneOf,
  yearsIn,
  type MonthRecord,
  type PctKey,
  type Project,
} from "@/lib/rail";
import { cn } from "@/lib/cn";

function signed(delta: number): string {
  if (Math.abs(delta) < 5e-4) return "0";
  const n = delta.toFixed(1);
  return delta > 0 ? `+${n}` : n;
}

function PctCell({ row, field, overall }: { row: MonthRecord; field: PctKey; overall: boolean }) {
  const value = Math.min(100, Math.max(0, num(row[field])));
  const delta = fieldDelta(row, field);
  return (
    <td className={cn(overall && "is-overall")}>
      <strong className="ledger-pct">{value.toFixed(1)}%</strong>
      <div className="ledger-meter" aria-hidden="true">
        <i style={{ width: `${value}%` }} />
      </div>
      <em className={cn("ledger-delta", `is-${toneOf(delta)}`)}>{signed(delta)}</em>
    </td>
  );
}

function ProjectTable({
  project,
  records,
  current,
}: {
  project: Project;
  records: MonthRecord[];
  current: MonthRecord;
}) {
  const years = yearsIn(records);
  const [openYear, setOpenYear] = useState(current.year);
  const yearValue = project.yearKey ? String(current[project.yearKey] ?? "").trim() : "";
  const yearRows = records.filter((r) => r.year === openYear);

  return (
    <article className="ledger-card">
      <header className="ledger-head">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold text-ink">{project.title}</h3>
          <p className="text-sm text-muted">{project.hint}</p>
        </div>
        {project.yearKey ? (
          <p className="ledger-year">
            <span>{project.yearLabel}</span>
            <strong>{yearValue || "—"}</strong>
          </p>
        ) : null}
      </header>
      <div className="year-strip is-compact">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            className={cn("chip", year === openYear && "is-active")}
            onClick={() => setOpenYear(year)}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="source-table">
          <thead>
            <tr>
              <th>เดือน</th>
              {project.contracts.map((c) => (
                <th key={c.key} className={cn(c.key === project.overallKey && "is-overall")} title={c.hint}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortRecords(yearRows)
              .slice()
              .reverse()
              .map((row) => {
                const isCurrent = row.month === current.month && row.year === current.year;
                return (
                  <tr key={`${row.year}-${row.month}`} className={cn(isCurrent && "is-current")}>
                    <th scope="row">{MONTH_ABBR[row.month as keyof typeof MONTH_ABBR] ?? row.month}</th>
                    {project.contracts.map((c) => (
                      <PctCell key={c.key} row={row} field={c.key} overall={c.key === project.overallKey} />
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function SourceLedger({ records, current }: { records: MonthRecord[]; current: MonthRecord }) {
  return (
    <section className="mt-12" aria-labelledby="ledger-title">
      <div className="mb-6">
        <p className="text-kicker font-semibold uppercase tracking-[0.22em] text-muted">แหล่งข้อมูลความคืบหน้า</p>
        <h2 id="ledger-title" className="mt-1 font-display text-display text-ink">
          ตารางรายเดือน
        </h2>
        <p className="mt-2 text-sm text-muted">แท่งคือผลงาน · +/− คือเทียบแผน</p>
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        {PROJECTS.map((project) => (
          <ProjectTable key={project.id} project={project} records={records} current={current} />
        ))}
      </div>
    </section>
  );
}
