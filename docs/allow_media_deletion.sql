-- 1. Avatars: อนุญาตให้ลบรูปตัวเองได้
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 2. Course Content (Cover Images): อนุญาตให้ลบรูปตัวเองได้
DROP POLICY IF EXISTS "Owners can delete their content" ON storage.objects;
CREATE POLICY "Owners can delete their content"
ON storage.objects FOR DELETE
USING ( bucket_id = 'course-content' AND auth.uid() = owner );

-- 3. Lesson Files (Videos/PDFs): อนุญาตให้ลบไฟล์ตัวเองได้
-- (อันนี้อาจมีอยู่แล้วจาก FOR ALL แต่แยกออกมาให้ชัดเจนก็ดี หรือปล่อยไว้ถ้า FOR ALL ครอบคลุม)
-- เช็ค Policy 'Users can update/delete their own lesson files'
-- ถ้าต้องการแยกเพื่อความชัดเจน:
DROP POLICY IF EXISTS "Users can delete their lesson files" ON storage.objects;
CREATE POLICY "Users can delete their lesson files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'lesson-files' AND auth.uid() = owner );

-- 4. General Policy (Optional): ถ้าอยากให้ลบได้ทุกไฟล์ที่เป็นของตัวเองในทุก Bucket
-- CREATE POLICY "Users can delete own files anywhere"
-- ON storage.objects FOR DELETE
-- USING ( auth.uid() = owner );
