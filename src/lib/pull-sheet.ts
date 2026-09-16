import { createServerFn } from "@tanstack/react-start";
import { DROPBOX_XLSX, type MonthRecord } from "@/lib/rail";
import { parseProgressXlsx } from "@/lib/parse-sheet";

export const pullProgressSheet = createServerFn({ method: "GET" }).handler(async (): Promise<MonthRecord[]> => {
  const url = DROPBOX_XLSX.replace("dl=0", "dl=1");
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`ดึงชีตไม่สำเร็จ (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  return parseProgressXlsx(buf);
});
