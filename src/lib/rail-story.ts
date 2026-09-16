import { PROJECTS, type MonthRecord, type Project } from "./rail-model";
import { deltaCopy, fieldDelta, frozenStreak, num, pct } from "./rail-fn";

export type CoverStory = {
  kicker: string;
  headline: string;
  dek: string;
  pull: string;
};

export function coverStory(records: MonthRecord[], current: MonthRecord): CoverStory {
  const ranked = PROJECTS.map((p) => ({
    project: p,
    pct: num(current[p.overallKey]),
    delta: fieldDelta(current, p.overallKey),
  })).sort((a, b) => b.pct - a.pct);

  const lead = ranked[0];
  const lag = ranked[ranked.length - 1];
  const mabFreeze = frozenStreak(records, current, "mabkaba");
  const banC2 = deltaCopy(fieldDelta(current, "banphaiC2"));
  const issue = `${current.month} ${current.year}`;

  return {
    kicker: `ฉบับ ${issue} · Alternative Editorial Edition`,
    headline: "ขบวนที่ค้าง และขบวนที่ยังไปไม่ถึง",
    dek: `${lead.project.title} นำอยู่ที่ ${pct(String(lead.pct))} เปอร์เซ็นต์ ขณะที่${lag.project.title} เพิ่ง ${pct(String(lag.pct))} — มาบกะเบาค้างตัวเลขเดิม ${mabFreeze} เดือน และบ้านไผ่สัญญา 2 ${banC2.caption} ${banC2.text} จุด`,
    pull: "สี่สาย หนึ่งแผ่นดิน — ความคืบหน้าไม่เดินเท่ากัน",
  };
}

