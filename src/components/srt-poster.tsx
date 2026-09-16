import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/cn";
import { fieldDelta, fmt3, fmtPct, MONTH_ABBR, num, pair, periodOverlay, posterDelta, weekEndDay, type MonthRecord } from "@/lib/rail";
import { useRail } from "@/lib/store";

export const POSTER_W = 900;
export const POSTER_H = 1265;

function Ring({ value, icon }: { value: number; icon: "plan" | "work" }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="49" className="poster-donut-cover" />
        <circle cx="50" cy="50" r="40.5" fill="none" className="poster-donut-track" />
        <circle
          cx="50"
          cy="50"
          r="40.5"
          fill="none"
          className="poster-donut-value"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <img
        src={icon === "plan" ? "/icon-crane.png" : "/icon-train.png"}
        alt=""
        className="ov-ring-icon"
        width={40}
        height={40}
        crossOrigin="anonymous"
      />
    </>
  );
}

function PctBox({ label, value }: { label: string; value: number }) {
  return (
    <>
      <span>{label}</span>
      <strong>{fmtPct(value)}%</strong>
    </>
  );
}

function DeltaChip({ delta }: { delta: number }) {
  const copy = posterDelta(delta);
  return (
    <p className={cn("poster-delta", `is-${copy.tone}`)}>
      <span>{copy.caption}</span>
      <strong>
        {copy.text}
        <em>%</em>
      </strong>
    </p>
  );
}

function ContractStack({ items }: { items: { label: string; value: number }[] }) {
  return (
    <ul className="poster-contracts">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <strong>{fmt3(item.value)}%</strong>
        </li>
      ))}
    </ul>
  );
}

export async function downloadPosterPng() {
  const node = document.getElementById("srt-poster");
  if (!(node instanceof HTMLElement)) return;
  const wrap = node.parentElement;
  const prev = wrap?.style.transform ?? "";
  if (wrap) wrap.style.transform = "none";
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#efe6d8",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "สถานะโครงการรถไฟ.png";
    a.click();
  } finally {
    if (wrap) wrap.style.transform = prev;
  }
}

