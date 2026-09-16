import { BoardBar, EditPanel } from "@/components/editors-desk";
import { SourceLedger } from "@/components/source-ledger";
import { SrtPoster } from "@/components/srt-poster";
import { TrendChart } from "@/components/trend-chart";
import { bangkokToday } from "@/lib/rail";
import { useRail } from "@/lib/store";

function Colophon() {
  const today = bangkokToday();
  return (
    <footer className="no-print mt-14 border-t border-rule pt-8 text-sm text-muted">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-display text-lg text-ink">สถานะโครงการรถไฟ</p>
          <p className="mt-1">ศูนย์โครงการก่อสร้าง · ฝ่ายโครงการพิเศษและก่อสร้าง</p>
        </div>
        <div className="md:text-right">
          <p>{today.label}</p>
          <p>ข้อมูลความคืบหน้าโครงการ</p>
        </div>
      </div>
    </footer>
  );
}

export function MagazinePage() {
  const records = useRail((s) => s.records);
  const current = useRail((s) => s.current());

  return (
    <main className="issue-shell">
      <div className="issue-layout">
        <div className="issue-rail no-print">
          <BoardBar />
          <EditPanel />
        </div>
        <div className="issue-poster">
          <SrtPoster />
        </div>
      </div>
      <div className="issue-below no-print">
        <TrendChart records={records} current={current} />
        <SourceLedger records={records} current={current} />
        <Colophon />
      </div>
    </main>
  );
}
