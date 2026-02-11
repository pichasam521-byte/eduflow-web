-- Tracking Lesson Progress & History

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES contents(id) ON DELETE CASCADE, -- Denormalized for query performance
    status VARCHAR(20) CHECK (status IN ('started', 'completed')) DEFAULT 'started',
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id) -- Ensure one record per lesson per user
);

-- Index
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON lesson_progress(course_id);

-- RLS Policies
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update their own progress
CREATE POLICY "Users can update own progress" ON lesson_progress
    FOR ALL USING (auth.uid() = user_id);
