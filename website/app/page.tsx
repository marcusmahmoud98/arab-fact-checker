import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/db";
import { getCoverForTitle } from "@/lib/unsplash";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getAllPosts();
  const covers = await Promise.all(posts.map((post) => getCoverForTitle(post.title)));

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_0_30px_-20px_rgba(220,38,38,0.95)] backdrop-blur-sm">
          <h1 className="text-3xl font-black tracking-wide text-red-500 sm:text-4xl">
            Arab Fact Checker 🇨🇦
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            منصة تدقيق عربية بتجمع الادعاءات المتداولة وتعرض تحليلًا واضحًا مدعومًا بالتصنيف.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {posts.map((post, index) => (
            <PostCard key={post.sqlid} post={post} cover={covers[index]} />
          ))}
        </section>

        {posts.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center text-zinc-400">
            لا توجد مقالات حاليًا. أضف مقالة جديدة عبر `POST /api/posts`.
          </div>
        )}
      </main>
    </div>
  );
}
