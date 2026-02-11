-- ล้าง Policy เก่าทั้งหมดก่อนสร้างใหม่ เพื่อป้องกัน Error "Already exists"
DROP POLICY IF EXISTS "Creators can manage lessons" ON course_lessons;
DROP POLICY IF EXISTS "Public can view lessons" ON course_lessons;
DROP POLICY IF EXISTS "Creators can insert lessons" ON course_lessons;
DROP POLICY IF EXISTS "Creators can update lessons" ON course_lessons;
DROP POLICY IF EXISTS "Creators can delete lessons" ON course_lessons;

-- สร้าง Policy ใหม่แบบแยกการทำงาน

-- 1. SELECT: ใครๆ ก็อ่านบทเรียนได้ (Public Read)
CREATE POLICY "Public can view lessons"
ON course_lessons FOR SELECT
USING (true);

-- 2. INSERT: เฉพาะ Creator เจ้าของคอร์ส
CREATE POLICY "Creators can insert lessons"
ON course_lessons FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM contents 
        WHERE id = course_lessons.course_id 
        AND creator_id = auth.uid()
    )
);

-- 3. UPDATE: เฉพาะ Creator เจ้าของคอร์ส
CREATE POLICY "Creators can update lessons"
ON course_lessons FOR UPDATE
USING (
    EXISTS (
        SELECT 1 
        FROM contents 
        WHERE id = course_lessons.course_id 
        AND creator_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM contents 
        WHERE id = course_lessons.course_id 
        AND creator_id = auth.uid()
    )
);

-- 4. DELETE: เฉพาะ Creator เจ้าของคอร์ส
CREATE POLICY "Creators can delete lessons"
ON course_lessons FOR DELETE
USING (
    EXISTS (
        SELECT 1 
        FROM contents 
        WHERE id = course_lessons.course_id 
        AND creator_id = auth.uid()
    )
);
