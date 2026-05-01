# Fact-Checker Pipeline 🔍

بايب لاين أوتوماتيك لسحب بوستات فيسبوك وعمل fact-check عليها ونشرها على البلوج.

## الإعداد

### 1. تثبيت المكتبات
```bash
pip install -r requirements.txt
```

### 2. إعداد الـ API Keys
انسخ الملف وحط فيه الـ keys بتاعتك:
```bash
cp .env.example .env
```

افتح `.env` وحط:
- `APIFY_API_TOKEN` - من Apify Settings
- `GEMINI_API_KEY` - من Google AI Studio
- `BLOG_API_URL` - رابط الـ API بتاع البلوج على Vercel
- `BLOG_API_SECRET` - سيكريت بتاعك للحماية

### 3. إضافة صفحات فيسبوك
ضيف الروابط في `scraper/pages.json`

### 4. تشغيل
```bash
python main.py
```

## الـ Flow
```
Facebook Pages → Apify Scraper → Gemini API → Blog on Vercel
(كل 3 ساعات)                    (fact-check)      (نشر أوتو)
```

## ملاحظات
- الـ pipeline بيحفظ البوستات اللي شافها في `data/seen_posts.json` عشان متكررش
- البوست بيتعلم "seen" بعد النشر الناجح عشان الفشل ما يضيعش فرص إعادة المحاولة
- التكلفة تقريباً حسب استهلاك Gemini + Apify
- Apify Free tier كافي للاستخدام العادي
