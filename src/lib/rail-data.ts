import type { MonthRecord } from "./rail-model";
import part1 from "@/data/progress-1.json";
import part2 from "@/data/progress-2.json";
import part3 from "@/data/progress-3.json";
import part4 from "@/data/progress-4.json";
import part5 from "@/data/progress-5.json";
import part6 from "@/data/progress-6.json";
import part7 from "@/data/progress-7.json";
import part8 from "@/data/progress-8.json";

export const BUNDLED: MonthRecord[] = [...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8] as MonthRecord[];
