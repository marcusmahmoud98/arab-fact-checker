import os
from dotenv import load_dotenv

load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BLOG_API_URL = os.getenv("BLOG_API_URL")
BLOG_API_SECRET = os.getenv("BLOG_API_SECRET")

# كام بوست ناخد في كل مرة
POSTS_LIMIT = 10

# كام ساعة بين كل run
SCHEDULE_HOURS = 3
