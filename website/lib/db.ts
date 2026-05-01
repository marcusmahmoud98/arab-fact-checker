import { sql } from "@vercel/postgres";
import type { Post, Verdict } from "@/lib/types";

type NewPostPayload = Omit<Post, "sqlid" | "created_at">;

export async function getAllPosts(): Promise<Post[]> {
  const { rows } = await sql<Post>`
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
  `;

  return rows;
}

export async function insertPost(payload: NewPostPayload): Promise<Post> {
  const { rows } = await sql<Post>`
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
  `;

  const createdPost = rows[0];
  if (!createdPost) {
    throw new Error("Insert operation completed without returning a row.");
  }

  return createdPost;
}
