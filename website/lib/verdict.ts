import type { Verdict } from "@/lib/types";

type VerdictMeta = {
  emoji: string;
  badgeClassName: string;
};

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  "كاذب بالكامل": {
    emoji: "🔴",
    badgeClassName: "bg-red-500/15 text-red-300 ring-red-500/40",
  },
  مضلل: {
    emoji: "🟠",
    badgeClassName: "bg-orange-500/15 text-orange-300 ring-orange-500/40",
  },
  "لم يحدث": {
    emoji: "⚫",
    badgeClassName: "bg-zinc-500/20 text-zinc-200 ring-zinc-500/40",
  },
  "غير حقيقي": {
    emoji: "🟣",
    badgeClassName: "bg-purple-500/15 text-purple-300 ring-purple-500/40",
  },
};
