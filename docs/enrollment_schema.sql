-- ตาราง Enrollments (การลงทะเบียนเรียน)
CREATE TABLE enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE, -- วันที่เรียนจบ (เผื่อไว้)
    progress INTEGER DEFAULT 0, -- ความคืบหน้า % (เผื่อไว้)
    UNIQUE(user_id, course_id) -- ห้ามลงทะเบียนซ้ำในคอร์สเดิม
);

-- Policy
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- ผู้ใช้ดูข้อมูลการลงทะเบียนของตัวเองได้
CREATE POLICY "Users can view own enrollments" 
ON enrollments FOR SELECT 
USING (auth.uid() = user_id);

-- ผู้ใช้ลงทะเบียนเรียนเองได้ (Insert)
CREATE POLICY "Users can enroll themselves" 
ON enrollments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Creator สามารถดูจำนวนคนลงทะเบียนในคอร์สตัวเองได้ (ซับซ้อนหน่อย ไว้ก่อน หรือเปิด Public Read ถ้าไม่ซีเรียสเรื่อง Privacy มากใน MVP)
-- เพื่อความง่ายใน MVP ให้ Authenticated User อ่านได้ (เพื่อโชว์จำนวนคนเรียน)
CREATE POLICY "Authenticated users can view enrollments"
ON enrollments FOR SELECT
USING (auth.role() = 'authenticated');
