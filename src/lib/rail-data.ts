import type { MonthRecord } from "./rail-model";
import part1 from "@/data/progress-1.json";
import part2 from "@/data/progress-2.json";
import part3 from "@/data/progress-3.json";

export const BUNDLED: MonthRecord[] = [...part1, ...part2, ...part3] as MonthRecord[];
