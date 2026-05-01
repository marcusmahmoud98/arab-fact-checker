# Arab Fact Checker API Contract (Source of Truth)

This document is the single source of truth for all producers/consumers (Python publisher, website API, and DB).

## Runtime Stack (must match `package.json`)

- Next.js: `16.2.4`
- React: `19.2.4`
- TypeScript: `^5`
- Database client: `@vercel/postgres ^0.10.0`

## Endpoint

- `POST /api/posts` (Bearer auth required)
- `GET /api/posts` (returns all posts)

## Auth Contract

`POST /api/posts` requires:

- Header: `Authorization: Bearer <BLOG_API_SECRET>`
- Server env: `BLOG_API_SECRET` must be set

If auth is missing/invalid -> `401`.

## POST Body Contract

All fields are required and must be non-empty strings:

- `title`: string
- `source`: string
- `publish_date`: string, **strict format `YYYY-MM-DD`**, must be a real calendar date
- `verdict`: string enum (see below)
- `analysis`: string
- `original_post_url`: string URL (`http://` or `https://`)
- `original_text`: string

### Verdict Enum (allowed values)

- `كاذب بالكامل`
- `مضلل`
- `لم يحدث`
- `غير حقيقي`
- `صحيح`
- `غير مؤكد`

## publish_date Policy (final)

`publish_date` must satisfy all of the following:

1. Matches regex `^\d{4}-\d{2}-\d{2}$`
2. Is a valid date (e.g. `2026-02-29` is rejected)
3. Sent as Gregorian date string in UTC-neutral form (`YYYY-MM-DD`)

Invalid or missing `publish_date` returns `422 VALIDATION_ERROR` with field-level details.

## Error Contract

Error responses are JSON with a structured envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "فشل التحقق من البيانات المدخلة.",
    "details": [
      {
        "field": "publish_date",
        "message": "publish_date يجب أن يكون تاريخًا صالحًا بصيغة YYYY-MM-DD (مثال: 2026-05-01)."
      }
    ]
  }
}
```

Common codes:

- `UNAUTHORIZED` (`401`)
- `INVALID_JSON` (`400`)
- `INVALID_BODY_TYPE` (`400`)
- `VALIDATION_ERROR` (`422`)
- `UNSUPPORTED_VERDICT` (`422`)
- `SERVER_MISCONFIGURED` (`500`)
- `POST_CREATE_FAILED` (`500`)
- `POSTS_FETCH_FAILED` (`500`)

## Python Publisher Compatibility Notes

Publisher must send snake_case keys exactly as above.

Do **not** send:

- `content` (use `analysis`)
- `originalPostUrl` (use `original_post_url`)
- `originalText` (use `original_text`)

`publish_date` fallback values like `"غير معروف"` are invalid and will be rejected with `422`.
