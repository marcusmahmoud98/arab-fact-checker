import Image from "next/image";
import type { Post } from "@/lib/types";
import { VERDICT_META } from "@/lib/verdict";
import { getDisplaySource } from "@/lib/source-label";

type PostCardProps = {
  post: Post;
  cover: {
    imageUrl: string | null;
    gradient: string;
  };
  onOpen: (post: Post) => void;
};

export function PostCard({ post, cover, onOpen }: PostCardProps) {
  const verdictMeta = VERDICT_META[post.verdict];
  const displaySource = getDisplaySource(post.source, post.original_post_url);

  return (
    <button
      type="button"
      className="group w-full rounded-[14px] border border-[#1a1a28] bg-[#0e0e1a] p-[14px] text-right transition duration-150 ease-[ease] hover:-translate-y-[2px] hover:border-[#e53e3e66]"
      onClick={() => onOpen(post)}
    >
      <div className="relative mb-3 aspect-[1/1] w-full overflow-hidden rounded-[10px] md:aspect-[5/4]">
        {cover.imageUrl ? (
          <Image src={cover.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(180deg, #121220 0%, #0b0b14 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <span
          className={`absolute right-2 top-2 inline-flex rounded-full px-2 py-1 text-xs font-normal lg:px-3 lg:py-1.5 lg:text-sm ${verdictMeta.badgeClassName}`}
        >
          {post.verdict}
        </span>
      </div>

      <h2 className="mb-2 text-[17px] font-semibold leading-7 text-white lg:text-[23px] lg:leading-9">{post.title}</h2>

      <p className="mb-3 text-sm lg:text-lg">
        <span className="text-[#e53e3e]">{displaySource}</span>
        <span className="px-1 text-[rgba(255,255,255,0.58)]">·</span>
        <span className="text-[rgba(255,255,255,0.58)]">
          {new Date(post.publish_date).toLocaleDateString("ar-EG")}
        </span>
      </p>

      <p className="mb-4 line-clamp-2 text-sm leading-6 text-[rgba(255,255,255,0.7)] lg:text-lg lg:leading-8">{post.analysis}</p>

      <span className="text-sm text-[rgba(255,255,255,0.7)] transition-colors duration-150 group-hover:text-[#e53e3e] lg:text-lg">
        اقرأ المراجعة
      </span>
    </button>
  );
}
