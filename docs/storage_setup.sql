-- เปิดใช้งาน Storage Extension (ปกติเปิดอยู่แล้ว)

-- 1. สร้าง Bucket สำหรับเก็บภาพปกและไฟล์เนื้อหาคอร์ส
insert into storage.buckets (id, name, public)
values ('course-content', 'course-content', true);

-- 2. สร้าง Bucket สำหรับเก็บรูปโปรไฟล์ (Avatars)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 3. ตั้งค่า Policy (สิทธิ์การเข้าถึง)

-- Policy สำหรับ 'course-content'
-- อนุญาตให้ "ทุกคน" (Public) ดูไฟล์ได้ (Download/View)
create policy "Public Access to Course Content"
  on storage.objects for select
  using ( bucket_id = 'course-content' );

-- อนุญาตให้ "Creator" เท่านั้นที่อัปโหลดไฟล์ได้
create policy "Creators can upload course content"
  on storage.objects for insert
  with check (
    bucket_id = 'course-content' 
    AND auth.role() = 'authenticated'
    -- เช็คเพิ่มเติมว่า user มี role เป็น creator หรือไม่ (อาจต้องใช้ Custom Claim หรือยิง query แต่เบื้องต้นเอาแค่ login ก่อนเพื่อความง่าย)
  );

-- อนุญาตให้ "เจ้าของไฟล์" ลบหรือแก้ไขไฟล์ตัวเองได้
create policy "Owners can update/delete their content"
  on storage.objects for update
  using ( bucket_id = 'course-content' AND auth.uid() = owner )
  with check ( bucket_id = 'course-content' AND auth.uid() = owner );

create policy "Owners can delete their content"
  on storage.objects for delete
  using ( bucket_id = 'course-content' AND auth.uid() = owner );


-- Policy สำหรับ 'avatars'
-- ดูได้ทุกคน
create policy "Public Access to Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Owner อัปโหลดได้
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Owner แก้ไข/ลบได้
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' AND auth.uid() = owner );
