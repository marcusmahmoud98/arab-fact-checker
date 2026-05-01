"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/post-card";
import { VERDICT_META } from "@/lib/verdict";
import type { Post } from "@/lib/types";
import { getDisplaySource } from "@/lib/source-label";

type PostWithCover = {
  post: Post;
  cover: {
    imageUrl: string | null;
    gradient: string;
  };
};

type NewsroomFeedProps = {
  items: PostWithCover[];
  hasError: boolean;
};

const FILTERS = ["الكل", "كاذب بالكامل", "مضلل", "لم يحدث", "غير حقيقي"] as const;
type FilterValue = (typeof FILTERS)[number];

export function NewsroomFeed({ items, hasError }: NewsroomFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("الكل");
  const [selectedPost, setSelectedPost] = useState<PostWithCover | null>(null);

  const filteredItems = useMemo(() => {
    if (activeFilter === "الكل") {
      return items;
    }
    return items.filter(({ post }) => post.verdict === activeFilter);
  }, [activeFilter, items]);

  const stats = useMemo(() => {
    const reviewed = items.length;
    const inReview = items.filter(({ post }) => post.verdict === "غير مؤكد").length;
    const monitoredSources = new Set(
      items
        .map(({ post }) => getDisplaySource(post.source, post.original_post_url).trim())
        .filter(Boolean),
    ).size;
    return { reviewed, inReview, monitoredSources };
  }, [items]);

  return (
    <>
      <div className="mb-6 border-b border-[#1a1a28] pb-5">
        <div className="mb-1 flex flex-col items-center justify-center gap-3 text-center">
          <span className="rounded-full border border-[#1a1a28] px-3 py-1 text-xs text-[rgba(255,255,255,0.8)] lg:text-sm">
            🇨🇦 كندا
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-[56px] lg:leading-[1.12]">Arab Fact Checker</h1>
            <p className="mt-2 text-base text-[rgba(255,255,255,0.8)] lg:text-xl">متابعة هادئة لما ينتشر على فيسبوك</p>
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-[rgba(255,255,255,0.8)] lg:text-lg">
          نراجع المنشورات المتداولة، نبحث عن المصدر، ونكتب الخلاصة بدون تهويل.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-[10px] border border-[#1a1a28] bg-[#11111f] px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-lg">
          <div>
            <p className="text-[rgba(255,255,255,0.58)] lg:text-base">الأخبار المفندة</p>
            <p className="text-sm text-white lg:text-lg">{stats.reviewed}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.58)] lg:text-base">منشورات قيد المراجعة</p>
            <p className="text-sm text-white lg:text-lg">{stats.inReview}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.58)] lg:text-base">صفحات مراقبة</p>
            <p className="text-sm text-white lg:text-lg">{stats.monitoredSources}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map((filter) => {
          const active = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={[
                "rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 lg:px-5 lg:py-2.5 lg:text-lg",
                active
                  ? "border-[#e53e3e] bg-[#e53e3e] text-white"
                  : "border-[#1a1a28] bg-transparent text-[rgba(255,255,255,0.7)] hover:border-[#e53e3e66] hover:text-white",
              ].join(" ")}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-center text-sm text-[rgba(255,255,255,0.58)] lg:text-lg">آخر المراجعات</p>

      {hasError ? (
        <section className="rounded-[14px] border border-[#1a1a28] bg-[#0e0e1a] p-4">
          <p className="text-sm text-white lg:text-base">مش قادرين نحمّل المراجعات دلوقتي.</p>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.7)] lg:text-base">جرّب تحدث الصفحة بعد دقيقة.</p>
        </section>
      ) : filteredItems.length === 0 ? (
        <section className="rounded-[14px] border border-[#1a1a28] bg-[#0e0e1a] p-4">
          <p className="text-sm text-white lg:text-base">لسه مفيش مراجعات منشورة.</p>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.7)] lg:text-base">
            أول ما نلتقط منشورًا مهمًا، هتلاقيه هنا.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <PostCard key={item.post.sqlid} post={item.post} cover={item.cover} onOpen={() => setSelectedPost(item)} />
          ))}
        </section>
      )}

      <footer className="mt-6 border-t border-[#1a1a28] pt-4 text-sm text-[rgba(255,255,255,0.7)] lg:text-lg">
        مشروع صغير لمتابعة الادعاءات المتداولة في كندا.
      </footer>

      <div
        onClick={() => setSelectedPost(null)}
        className={[
          "fixed inset-0 z-40 bg-[rgba(0,0,0,0.86)] transition-opacity duration-150",
          selectedPost ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[20px] border-t border-[#1a1a28] bg-[#0e0e1a] p-4 transition-transform duration-150",
          selectedPost ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-3 h-1 w-[42px] rounded-full bg-[rgba(255,255,255,0.22)]" />
        <button
          type="button"
          className="mb-3 mr-auto block text-base text-[rgba(255,255,255,0.7)] transition-colors hover:text-white lg:text-lg"
          onClick={() => setSelectedPost(null)}
        >
          ✕
        </button>

        {selectedPost && (
          <div className="mx-auto max-w-[980px] pb-6 text-right">
            <div className="relative mb-3 aspect-[5/4] w-full overflow-hidden rounded-[12px] border border-[#1a1a28] bg-[#11111f]">
              {selectedPost.cover.imageUrl ? (
                <Image
                  src={selectedPost.cover.imageUrl}
                  alt={selectedPost.post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 900px"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(180deg, #121220 0%, #0b0b14 100%)",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-black/25" />
            </div>
            <span className={`inline-flex rounded-full px-2 py-1 text-xs ${VERDICT_META[selectedPost.post.verdict].badgeClassName}`}>
              {selectedPost.post.verdict}
            </span>
            <h2 className="mt-3 text-lg font-semibold leading-7 text-white lg:text-[30px] lg:leading-[1.3]">{selectedPost.post.title}</h2>
            <p className="mt-2 text-sm lg:text-lg">
              <span className="text-[#e53e3e]">
                {getDisplaySource(selectedPost.post.source, selectedPost.post.original_post_url)}
              </span>
              <span className="px-1 text-[rgba(255,255,255,0.58)]">·</span>
              <span className="text-[rgba(255,255,255,0.58)]">
                {new Date(selectedPost.post.publish_date).toLocaleDateString("ar-EG")}
              </span>
            </p>

            <h3 className="mt-5 text-base font-semibold text-white lg:text-xl">التحليل</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[rgba(255,255,255,0.8)] lg:text-lg lg:leading-8">
              {selectedPost.post.analysis}
            </p>

            <details className="mt-4 rounded-[10px] border border-[#1a1a28] bg-[#11111f] p-3">
              <summary className="cursor-pointer text-sm text-[rgba(255,255,255,0.7)] lg:text-base">النص الأصلي</summary>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[rgba(255,255,255,0.58)] lg:text-base">
                {selectedPost.post.original_text}
              </p>
            </details>

            <a
              href={selectedPost.post.original_post_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-[#e53e3e] hover:underline lg:text-base"
            >
              فتح المنشور الأصلي
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
