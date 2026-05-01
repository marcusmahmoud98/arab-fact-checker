import requests
import json
import os
import time
from config import APIFY_API_TOKEN, POSTS_LIMIT, REQUEST_TIMEOUT_SECONDS

PAGES_FILE = "scraper/pages.json"
SEEN_POSTS_FILE = "data/seen_posts.json"
ACTOR_ID = "apify/facebook-posts-scraper"


def load_pages():
    try:
        with open(PAGES_FILE, "r", encoding="utf-8") as f:
            pages = json.load(f)
            if isinstance(pages, list):
                return pages
            print(f"Warning: {PAGES_FILE} does not contain a JSON list. Using empty list.")
            return []
    except FileNotFoundError:
        print(f"Warning: {PAGES_FILE} not found. No pages to scrape.")
        return []
    except json.JSONDecodeError as e:
        print(f"Warning: invalid JSON in {PAGES_FILE}: {e}. Using empty list.")
        return []


def load_seen_posts():
    if os.path.exists(SEEN_POSTS_FILE):
        try:
            with open(SEEN_POSTS_FILE, "r", encoding="utf-8") as f:
                seen = json.load(f)
                if isinstance(seen, list):
                    return set(seen)
                print(f"Warning: {SEEN_POSTS_FILE} does not contain a JSON list. Resetting cache.")
                return set()
        except json.JSONDecodeError as e:
            print(f"Warning: invalid JSON in {SEEN_POSTS_FILE}: {e}. Resetting cache.")
            return set()
    return set()


def save_seen_posts(seen):
    os.makedirs("data", exist_ok=True)
    with open(SEEN_POSTS_FILE, "w", encoding="utf-8") as f:
        json.dump(list(seen), f)


def mark_post_as_seen(post_url):
    seen_posts = load_seen_posts()
    seen_posts.add(post_url)
    save_seen_posts(seen_posts)


def run_apify_scraper(page_url):
    url = f"https://api.apify.com/v2/acts/{ACTOR_ID}/runs"
    headers = {
        "Authorization": f"Bearer {APIFY_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "startUrls": [{"url": page_url}],
        "resultsLimit": POSTS_LIMIT,
        "proxyConfiguration": {"useApifyProxy": True}
    }
    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS
    )
    response.raise_for_status()
    return response.json()["data"]["id"]


def wait_for_run(run_id, timeout=120):
    url = f"https://api.apify.com/v2/actor-runs/{run_id}"
    headers = {"Authorization": f"Bearer {APIFY_API_TOKEN}"}

    start = time.time()
    while time.time() - start < timeout:
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        run_data = response.json().get("data", {})
        status = run_data.get("status")
        if not status:
            print(f"Run {run_id} returned an invalid status payload")
            return False
        if status == "SUCCEEDED":
            return True
        elif status in ["FAILED", "ABORTED"]:
            print(f"Run {run_id} failed: {status}")
            return False
        time.sleep(5)

    print(f"Run {run_id} timed out")
    return False


def get_run_results(run_id):
    url = f"https://api.apify.com/v2/actor-runs/{run_id}/dataset/items"
    headers = {"Authorization": f"Bearer {APIFY_API_TOKEN}"}
    response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def scrape_new_posts():
    pages = load_pages()
    seen_posts = load_seen_posts()
    run_seen_posts = set(seen_posts)
    new_posts = []

    for page_url in pages:
        print(f"Scraping: {page_url}")
        try:
            run_id = run_apify_scraper(page_url)
            print(f"Run started: {run_id}")

            if not wait_for_run(run_id):
                continue

            posts = get_run_results(run_id)
            print(f"Got {len(posts)} posts")

            for post in posts:
                post_url = post.get("url", "")
                post_text = post.get("text", "").strip()

                if not post_url or not post_text or post_url in run_seen_posts:
                    continue

                new_posts.append({
                    "url": post_url,
                    "text": post_text,
                    "page": page_url,
                    "likes": post.get("likes", 0),
                    "comments": post.get("comments", 0),
                    "shares": post.get("shares", 0),
                })
                run_seen_posts.add(post_url)

        except Exception as e:
            print(f"Error scraping {page_url}: {e}")

    print(f"Total new posts: {len(new_posts)}")
    return new_posts
