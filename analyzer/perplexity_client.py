import json
from pathlib import Path

import requests
from config import GEMINI_API_KEY, REQUEST_TIMEOUT_SECONDS

PROMPT_TEMPLATE_PATH = Path(__file__).with_name("prompt_template.txt")


def _extract_gemini_text(response_json):
    candidates = response_json.get("candidates")
    if not candidates or not isinstance(candidates, list):
        raise ValueError("Gemini response has no candidates")

    content = candidates[0].get("content", {})
    parts = content.get("parts")
    if not parts or not isinstance(parts, list):
        raise ValueError("Gemini response has no content parts")

    text = parts[0].get("text")
    if not text or not isinstance(text, str):
        raise ValueError("Gemini response text is missing")

    return text


def analyze_post(post_text):
    system_prompt = PROMPT_TEMPLATE_PATH.read_text(encoding="utf-8")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": f"{system_prompt}\n\nتحقق من البوست ده:\n\n{post_text}"}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1000}
    }
    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS
    )
    response.raise_for_status()
    raw_text = _extract_gemini_text(response.json())
    try:
        return json.loads(raw_text)
    except (json.JSONDecodeError, TypeError):
        return {
            "source": "غير معروف",
            "publish_date": "غير معروف",
            "claim_title": "غير معروف",
            "verdict": "غير مؤكد",
            "analysis": raw_text,
        }
