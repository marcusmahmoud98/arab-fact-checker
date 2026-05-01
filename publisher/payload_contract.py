from datetime import date, datetime

WEBSITE_ALLOWED_VERDICTS = {
    "كاذب بالكامل",
    "مضلل",
    "لم يحدث",
    "غير حقيقي",
    "صحيح",
    "غير مؤكد",
}

WEBSITE_VERDICT_ALIASES = {
    "كاذب بالكامل": "كاذب بالكامل",
    "مضلل": "مضلل",
    "لم يحدث": "لم يحدث",
    "غير حقيقي": "غير حقيقي",
    "صحيح": "صحيح",
    "غير مؤكد": "غير مؤكد",
    "غير مؤكد.": "غير مؤكد",
}


def normalize_verdict(raw_verdict):
    if not isinstance(raw_verdict, str):
        return "غير مؤكد"

    normalized = " ".join(raw_verdict.strip().split())
    verdict = WEBSITE_VERDICT_ALIASES.get(normalized)
    if verdict in WEBSITE_ALLOWED_VERDICTS:
        return verdict
    return "غير مؤكد"


def parse_iso_date(raw_date):
    if not isinstance(raw_date, str):
        return None

    candidate = raw_date.strip()
    if not candidate:
        return None

    try:
        parsed = datetime.strptime(candidate, "%Y-%m-%d")
    except ValueError:
        return None

    return parsed.strftime("%Y-%m-%d")


def resolve_publish_date(raw_date):
    parsed_date = parse_iso_date(raw_date)
    if parsed_date:
        return parsed_date, False

    fallback_date = date.today().strftime("%Y-%m-%d")
    return fallback_date, True


def normalize_publish_payload(analysis_result, post):
    publish_date, used_fallback = resolve_publish_date(analysis_result.get("publish_date"))
    return {
        "title": analysis_result.get("claim_title") or "غير معروف",
        "source": analysis_result.get("source") or "غير معروف",
        "publish_date": publish_date,
        "verdict": normalize_verdict(analysis_result.get("verdict")),
        "analysis": analysis_result.get("analysis") or "",
        "original_post_url": post.get("url") or "",
        "original_text": post.get("text") or "",
    }, used_fallback
