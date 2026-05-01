"use client";

import { useState } from "react";
import Image from "next/image";
import type { Post } from "@/lib/types";
import { VERDICT_META } from "@/lib/verdict";

type PostCardProps = {
  post: Post;
  cover: {
    imageUrl: string | null;
    gradient: string;
  };
};

export function PostCard({ post, cover }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const verdictMeta = VERDICT_META[post.verdict];

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-card transition duration-300 hover:-translate-y-1 hover:border-red-600/60 hover:bg-card-hover hover:shadow-[0_18px_35px_-22px_rgba(220,38,38,0.8)]"
      onClick={() => setExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setExpanded((prev) => !prev);
        }
      }}
      aria-expanded={expanded}
    >
      <div className="relative h-52 w-full">
        {cover.imageUrl ? (
          <Image
            src={cover.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="h-full w-full" style={{ background: cover.gradient }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
      </div>

      <div className="space-y-4 p-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${verdictMeta.badgeClassName}`}
        >
          <span>{verdictMeta.emoji}</span>
          <span>{post.verdict}</span>
        </span>

        <h2 className="text-lg font-bold leading-8 text-zinc-50">{post.title}</h2>

        <p className="text-sm text-zinc-400">
          {post.source} - {new Date(post.publish_date).toLocaleDateString("ar-EG")}
        </p>

        {expanded ? (
          <div className="space-y-3 rounded-xl border border-zinc-700/80 bg-zinc-950/60 p-4 text-sm leading-7 text-zinc-200">
            <p>{post.analysis}</p>
            <p className="text-zinc-400">{post.original_text}</p>
            <a
              href={post.original_post_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-red-400 transition hover:text-red-300"
              onClick={(event) => event.stopPropagation()}
            >
              عرض المنشور الأصلي
            </a>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">اضغط على الكارت لعرض التحليل الكامل.</p>
        )}
      </div>
    </article>
  );
}
