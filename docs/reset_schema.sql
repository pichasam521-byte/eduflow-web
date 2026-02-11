-- ล้างตารางเก่าทั้งหมดก่อน (เรียงลำดับจากตารางลูกไปตารางแม่ เพื่อไม่ให้ติด Foreign Key)
DROP TABLE IF EXISTS interaction_history CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS content_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- เริ่มสร้างตารางใหม่
-- ตาราง Users (ผู้ใช้งาน)
-- ตาราง Users (ผู้ใช้งาน)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE, -- รหัสผู้ใช้งาน (User ID) เช่น รหัสนักศึกษา/รหัสอาจารย์
    -- email column removed as per requirement
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) CHECK (role IN ('learner', 'creator')) DEFAULT 'learner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตาราง Contents (เนื้อหา/สื่อการเรียนรู้)
CREATE TABLE contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'pdf', 'article', 'audio')),
    file_url TEXT,
    thumbnail_url TEXT,
    status VARCHAR(20) CHECK (status IN ('draft', 'pending_review', 'published')) DEFAULT 'draft',
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตาราง Tags (หมวดหมู่/แท็ก)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ตารางเชื่อมโยง Content กับ Tags (Many-to-Many)
CREATE TABLE content_tags (
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

-- ตาราง Comments (ความคิดเห็น)
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตาราง InteractionHistory (ประวัติการเข้าชม/การใช้งาน)
CREATE TABLE interaction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    action_type VARCHAR(50) CHECK (action_type IN ('view', 'like', 'complete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_contents_title ON contents(title);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_interaction_user ON interaction_history(user_id);

-- (Optional) เพิ่มข้อมูลตัวอย่าง (Seed Data)
INSERT INTO users (username, full_name, role) VALUES 
('66001', 'Learner Demo', 'learner'),
('T001', 'Creator Demo', 'creator');
