import type { Verdict } from "@/lib/types";

type VerdictMeta = {
  badgeClassName: string;
};

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  "كاذب بالكامل": {
    badgeClassName: "bg-[#7f1d1d] text-[#fca5a5]",
  },
  مضلل: {
    badgeClassName: "bg-[#78350f] text-[#fcd34d]",
  },
  "لم يحدث": {
    badgeClassName: "bg-[#1e1b4b] text-[#a5b4fc]",
  },
  "غير حقيقي": {
    badgeClassName: "bg-[#3b0764] text-[#e879f9]",
  },
  صحيح: {
    badgeClassName: "bg-[#1f2937] text-[#d1d5db]",
  },
  "غير مؤكد": {
    badgeClassName: "bg-[#1f2937] text-[#d1d5db]",
  },
};
