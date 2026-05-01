const DEFAULT_GRADIENT =
  "linear-gradient(145deg, rgba(20,20,23,1) 0%, rgba(127,29,29,0.55) 50%, rgba(9,9,11,1) 100%)";

const STOP_WORDS = new Set([
  "في",
  "من",
  "على",
  "عن",
  "إلى",
  "الى",
  "هذا",
  "هذه",
  "ذلك",
  "تلك",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "خبر",
  "عاجل",
  "منشور",
  "بوست",
]);

function extractKeyword(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()));

  if (words.length === 0) return "news";

  const uniqueWords = [...new Set(words)];
  const selectedWords = uniqueWords
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);

  return selectedWords.join(" ");
}

export type PostCover = {
  imageUrl: string | null;
  gradient: string;
};

export async function getCoverForTitle(title: string, seed = 0): Promise<PostCover> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return { imageUrl: null, gradient: DEFAULT_GRADIENT };
  }

  const keyword = extractKeyword(title);
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", keyword);
  url.searchParams.set("per_page", "10");
  url.searchParams.set("orientation", "landscape");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { imageUrl: null, gradient: DEFAULT_GRADIENT };
    }

    const data = (await response.json()) as {
      results?: Array<{ urls?: { regular?: string } }>;
    };

    const results = data.results ?? [];
    if (results.length === 0) {
      return { imageUrl: null, gradient: DEFAULT_GRADIENT };
    }

    const safeSeed = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
    const selectedIndex = safeSeed % results.length;
    const imageUrl = results[selectedIndex]?.urls?.regular ?? null;
    return { imageUrl, gradient: DEFAULT_GRADIENT };
  } catch {
    return { imageUrl: null, gradient: DEFAULT_GRADIENT };
  }
}
