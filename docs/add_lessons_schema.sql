-- ตาราง Course Lessons (บทเรียนย่อย หรือ งานในคลาส)
CREATE TABLE course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES contents(id) ON DELETE CASCADE, -- เชื่อมกับคอร์สหลัก
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'pdf', 'quiz', 'assignment')),
    file_url TEXT, -- ลิงก์ไฟล์ (Video/PDF)
    upload_file_path TEXT, -- path ใน Storage (เผื่อลบไฟล์)
    order_index INTEGER DEFAULT 0, -- สำหรับเรียงลำดับบทเรียน
    is_preview BOOLEAN DEFAULT false, -- เปิดให้ดูฟรีหรือไม่
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy สำหรับ course_lessons
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- ทุกคนอ่านบทเรียนได้ (ถ้าคอร์ส public) - *ในอนาคตอาจต้องเช็คว่า Enroll หรือยัง*
CREATE POLICY "Public can view lessons" 
ON course_lessons FOR SELECT 
USING (true);

-- Creator เจ้าของคอร์สเท่านั้นที่เพิ่ม/แก้ไข/ลบ บทเรียนได้
CREATE POLICY "Creators can manage lessons" 
ON course_lessons FOR ALL 
USING (
    auth.uid() IN (
        SELECT creator_id FROM contents WHERE id = course_lessons.course_id
    )
);

-- สร้าง Bucket เพิ่มเติมสำหรับเก็บไฟล์บทเรียน (Videos/PDFs) 
-- (ถ้ายังไม่ได้สร้าง bucket 'course-content' ให้ข้ามบรรทัดนี้ หรือรันซ้ำมันจะฟ้องว่ามีแล้ว)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-files', 'lesson-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy สำหรับ Storage 'lesson-files'
CREATE POLICY "Public Access to Lesson Files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'lesson-files' );

CREATE POLICY "Authenticated users can upload lesson files"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'lesson-files' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update/delete their own lesson files"
ON storage.objects FOR ALL
USING ( bucket_id = 'lesson-files' AND auth.uid() = owner );
