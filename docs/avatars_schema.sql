-- Storage Bucket สำหรับรูปโปรไฟล์ (Avatars)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: ทุกคนดูได้ (Public Read)
CREATE POLICY "Public Avatars Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- RLS Policy: เจ้าของอัปโหลดและลบรูปตัวเองได้ (Manage Own Files)
CREATE POLICY "User can manage their own avatar"
ON storage.objects
FOR ALL
USING (bucket_id = 'avatars' AND auth.uid() = owner);
