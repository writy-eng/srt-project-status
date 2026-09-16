import { PROJECTS, deltaCopy, fieldDelta, num, pct, type MonthRecord } from "@/lib/rail";

const TONES = {
  mab: "var(--color-track-mab)",
  kk: "var(--color-track-kk)",
  den: "var(--color-track-den)",
  ban: "var(--color-track-ban)",
} as const;

export function TrackDiagram({ current }: { current: MonthRecord }) {
  return (
    <section className="mt-14" aria-labelledby="diagram-title">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-kicker font-semibold uppercase tracking-[0.22em] text-muted">แผนผังขบวน</p>
          <h2 id="diagram-title" className="mt-1 font-display text-display text-ink">
            สี่สาย หนึ่งรายงาน
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-muted md:block">
          เส้นเติมจากสถานีต้นทางลงมาตามเปอร์เซ็นต์ · สีสถานะที่ตัวเลขบอกเร็ว/ช้ากว่าแผน
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {PROJECTS.map((project) => {
          const value = Math.min(100, Math.max(0, num(current[project.overallKey])));
          const d = deltaCopy(fieldDelta(current, project.overallKey));
          const fill = TONES[project.id];
          return (
            <article key={project.id} className="flex flex-col rounded-lg bg-paper px-4 py-5 shadow-issue">
              <p className="text-kicker font-semibold uppercase tracking-[0.18em] text-muted">{project.kicker}</p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">{project.title}</h3>
              <p className="mt-1 text-xs text-muted">{project.hint}</p>
              <div className="relative mt-5 h-52">
                <div className="absolute bottom-8 left-1.5 top-1 w-px bg-rule" />
                <div
                  className="absolute left-1.5 top-1 w-0.5 rounded-full"
                  style={{ height: `${Math.max(6, value) * 0.72}%`, background: fill }}
                />
                <ol className="flex h-[calc(100%-2rem)] flex-col justify-between">
                  {project.stations.map((station, i) => {
                    const atEnd = i === project.stations.length - 1;
                    const reached = (i / Math.max(project.stations.length - 1, 1)) * 100 <= value;
                    return (
                      <li key={station} className="flex items-center gap-2.5">
                        <span
                          className="relative z-10 size-2.5 shrink-0 rounded-full"
                          style={{
                            background: reached || atEnd ? fill : "var(--color-paper)",
                            boxShadow: `0 0 0 2px ${fill}`,
                          }}
                        />
                        <span className="text-xs font-medium text-ink">{station}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <p className="font-display text-2xl font-extrabold italic tabular-nums text-maroon">
                {pct(current[project.overallKey])}
                <span className="ml-0.5 text-base not-italic">%</span>
              </p>
              <p className={`text-xs font-semibold tabular-nums delta-${d.tone}`}>
                {d.text} {d.caption}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
