function cleanSegment(value: string): string {
  return decodeURIComponent(value)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getDisplaySource(source: string, originalPostUrl: string): string {
  if (!originalPostUrl) {
    return source;
  }

  try {
    const url = new URL(originalPostUrl);
    const host = url.hostname.toLowerCase();
    if (!host.includes("facebook.com") && !host.includes("fb.com")) {
      return source;
    }

    const ignored = new Set([
      "posts",
      "videos",
      "reel",
      "reels",
      "permalink",
      "permalink.php",
      "story.php",
      "watch",
      "share",
      "photo",
      "photos",
      "groups",
      "p",
    ]);

    const segments = url.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    const candidate = segments.find((segment) => !ignored.has(segment.toLowerCase()));
    if (!candidate) {
      return source;
    }

    const label = cleanSegment(candidate);
    return label || source;
  } catch {
    return source;
  }
}
