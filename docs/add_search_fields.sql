-- เพิ่ม Column สำหรับ Category และ Tags ในตาราง contents เพื่อความง่ายในการค้นหา
ALTER TABLE contents 
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of text tags (e.g., ['react', 'nextjs'])

-- สร้าง Index เพื่อให้ค้นหาเร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category);
CREATE INDEX IF NOT EXISTS idx_contents_tags ON contents USING GIN(tags);

-- Function สำหรับค้นหา (Optional: Full Text Search แบบง่าย)
-- เราจะใช้ ILIKE ใน Supabase Client ก็เพียงพอสำหรับ MVP แต่ถ้าอยาก Advance ค่อยมาเพิ่ม
