-- ตาราง Users (ผู้ใช้งาน)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- สำหรับกรณีล็อกอินด้วยอีเมล (ถ้าใช้ Auth Provider อาจเป็น NULL ได้)
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
    file_url TEXT, -- ลิงก์ไฟล์สื่อ (เช่น เก็บใน Supabase Storage หรือ Youtube Link)
    thumbnail_url TEXT, -- ภาพปก
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
    action_type VARCHAR(50) CHECK (action_type IN ('view', 'like', 'complete')), -- เช่น ดู, ชอบ, เรียนจบ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_contents_title ON contents(title);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_interaction_user ON interaction_history(user_id);
