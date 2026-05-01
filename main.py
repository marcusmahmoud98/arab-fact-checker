import schedule
import time
from scraper.fb_scraper import scrape_new_posts, mark_post_as_seen
from analyzer.perplexity_client import analyze_post
from publisher.blog_publisher import publish_post
from config import SCHEDULE_HOURS


def run_pipeline():
    print("=" * 50)
    print("Starting fact-check pipeline...")
    print("=" * 50)

    # 1. سحب البوستات الجديدة
    print("\n[1/3] Scraping new posts...")
    new_posts = scrape_new_posts()

    if not new_posts:
        print("No new posts found. Done.")
        return

    # 2. تحليل كل بوست
    print(f"\n[2/3] Analyzing {len(new_posts)} posts...")
    for i, post in enumerate(new_posts, 1):
        print(f"\nPost {i}/{len(new_posts)}: {post['url'][:80]}...")
        try:
            # تحليل البوست
            analysis_result = analyze_post(post["text"])
            title = analysis_result.get("claim_title", "غير معروف")
            analysis_text = analysis_result.get("analysis", "")

            print(f"Title: {title}")
            print(f"Analysis preview: {analysis_text[:100]}...")

            # 3. نشر على البلوج
            print(f"\n[3/3] Publishing...")
            publish_post(
                title=title,
                content=analysis_text,
                original_post_url=post["url"],
                original_text=post["text"]
            )
            mark_post_as_seen(post["url"])
            print("Post published and marked as seen.")

        except Exception as e:
            print(f"Error processing post: {e}")
            continue

    print("\nPipeline completed!")


def main():
    print(f"Fact-checker started. Running every {SCHEDULE_HOURS} hours.")
    
    # شغّل مرة فور ما يبدأ
    run_pipeline()
    
    # بعدين كل X ساعات
    schedule.every(SCHEDULE_HOURS).hours.do(run_pipeline)
    
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
