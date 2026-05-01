import { neon } from "@neondatabase/serverless";
import type { Post, Verdict } from "@/lib/types";

type NewPostPayload = Omit<Post, "sqlid" | "created_at">;
const sql = neon(process.env.DATABASE_URL!);

export async function getAllPosts(): Promise<Post[]> {
  const rows = (await sql`
    SELECT
      sqlid,
      title,
      source,
      publish_date,
      verdict,
      analysis,
      original_post_url,
      original_text,
      created_at
    FROM posts
    ORDER BY publish_date DESC, created_at DESC;
  `) as Post[];

  return rows;
}

export async function insertPost(payload: NewPostPayload): Promise<Post> {
  const rows = (await sql`
    INSERT INTO posts (title, source, publish_date, verdict, analysis, original_post_url, original_text)
    VALUES (
      ${payload.title},
      ${payload.source},
      ${payload.publish_date},
      ${payload.verdict as Verdict},
      ${payload.analysis},
      ${payload.original_post_url},
      ${payload.original_text}
    )
    RETURNING
      sqlid,
      title,
      source,
      publish_date,
      verdict,
      analysis,
      original_post_url,
      original_text,
      created_at;
  `) as Post[];

  const createdPost = rows[0];
  if (!createdPost) {
    throw new Error("Insert operation completed without returning a row.");
  }

  return createdPost;
}
