import unittest
from datetime import date

from publisher.payload_contract import WEBSITE_ALLOWED_VERDICTS, normalize_publish_payload


class PayloadContractTests(unittest.TestCase):
    def test_payload_matches_website_contract_with_valid_values(self):
        analysis_result = {
            "claim_title": "عنوان الادعاء",
            "source": "وزارة الصحة",
            "publish_date": "2026-05-01",
            "verdict": "مضلل",
            "analysis": "تحليل كامل",
        }
        post = {
            "url": "https://facebook.com/posts/123",
            "text": "post text",
        }

        payload, used_fallback = normalize_publish_payload(analysis_result, post)

        self.assertFalse(used_fallback)
        self.assertEqual(payload["publish_date"], "2026-05-01")
        self.assertIn(payload["verdict"], WEBSITE_ALLOWED_VERDICTS)
        self.assertEqual(payload["verdict"], "مضلل")
        self.assertEqual(payload["original_post_url"], post["url"])
        self.assertEqual(payload["original_text"], post["text"])
        self.assertTrue(payload["title"])
        self.assertTrue(payload["source"])
        self.assertTrue(payload["analysis"])

    def test_payload_normalizes_invalid_date_and_verdict(self):
        analysis_result = {
            "claim_title": "عنوان الادعاء",
            "source": "مصدر غير واضح",
            "publish_date": "غير معروف",
            "verdict": "بحاجة تحقق",
            "analysis": "نص التحليل",
        }
        post = {
            "url": "https://facebook.com/posts/999",
            "text": "raw post text",
        }

        payload, used_fallback = normalize_publish_payload(analysis_result, post)

        self.assertTrue(used_fallback)
        self.assertEqual(payload["publish_date"], date.today().strftime("%Y-%m-%d"))
        self.assertEqual(payload["verdict"], "غير مؤكد")
        self.assertIn(payload["verdict"], WEBSITE_ALLOWED_VERDICTS)


if __name__ == "__main__":
    unittest.main()
