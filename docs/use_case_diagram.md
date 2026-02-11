```mermaid
usecaseDiagram
    actor Learner as "ผู้เรียน (Learner)"
    actor Creator as "ผู้สร้างเนื้อหา (Content Creator)"
    actor Admin as "ผู้ดูแลระบบ (Admin)"

    package "EduFlow System" {
        usecase "ลงทะเบียน / เข้าสู่ระบบ" as UC1
        usecase "แก้ไขโปรไฟล์" as UC2
        usecase "ค้นหาและเรียกดูสื่อ" as UC3
        usecase "เข้าชมสื่อ (Video/PDF/etc)" as UC4
        usecase "แสดงความคิดเห็น" as UC5
        usecase "จัดการสื่อ (เพิ่ม/แก้ไข/ลบ)" as UC6
        usecase "เผยแพร่สื่อ (Publish)" as UC7
        usecase "ดูประวัติการเข้าชม" as UC8
    }

    Learner --> UC1
    Learner --> UC2
    Learner --> UC3
    Learner --> UC4
    Learner --> UC5
    Learner --> UC8

    Creator --> UC1
    Creator --> UC2
    Creator --> UC3
    Creator --> UC4
    Creator --> UC5
    Creator --> UC6
    Creator --> UC7
    Creator --> UC8
```
