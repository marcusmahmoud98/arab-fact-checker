CREATE TABLE IF NOT EXISTS posts (
  sqlid BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  claim_summary TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  publish_date DATE NOT NULL,
  verdict TEXT NOT NULL CHECK (
    verdict IN ('كاذب بالكامل', 'مضلل', 'لم يحدث', 'غير حقيقي', 'صحيح', 'غير مؤكد')
  ),
  analysis TEXT NOT NULL,
  original_post_url TEXT NOT NULL,
  original_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
