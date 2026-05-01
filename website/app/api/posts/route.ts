import { NextResponse } from "next/server";
import { getAllPosts, insertPost } from "@/lib/db";
import { VERDICTS, type Post, type Verdict } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreatePostBody = Omit<Post, "sqlid" | "created_at">;

function isValidVerdict(value: string): value is Verdict {
  return VERDICTS.includes(value as Verdict);
}

function toError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts, { status: 200 });
  } catch {
    return toError("تعذر تحميل المقالات حاليًا.", 500);
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.BLOG_API_SECRET;

  if (!expected) {
    return toError("BLOG_API_SECRET غير مضبوط على الخادم.", 500);
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return toError("مطلوب Authorization Bearer token.", 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (token !== expected) {
    return toError("رمز التفويض غير صحيح.", 401);
  }

  let body: Partial<CreatePostBody>;
  try {
    body = await request.json();
  } catch {
    return toError("JSON غير صالح.");
  }

  if (
    !body.title ||
    !body.source ||
    !body.publish_date ||
    !body.verdict ||
    !body.analysis ||
    !body.original_post_url ||
    !body.original_text
  ) {
    return toError("جميع الحقول مطلوبة.");
  }

  if (!isValidVerdict(body.verdict)) {
    return toError("قيمة verdict غير مدعومة.");
  }

  try {
    const post = await insertPost({
      title: body.title,
      source: body.source,
      publish_date: body.publish_date,
      verdict: body.verdict,
      analysis: body.analysis,
      original_post_url: body.original_post_url,
      original_text: body.original_text,
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return toError("تعذر إنشاء المقال.", 500);
  }
}
