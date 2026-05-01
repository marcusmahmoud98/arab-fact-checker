import { NextResponse } from "next/server";
import { getAllPosts, insertPost } from "@/lib/db";
import { normalizeVerdict, type Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreatePostBody = Omit<Post, "sqlid" | "created_at">;
type ValidationError = {
  field: keyof CreatePostBody;
  message: string;
};

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toISODate(value: unknown): string | null {
  const date = toNonEmptyString(value);
  if (!date) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const normalized = parsed.toISOString().slice(0, 10);
  return normalized === date ? date : null;
}

function toError(
  code: string,
  message: string,
  status = 400,
  details?: ValidationError[],
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details: details ?? [],
      },
    },
    { status },
  );
}

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts, { status: 200 });
  } catch {
    return toError("POSTS_FETCH_FAILED", "تعذر تحميل المقالات حاليًا.", 500);
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.BLOG_API_SECRET;

  if (!expected) {
    return toError("SERVER_MISCONFIGURED", "BLOG_API_SECRET غير مضبوط على الخادم.", 500);
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return toError("UNAUTHORIZED", "مطلوب Authorization Bearer token.", 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (token !== expected) {
    return toError("UNAUTHORIZED", "رمز التفويض غير صحيح.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return toError("INVALID_JSON", "JSON غير صالح.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return toError("INVALID_BODY_TYPE", "هيكل JSON غير صالح.");
  }

  const parsed = body as Partial<CreatePostBody>;
  const title = toNonEmptyString(parsed.title);
  const claimSummary = toNonEmptyString(parsed.claim_summary);
  const source = toNonEmptyString(parsed.source);
  const publishDate = toISODate(parsed.publish_date);
  const verdictInput = toNonEmptyString(parsed.verdict);
  const normalizedVerdict = verdictInput ? normalizeVerdict(verdictInput) : null;
  const analysis = toNonEmptyString(parsed.analysis);
  const originalPostUrl = toNonEmptyString(parsed.original_post_url);
  const originalText = toNonEmptyString(parsed.original_text);
  const validationErrors: ValidationError[] = [];

  if (!title) {
    validationErrors.push({ field: "title", message: "حقل title مطلوب ويجب أن يكون نصًا غير فارغ." });
  }
  if (!source) {
    validationErrors.push({ field: "source", message: "حقل source مطلوب ويجب أن يكون نصًا غير فارغ." });
  }
  if (!claimSummary) {
    validationErrors.push({
      field: "claim_summary",
      message: "حقل claim_summary مطلوب ويجب أن يكون نصًا غير فارغ.",
    });
  }
  if (!publishDate) {
    validationErrors.push({
      field: "publish_date",
      message: "publish_date يجب أن يكون تاريخًا صالحًا بصيغة YYYY-MM-DD (مثال: 2026-05-01).",
    });
  }
  if (!verdictInput) {
    validationErrors.push({ field: "verdict", message: "حقل verdict مطلوب." });
  }
  if (!analysis) {
    validationErrors.push({ field: "analysis", message: "حقل analysis مطلوب ويجب أن يكون نصًا غير فارغ." });
  }
  if (!originalPostUrl) {
    validationErrors.push({
      field: "original_post_url",
      message: "حقل original_post_url مطلوب ويجب أن يكون رابطًا نصيًا غير فارغ.",
    });
  }
  if (!originalText) {
    validationErrors.push({
      field: "original_text",
      message: "حقل original_text مطلوب ويجب أن يكون نصًا غير فارغ.",
    });
  }

  if (originalPostUrl) {
    try {
      const url = new URL(originalPostUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        validationErrors.push({
          field: "original_post_url",
          message: "original_post_url يجب أن يبدأ بـ http:// أو https://",
        });
      }
    } catch {
      validationErrors.push({
        field: "original_post_url",
        message: "original_post_url ليس رابطًا صالحًا.",
      });
    }
  }

  if (validationErrors.length > 0) {
    return toError("VALIDATION_ERROR", "فشل التحقق من البيانات المدخلة.", 422, validationErrors);
  }

  if (!normalizedVerdict) {
    return toError(
      "UNSUPPORTED_VERDICT",
      "قيمة verdict غير مدعومة.",
      422,
      [{ field: "verdict", message: "القيم المسموح بها موضحة في وثيقة API contract." }],
    );
  }

  if (!title || !claimSummary || !source || !publishDate || !analysis || !originalPostUrl || !originalText) {
    return toError("VALIDATION_ERROR", "فشل التحقق من البيانات المدخلة.", 422);
  }

  try {
    const post = await insertPost({
      title,
      claim_summary: claimSummary,
      source,
      publish_date: publishDate,
      verdict: normalizedVerdict,
      analysis,
      original_post_url: originalPostUrl,
      original_text: originalText,
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return toError("POST_CREATE_FAILED", "تعذر إنشاء المقال.", 500);
  }
}
