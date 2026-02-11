-- 1. สร้าง Bucket 'lesson-files' (ถ้ามีแล้วจะข้ามไป ไม่ Error)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-files', 'lesson-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. ลบ Policy เก่าก่อน (ป้องกัน Error ว่ามีชื่อซ้ำ)
DROP POLICY IF EXISTS "Public Access to Lesson Files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update/delete their own lesson files" ON storage.objects;

-- 3. สร้าง Policy ใหม่ (อนุญาตให้ Login User อัปโหลดได้)
CREATE POLICY "Public Access to Lesson Files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'lesson-files' );

CREATE POLICY "Authenticated users can upload lesson files"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'lesson-files' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update/delete their own lesson files"
ON storage.objects FOR ALL
USING ( bucket_id = 'lesson-files' AND auth.uid() = owner );
