import json
import time
from pathlib import Path

import requests
from config import GROQ_API_KEY, REQUEST_TIMEOUT_SECONDS

PROMPT_TEMPLATE_PATH = Path(__file__).with_name("prompt_template.txt")
GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
MAX_RETRIES = 4
INITIAL_BACKOFF_SECONDS = 10


def _extract_groq_text(response_json):
    choices = response_json.get("choices")
    if not choices or not isinstance(choices, list):
        raise ValueError("Groq response has no choices")

    message = choices[0].get("message", {})
    content = message.get("content")
    if not content or not isinstance(content, str):
        raise ValueError("Groq response content is missing")

    return content


def _is_quota_exceeded_response(response):
    if response.status_code != 429:
        return False

    try:
        response_json = response.json()
    except ValueError:
        return "exceeded your current quota" in (response.text or "").lower()

    message = (
        response_json.get("error", {}).get("message", "")
        if isinstance(response_json, dict)
        else ""
    )
    return "exceeded your current quota" in str(message).lower()


def _call_groq_with_retry(headers, payload):
    backoff_seconds = INITIAL_BACKOFF_SECONDS
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.post(
                GROQ_CHAT_COMPLETIONS_URL,
                headers=headers,
                json=payload,
                timeout=REQUEST_TIMEOUT_SECONDS
            )
        except requests.RequestException as exc:
            if attempt == MAX_RETRIES:
                raise
            print(
                f"Groq request error ({exc}) attempt {attempt}/{MAX_RETRIES}, "
                f"retrying in {backoff_seconds}s..."
            )
            time.sleep(backoff_seconds)
            backoff_seconds *= 2
            continue

        if response.status_code == 429 or 500 <= response.status_code < 600:
            if _is_quota_exceeded_response(response):
                response.raise_for_status()

            if attempt == MAX_RETRIES:
                response.raise_for_status()
            print(
                f"Groq rate/server limit (status={response.status_code}) "
                f"attempt {attempt}/{MAX_RETRIES}, retrying in {backoff_seconds}s..."
            )
            time.sleep(backoff_seconds)
            backoff_seconds *= 2
            continue

        response.raise_for_status()
        return response

    raise RuntimeError("Groq request retries exhausted without response.")


def analyze_post(post_text):
    system_prompt = PROMPT_TEMPLATE_PATH.read_text(encoding="utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"تحقق من البوست ده:\n\n{post_text}"},
        ],
        "temperature": 0.1,
        "max_tokens": 1000,
    }
    response = _call_groq_with_retry(headers, payload)
    raw_text = _extract_groq_text(response.json())
    try:
        return json.loads(raw_text)
    except (json.JSONDecodeError, TypeError):
        return {
            "source": "غير معروف",
            "publish_date": "غير معروف",
            "claim_title": "غير معروف",
            "claim_summary": "لم يتم استخراج ملخص البوست",
            "verdict": "غير مؤكد",
            "analysis": raw_text,
        }
