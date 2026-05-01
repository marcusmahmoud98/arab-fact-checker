export const VERDICTS = [
  "كاذب بالكامل",
  "مضلل",
  "لم يحدث",
  "غير حقيقي",
  "صحيح",
  "غير مؤكد",
] as const;

export type Verdict = (typeof VERDICTS)[number];

const VERDICT_ALIASES: Record<string, Verdict> = {
  "كاذب بالكامل": "كاذب بالكامل",
  مضلل: "مضلل",
  "لم يحدث": "لم يحدث",
  "غير حقيقي": "غير حقيقي",
  صحيح: "صحيح",
  "غير مؤكد": "غير مؤكد",
  "غير مؤكد.": "غير مؤكد",
};

export function normalizeVerdict(value: string): Verdict | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  return VERDICT_ALIASES[normalized] ?? null;
}

export type Post = {
  sqlid: number;
  title: string;
  source: string;
  publish_date: string;
  verdict: Verdict;
  analysis: string;
  original_post_url: string;
  original_text: string;
  created_at: string;
};
