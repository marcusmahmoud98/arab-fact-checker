import { NewsroomFeed } from "@/components/newsroom-feed";
import { getAllPosts } from "@/lib/db";
import { getCoverForTitle } from "@/lib/unsplash";

export const dynamic = "force-dynamic";

export default async function Home() {
  let hasError = false;
  let items: Array<{
    post: Awaited<ReturnType<typeof getAllPosts>>[number];
    cover: { imageUrl: string | null; gradient: string };
  }> = [];

  try {
    const posts = await getAllPosts();
    const covers = await Promise.all(posts.map((post) => getCoverForTitle(post.title)));
    items = posts.map((post, index) => ({ post, cover: covers[index] }));
  } catch {
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-[#080810] px-4 py-4 text-white sm:px-8">
      <main className="mx-auto w-full max-w-[1320px]">
        <NewsroomFeed items={items} hasError={hasError} />
      </main>
    </div>
  );
}
