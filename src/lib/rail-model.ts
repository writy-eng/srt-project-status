export const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

export const MONTH_ABBR: Record<(typeof MONTHS)[number], string> = {
  มกราคม: "ม.ค.",
  กุมภาพันธ์: "ก.พ.",
  มีนาคม: "มี.ค.",
  เมษายน: "เม.ย.",
  พฤษภาคม: "พ.ค.",
  มิถุนายน: "มิ.ย.",
  กรกฎาคม: "ก.ค.",
  สิงหาคม: "ส.ค.",
  กันยายน: "ก.ย.",
  ตุลาคม: "ต.ค.",
  พฤศจิกายน: "พ.ย.",
  ธันวาคม: "ธ.ค.",
};

export const DROPBOX_XLSX =
  "https://www.dropbox.com/scl/fi/wivtf3aud4u9irpwkpiu2/Progress-27-08-2569.xlsx?rlkey=z1yugvxukv7i9r7rcnt7mz8ir&dl=0";

export const SOURCE_NAME = "Progress 27-08-2569";

export type Tone = "ahead" | "behind" | "even";

export type PeriodMode = "month" | "week";

export type MonthRecord = {
  month: string;
  year: string;
  phase1Complete: string;
  mabkaba: string;
  khonkaenNongkhai: string;
  khonkaenYear: string;
  denchaiOverall: string;
  denchaiOpenYear: string;
  denchaiC1: string;
  denchaiC2: string;
  denchaiC3: string;
  banphaiOverall: string;
  banphaiOpenYear: string;
  banphaiC1: string;
  banphaiC2: string;
  deltas: {
    mabkaba: string;
    khonkaenNongkhai: string;
    denchaiOverall: string;
    denchaiC1: string;
    denchaiC2: string;
    denchaiC3: string;
    banphaiOverall: string;
    banphaiC1: string;
    banphaiC2: string;
  };
};

export type PctKey =
  | "mabkaba"
  | "khonkaenNongkhai"
  | "denchaiOverall"
  | "denchaiC1"
  | "denchaiC2"
  | "denchaiC3"
  | "banphaiOverall"
  | "banphaiC1"
  | "banphaiC2";

export type YearKey = "khonkaenYear" | "denchaiOpenYear" | "banphaiOpenYear";

export type FieldKey = PctKey | YearKey;

export type ContractField = {
  key: PctKey;
  label: string;
  hint?: string;
};

export type Project = {
  id: "mab" | "kk" | "den" | "ban";
  title: string;
  english: string;
  hint: string;
  region: string;
  kicker: string;
  photo: string;
  photoAlt: string;
  stations: string[];
  overallKey: PctKey;
  yearKey: YearKey | null;
  yearLabel: string;
  contracts: ContractField[];
};

export const PROJECTS: Project[] = [
  {
    id: "mab",
    title: "มาบกะเบา–ถนนจิระ",
    english: "Map Kabao – Thanon Chira",
    hint: "ทางคู่สายอีสาน",
    region: "นครราชสีมา",
    kicker: "ขบวนพี่",
    photo: "/photos/mabkaba.jpg",
    photoAlt: "ทางคู่ผ่านที่ราบสูงอีสานช่วงมาบกะเบาถึงถนนจิระ",
    stations: ["มาบกะเบา", "สีคิ้ว", "นครราชสีมา", "ถนนจิระ"],
    overallKey: "mabkaba",
    yearKey: null,
    yearLabel: "",
    contracts: [{ key: "mabkaba", label: "ความคืบหน้า" }],
  },
  {
    id: "kk",
    title: "ขอนแก่น–หนองคาย",
    english: "Khon Kaen – Nong Khai",
    hint: "ทางคู่สายอีสาน",
    region: "ขอนแก่น · หนองคาย",
    kicker: "ขบวนใหม่",
    photo: "/photos/khonkaen.jpg",
    photoAlt: "งานก่อสร้างทางคู่มุ่งสู่หนองคายและแม่น้ำโขง",
    stations: ["ขอนแก่น", "อุดรธานี", "หนองคาย"],
    overallKey: "khonkaenNongkhai",
    yearKey: "khonkaenYear",
    yearLabel: "ปีแล้วเสร็จ",
    contracts: [{ key: "khonkaenNongkhai", label: "ความคืบหน้า" }],
  },
  {
    id: "den",
    title: "เด่นชัย–เชียงราย–เชียงของ",
    english: "Den Chai – Chiang Rai – Chiang Khong",
    hint: "สายเหนือ · 3 สัญญา",
    region: "แพร่ · เชียงราย",
    kicker: "ขบวนนำ",
    photo: "/photos/denchai.jpg",
    photoAlt: "สะพานรถไฟช่วงภูเขาฝ่ายเหนือสายเด่นชัย–เชียงของ",
    stations: ["เด่นชัย", "งาว", "เชียงราย", "เชียงของ"],
    overallKey: "denchaiOverall",
    yearKey: "denchaiOpenYear",
    yearLabel: "ปีเปิด",
    contracts: [
      { key: "denchaiOverall", label: "รวม" },
      { key: "denchaiC1", label: "ส.1", hint: "เด่นชัย–งาว" },
      { key: "denchaiC2", label: "ส.2", hint: "งาว–เชียงราย" },
      { key: "denchaiC3", label: "ส.3", hint: "เชียงราย–เชียงของ" },
    ],
  },
  {
    id: "ban",
    title: "บ้านไผ่–นครพนม",
    english: "Ban Phai – Nakhon Phanom",
    hint: "สายอีสาน · 2 สัญญา",
    region: "ขอนแก่น · นครพนม",
    kicker: "ขบวนไกล",
    photo: "/photos/banphai.jpg",
    photoAlt: "ทางรถไฟตัดผ่านที่ราบน้ำโขงมุ่งนครพนม",
    stations: ["บ้านไผ่", "มหาสารคาม", "ร้อยเอ็ด", "มุกดาหาร", "นครพนม"],
    overallKey: "banphaiOverall",
    yearKey: "banphaiOpenYear",
    yearLabel: "ปีเปิด",
    contracts: [
      { key: "banphaiOverall", label: "รวม" },
      { key: "banphaiC1", label: "ส.1", hint: "ช่วงตะวันตก" },
      { key: "banphaiC2", label: "ส.2", hint: "ช่วงตะวันออก" },
    ],
  },
];

export const CSV_COLUMNS: { key: FieldKey | "month" | "year"; header: string }[] = [
  { key: "month", header: "เดือน" },
  { key: "year", header: "ปี" },
  { key: "mabkaba", header: "มาบกะเบา" },
  { key: "khonkaenNongkhai", header: "ขอนแก่น–หนองคาย" },
  { key: "khonkaenYear", header: "ปีแล้วเสร็จ ขก." },
  { key: "denchaiOverall", header: "เด่นชัย รวม" },
  { key: "denchaiC1", header: "เด่นชัย ส.1" },
  { key: "denchaiC2", header: "เด่นชัย ส.2" },
  { key: "denchaiC3", header: "เด่นชัย ส.3" },
  { key: "denchaiOpenYear", header: "ปีเปิด เด่นชัย" },
  { key: "banphaiOverall", header: "บ้านไผ่ รวม" },
  { key: "banphaiC1", header: "บ้านไผ่ ส.1" },
  { key: "banphaiC2", header: "บ้านไผ่ ส.2" },
  { key: "banphaiOpenYear", header: "ปีเปิด บ้านไผ่" },
];

export const YEAR_FIELDS = new Set<string>([
  "khonkaenYear",
  "denchaiOpenYear",
  "banphaiOpenYear",
  "year",
]);
