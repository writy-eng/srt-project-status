import {
  MONTHS,
  MONTH_ABBR,
  PROJECTS,
  fmtPct,
  monthsInYear,
  periodOverlay,
  posterDelta,
  weekEndDay,
  weekPair,
  weeksInMonth,
  yearsIn,
  type MonthRecord,
  type PctKey,
  type Project,
} from "@/lib/rail";
import { cn } from "@/lib/cn";
import { useRail } from "@/lib/store";

const RING_COLOR: Record<Project["id"], string> = {
  mab: "var(--color-track-mab)",
  kk: "var(--color-track-kk)",
  den: "var(--color-track-den)",
  ban: "var(--color-track-ban)",
};

function Ring({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="status-ring">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" className="status-ring-track" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          className="status-ring-value"
          style={{ stroke: color }}
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <strong>{fmtPct(value)}%</strong>
    </div>
  );
}

function MiniRing({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="status-mini">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" className="status-mini-track" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          className="status-mini-value"
          style={{ stroke: color }}
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <strong>{value <= 0 ? "—" : value >= 10 ? value.toFixed(0) : value.toFixed(1)}</strong>
    </div>
  );
}

function ProjectWeek({
  project,
  records,
  month,
  year,
  week,
}: {
  project: Project;
  records: MonthRecord[];
  month: string;
  year: string;
  week: number;
}) {
  const setWeek = useRail((s) => s.setWeek);
  const key = project.overallKey as PctKey;
  const color = RING_COLOR[project.id];
  const selected = weekPair(records, month, year, week, key);
  const weekCount = weeksInMonth(month, year);
  if (!selected) return null;
  const copy = posterDelta(selected.actual - selected.plan);

  return (
    <article className="status-card">
      <Ring value={selected.actual} color={color} />
      <h3>{project.title}</h3>
      <p>
        แผน {fmtPct(selected.plan)}% · ผล {fmtPct(selected.actual)}%
      </p>
      <span className={cn("status-delta", `is-${copy.tone}`)}>
        {copy.caption} {copy.text}%
      </span>
      <ol className="status-weeks">
        {Array.from({ length: weekCount }, (_, i) => i + 1).map((n) => {
          const pair = weekPair(records, month, year, n, key);
          return (
            <li key={n}>
              <button
                type="button"
                className={cn("status-month", n === week && "is-current")}
                onClick={() => setWeek(n)}
              >
                <MiniRing value={pair?.actual ?? 0} color={color} />
                <span>ส.{n}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

export function TrendChart({
  records,
  current,
}: {
  records: MonthRecord[];
  current: MonthRecord;
}) {
  const years = yearsIn(records);
  const months = monthsInYear(records, current.year);
  const select = useRail((s) => s.select);
  const week = useRail((s) => s.week);
  const setWeek = useRail((s) => s.setWeek);
  const weekCount = weeksInMonth(current.month, current.year);
  const label = periodOverlay("week", current.month, current.year, week);
  const day = weekEndDay(current.month, current.year, week);

  return (
    <section className="mt-12" aria-labelledby="trend-title">
      <div className="section-head">
        <p className="text-kicker font-semibold uppercase tracking-[0.22em] text-muted">กราฟสถานะ</p>
        <h2 id="trend-title" className="mt-1 font-display text-display text-ink">
          ความคืบหน้า · {label}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          ผลงานรายสัปดาห์ของเดือนที่เลือก · สิ้นสุดวันที่ {day}{" "}
          {MONTH_ABBR[current.month as keyof typeof MONTH_ABBR] ?? current.month} {current.year}
        </p>
      </div>

      <div className="status-pickers">
        <div className="nav-block">
          <p className="nav-label">ปีงบประมาณ</p>
          <div className="year-strip">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={cn("chip", y === current.year && "is-active")}
                onClick={() => select(current.month, y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="nav-block">
          <p className="nav-label">เดือน</p>
          <div className="year-strip is-compact is-months">
            {MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                className={cn(
                  "chip text-xs",
                  m === current.month && "is-active",
                  months.includes(m) && "has-data",
                )}
                onClick={() => select(m, current.year)}
              >
                {MONTH_ABBR[m]}
              </button>
            ))}
          </div>
        </div>
        <div className="nav-block">
          <p className="nav-label">สัปดาห์</p>
          <div className="year-strip is-compact is-weeks">
            {Array.from({ length: weekCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={cn("chip", n === week && "is-active")}
                onClick={() => setWeek(n)}
              >
                ส.{n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="status-grid">
        {PROJECTS.map((project) => (
          <ProjectWeek
            key={project.id}
            project={project}
            records={records}
            month={current.month}
            year={current.year}
            week={week}
          />
        ))}
      </div>
    </section>
  );
}
