import requests
from config import BLOG_API_URL, BLOG_API_SECRET, REQUEST_TIMEOUT_SECONDS


def publish_post(title, content, original_post_url, original_text):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BLOG_API_SECRET}"
    }
    payload = {
        "title": title,
        "content": content,
        "originalPostUrl": original_post_url,
        "originalText": original_text[:500],
        "category": "fact-check",
        "status": "published"
    }

    response = requests.post(
        BLOG_API_URL,
        headers=headers,
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS
    )
    response.raise_for_status()
    if not response.content:
        print("Published successfully (empty response body).")
        return {}

    try:
        result = response.json()
    except ValueError:
        print("Published successfully (non-JSON response).")
        return {}

    print(f"Published: {result.get('url', 'unknown')}")
    return result
