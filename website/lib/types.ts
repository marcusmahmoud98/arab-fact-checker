export const VERDICTS = [
  "كاذب بالكامل",
  "مضلل",
  "لم يحدث",
  "غير حقيقي",
] as const;

export type Verdict = (typeof VERDICTS)[number];

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
