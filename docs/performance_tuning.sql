-- Indexes for fast course filtering and searching
-- (Performance Requirement: Load lists within 3 seconds)

-- 1. Index for filtering by status (published/draft) and sorting by date
CREATE INDEX IF NOT EXISTS idx_contents_status_created_at 
ON contents(status, created_at DESC);

-- 2. Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_contents_category 
ON contents(category);

-- 3. Index for creator dashboards (finding own courses)
CREATE INDEX IF NOT EXISTS idx_contents_creator_id 
ON contents(creator_id);

-- 4. Index for full text search on title (Manual ILIKE optimization)
-- For proper Full Text Search, we might use pg_trgm in the future, 
-- but B-Tree works for prefix search (LIKE 'text%') or equality.
CREATE INDEX IF NOT EXISTS idx_contents_title 
ON contents(title);

-- 5. Index for lessons by course (speed up lesson loading in course page)
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id_order 
ON course_lessons(course_id, order_index);

-- 6. Index for user enrollments (fast access to "My Courses")
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id 
ON enrollments(user_id);

-- 7. Index for interaction history (fast recommendation queries)
CREATE INDEX IF NOT EXISTS idx_interaction_history_user_content 
ON interaction_history(user_id, content_id);
