import requests
from config import BLOG_API_URL, BLOG_API_SECRET, REQUEST_TIMEOUT_SECONDS


def _payload_summary(payload):
    return {
        "title": (payload.get("title") or "")[:60],
        "source": payload.get("source"),
        "publish_date": payload.get("publish_date"),
        "verdict": payload.get("verdict"),
        "original_post_url": payload.get("original_post_url"),
        "analysis_len": len(payload.get("analysis") or ""),
        "original_text_len": len(payload.get("original_text") or ""),
    }


def publish_post(post_payload):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BLOG_API_SECRET}"
    }
    payload = {
        "title": post_payload.get("title") or "غير معروف",
        "source": post_payload.get("source") or "غير معروف",
        "publish_date": post_payload.get("publish_date") or "غير معروف",
        "verdict": post_payload.get("verdict") or "غير مؤكد",
        "analysis": post_payload.get("analysis") or "",
        "original_post_url": post_payload.get("original_post_url") or "",
        "original_text": post_payload.get("original_text") or "",
    }

    response = requests.post(
        BLOG_API_URL,
        headers=headers,
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS
    )
    if 400 <= response.status_code < 500:
        response_body = response.text.strip() or "<empty>"
        print(
            "Publish validation/client error "
            f"(status={response.status_code}) for post "
            f"{payload.get('original_post_url')}: {response_body}"
        )
        print(f"Payload summary: {_payload_summary(payload)}")
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