function PosterInner({ current }: { current: MonthRecord }) {
  const month = useRail((s) => s.month);
  const year = useRail((s) => s.year);
  const periodMode = useRail((s) => s.periodMode);
  const week = useRail((s) => s.week);
  const mab = pair(current, "mabkaba");
  const kk = pair(current, "khonkaenNongkhai");
  const den = pair(current, "denchaiOverall");
  const ban = pair(current, "banphaiOverall");

  return (
    <article id="srt-poster" className="srt-poster">
      <img
        src="/poster-base.jpg"
        alt=""
        className="poster-base"
        width={POSTER_W}
        height={POSTER_H}
        crossOrigin="anonymous"
      />

      {periodMode === "week" ? (
        <p className="ov ov-period is-week" style={{ left: 412.5, top: 77, width: 366.5, height: 34.5 }}>
          <span>รายสัปดาห์</span>
          <span>{weekEndDay(month, year, week)}</span>
          <span>{MONTH_ABBR[month as keyof typeof MONTH_ABBR] ?? month}</span>
          <span>{year}</span>
        </p>
      ) : (
        <p className="ov ov-period" style={{ left: 412.5, top: 77, width: 366.5, height: 34.5 }}>{periodOverlay(periodMode, month, year, week)}</p>
      )}

      <div className="ov ov-ring is-mab-plan" style={{ left: 51, top: 577, width: 99, height: 99 }}>
        <Ring value={mab.plan} icon="plan" />
      </div>
      <div className="ov ov-label is-mab-plan-box" style={{ left: 43, top: 683, width: 113, height: 49 }}>
        <PctBox label="แผนงาน" value={mab.plan} />
      </div>
      <div className="ov ov-chip is-mab-delta" style={{ left: 173, top: 603, width: 91, height: 56 }}>
        <DeltaChip delta={fieldDelta(current, "mabkaba")} />
      </div>
      <div className="ov ov-ring is-mab-work" style={{ left: 290, top: 577, width: 99, height: 99 }}>
        <Ring value={mab.actual} icon="work" />
      </div>
      <div className="ov ov-label is-mab-work-box" style={{ left: 283, top: 683, width: 113, height: 49 }}>
        <PctBox label="ผลงาน" value={mab.actual} />
      </div>

      <div className="ov ov-ring is-kk-plan" style={{ left: 487, top: 570, width: 98, height: 98 }}>
        <Ring value={kk.plan} icon="plan" />
      </div>
      <div className="ov ov-label is-kk-plan-box" style={{ left: 479.5, top: 679, width: 113, height: 49 }}>
        <PctBox label="แผนงาน" value={kk.plan} />
      </div>
      <div className="ov ov-chip is-kk-delta" style={{ left: 612, top: 594, width: 90, height: 56 }}>
        <DeltaChip delta={fieldDelta(current, "khonkaenNongkhai")} />
      </div>
      <div className="ov ov-ring is-kk-work" style={{ left: 726, top: 570, width: 98, height: 98 }}>
        <Ring value={kk.actual} icon="work" />
      </div>
      <div className="ov ov-label is-kk-work-box" style={{ left: 719.5, top: 679, width: 113, height: 49 }}>
        <PctBox label="ผลงาน" value={kk.actual} />
      </div>

      <div className="ov ov-ring is-compact is-den-plan" style={{ left: 49, top: 851, width: 80, height: 80 }}>
        <Ring value={den.plan} icon="plan" />
      </div>
      <div className="ov ov-label is-compact is-den-plan-box" style={{ left: 43, top: 933, width: 102, height: 38 }}>
        <PctBox label="แผนงาน" value={den.plan} />
      </div>
      <div className="ov ov-chip is-compact is-den-delta" style={{ left: 142, top: 870.5, width: 79, height: 45 }}>
        <DeltaChip delta={fieldDelta(current, "denchaiOverall")} />
      </div>
      <div className="ov ov-ring is-compact is-den-work" style={{ left: 230.5, top: 851, width: 80, height: 80 }}>
        <Ring value={den.actual} icon="work" />
      </div>
      <div className="ov ov-label is-compact is-den-work-box" style={{ left: 216, top: 933, width: 102, height: 38 }}>
        <PctBox label="ผลงาน" value={den.actual} />
      </div>
      <div className="ov ov-stack is-den-stack" style={{ left: 333, top: 840, width: 96, height: 130 }}>
        <ContractStack
          items={[
            { label: "สัญญา 1", value: num(current.denchaiC1) },
            { label: "สัญญา 2", value: num(current.denchaiC2) },
            { label: "สัญญา 3", value: num(current.denchaiC3) },
          ]}
        />
      </div>

      <div className="ov ov-ring is-compact is-ban-plan" style={{ left: 470, top: 845, width: 80, height: 80 }}>
        <Ring value={ban.plan} icon="plan" />
      </div>
      <div className="ov ov-label is-compact is-ban-plan-box" style={{ left: 467, top: 931, width: 102, height: 38 }}>
        <PctBox label="แผนงาน" value={ban.plan} />
      </div>
      <div className="ov ov-chip is-compact is-ban-delta" style={{ left: 569, top: 865, width: 81, height: 46 }}>
        <DeltaChip delta={fieldDelta(current, "banphaiOverall")} />
      </div>
      <div className="ov ov-ring is-compact is-ban-work" style={{ left: 664, top: 841, width: 80, height: 80 }}>
        <Ring value={ban.actual} icon="work" />
      </div>
      <div className="ov ov-label is-compact is-ban-work-box" style={{ left: 651, top: 931, width: 102, height: 38 }}>
        <PctBox label="ผลงาน" value={ban.actual} />
      </div>
      <div className="ov ov-stack is-ban-stack" style={{ left: 766, top: 859, width: 98, height: 94 }}>
        <ContractStack
          items={[
            { label: "สัญญา 1", value: num(current.banphaiC1) },
            { label: "สัญญา 2", value: num(current.banphaiC2) },
          ]}
        />
      </div>
    </article>
  );
}

export function SrtPoster() {
  const current = useRail((s) => s.current());
  const slotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const sync = () => setScale(el.clientWidth / POSTER_W);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="poster-wrap" aria-label="โปสเตอร์สถานะโครงการ">
      <div ref={slotRef} className="poster-slot" style={{ height: POSTER_H * scale }}>
        <div className="poster-scale" style={{ transform: `scale(${scale})` }}>
          <PosterInner current={current} />
        </div>
      </div>
    </section>
  );
}