export function projectEssay(
  project: Project,
  current: MonthRecord,
  records: MonthRecord[],
): { dek: string; paragraphs: string[] } {
  const overall = pct(current[project.overallKey]);
  const d = deltaCopy(fieldDelta(current, project.overallKey));
  const issue = `${current.month} ${current.year}`;

  if (project.id === "mab") {
    const freeze = frozenStreak(records, current, "mabkaba");
    return {
      dek: `ความคืบหน้า ${overall}% · ${d.caption} ${d.text}`,
      paragraphs: [
        `สายมาบกะเบา–ถนนจิระคือขบวนพี่ของชุดนี้ เปิดหน้างานก่อนใครในกลุ่มทางคู่อีสาน และตัวเลขสะสมเดินมาถึง ${overall} เปอร์เซ็นต์ในฉบับ ${issue} — ${d.caption} ${d.text} จุด`,
        freeze >= 3
          ? `สิ่งที่กองบรรณาธิการจับตาไม่ใช่จังหวะเร่ง แต่จังหวะนิ่ง ตัวเลข ${overall} ถูกส่งมาแล้ว ${freeze} เดือนติดต่อกัน ราวกับว่าขบวนนี้เข้าช่วงเก็บงาน — ความคืบหน้ายังมี แต่ไม่ขยับในรายงานประจำเดือน`
          : `ต่างจากสายอื่นที่ตัวเลขกระโดดเป็นรายเดือน สายนี้เดินแบบค่อยเป็นค่อยไป ผลงานสะสมชัดเจนเพราะเริ่มนับหนึ่งตั้งแต่ พ.ศ. 2563`,
        "ในแผนที่อีสาน สายนี้คือกระดูกสันหลังช่วงโคราช เชื่อมมาบกะเบาผ่านสีคิ้วเข้าถนนจิระ — เมื่อขบวนพี่ชะลอ การอ่านทั้งเครือข่ายจึงต้องอ่านจากสายอื่นประกอบ",
      ],
    };
  }

  if (project.id === "kk") {
    const open = current.khonkaenYear;
    return {
      dek: `ความคืบหน้า ${overall}% · แล้วเสร็จ พ.ศ. ${open} · ${d.caption} ${d.text}`,
      paragraphs: [
        `ขอนแก่น–หนองคายคือขบวนที่เพิ่งออกจากสถานี ในฉบับ ${issue} ความคืบหน้าอยู่ที่ ${overall} เปอร์เซ็นต์ — ${d.caption} ${d.text} จุด เป้าหมายแล้วเสร็จ พ.ศ. ${open}`,
        "สายนี้คือประตูสู่แม่น้ำโขง ผ่านอุดรธานีสู่หนองคาย จุดหมายไม่ใช่แค่เมืองชายแดน แต่เป็นจุดต่อกับลาวและโครงข่ายรถไฟภูมิภาค",
        "เพราะเพิ่งขยับจากศูนย์ในรอบปีที่แล้ว ทุกจุดเปอร์เซ็นต์จึงมีน้ำหนัก ขบวนใหม่ต้องถูกอ่านด้วยมาตรวัดคนละชุดกับขบวนพี่ที่ทำมาเจ็ดปี",
      ],
    };
  }

  if (project.id === "den") {
    const open = current.denchaiOpenYear;
    const c1 = deltaCopy(fieldDelta(current, "denchaiC1"));
    const c2 = deltaCopy(fieldDelta(current, "denchaiC2"));
    const c3 = deltaCopy(fieldDelta(current, "denchaiC3"));
    return {
      dek: `รวม ${overall}% · เปิด พ.ศ. ${open} · ${d.caption} ${d.text}`,
      paragraphs: [
        `เด่นชัย–เชียงราย–เชียงของเป็นสายนำของฉบับนี้ ที่ ${overall} เปอร์เซ็นต์ ใกล้เป้าเปิด พ.ศ. ${open} มากที่สุดในสี่โครงการ — รวมแล้วยัง${d.caption} ${d.text} จุด`,
        `สามสัญญาไม่ได้เดินเท่ากัน ส.1 เด่นชัย–งาว ${pct(current.denchaiC1)}% (${c1.caption} ${c1.text}) · ส.2 งาว–เชียงราย ${pct(current.denchaiC2)}% (${c2.caption} ${c2.text}) · ส.3 เชียงราย–เชียงของ ${pct(current.denchaiC3)}% (${c3.caption} ${c3.text})`,
        "ภูเขาฝ่ายเหนือทำให้ทุกช่วงสะพานมีราคาแพงทั้งเวลาและงบ เชียงของคือปากประตูโขงอีกแห่ง — ถ้าสายนี้เปิดตามปี ขบวนเหนือจะเปลี่ยนนิยามระยะทางของเชียงรายทั้งจังหวัด",
      ],
    };
  }

  const open = current.banphaiOpenYear;
  const c1 = deltaCopy(fieldDelta(current, "banphaiC1"));
  const c2 = deltaCopy(fieldDelta(current, "banphaiC2"));
  return {
    dek: `รวม ${overall}% · เปิด พ.ศ. ${open} · ${d.caption} ${d.text}`,
    paragraphs: [
      `บ้านไผ่–นครพนมคือขบวนไกล ตัดผ่านที่ราบอีสานตะวันออกสู่แม่น้ำโขงที่นครพนม ในฉบับ ${issue} รวมอยู่ที่ ${overall} เปอร์เซ็นต์ — ${d.caption} ${d.text} จุด เป้าเปิด พ.ศ. ${open}`,
      `สองสัญญาเล่าคนละเรื่อง ส.1 ช่วงตะวันตก ${pct(current.banphaiC1)}% (${c1.caption} ${c1.text}) ขณะที่ ส.2 ช่วงตะวันออก ${pct(current.banphaiC2)}% (${c2.caption} ${c2.text}) — ช่องว่างนี้คือประเด็นของฉบับ`,
      "ถ้ารางคู่คือการย่นระยะ ช่วงตะวันออกที่ยังตามอยู่คือระยะที่ยังไม่ถูกย่น นครพนมจะไม่ใกล้ขึ้น จนกว่าสัญญา 2 จะเดินให้ทันสัญญา 1",
    ],
  };
}
