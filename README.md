# EduFlow - แพลตฟอร์มการเรียนรู้และแบ่งปันความรู้

## เกี่ยวกับโปรเจกต์
EduFlow คือเว็บแอปพลิเคชันสำหรับการเรียนรู้ (Learning Platform) ที่พัฒนาด้วย Next.js และ Tailwind CSS
ฐานข้อมูล: PostgreSQL (Supabase)

## การติดตั้งและใช้งาน
1.  ตรวจสอบว่าติดตั้ง Node.js แล้ว
2.  เปิด Terminal ที่โฟลเดอร์โปรเจกต์ `e:\er\eduflow`
3.  รันคำสั่ง `npm install` (ถ้ายังไม่ได้ทำ)
4.  สร้างไฟล์ `.env.local` ตามตัวอย่าง `.env.local.example` และใส่ค่า Supabase URL/Key
5.  รันคำสั่ง `npm run dev` เพื่อเริ่มเซิร์ฟเวอร์
6.  เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## เอกสารการออกแบบ (Design Docs)
เอกสารทั้งหมดอยู่ในโฟลเดอร์ `docs/`:
-   `database_schema.sql`: โครงสร้างฐานข้อมูล (นำไป Run ใน SQL Editor ของ Supabase)
-   `er_diagram.md`: แผนภาพ ER Diagram
-   `use_case_diagram.md`: แผนภาพ Use Case
-   `class_diagram.md`: แผนภาพ Class Diagram

## โครงสร้างโปรเจกต์
-   `app/`: หน้าเว็บและ API Routes (Next.js App Router)
-   `components/`: คอมโพเนนต์ต่างๆ (ปุ่ม, ฟอร์ม, การ์ด)
-   `lib/`: ฟังก์ชันหรือเครื่องมือเสริม (เช่น Supabase Client)
-   `public/`: ไฟล์รูปภาพหรือสินทรัพย์อื่นๆ
