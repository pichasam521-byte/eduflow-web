import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCourse } from '@/app/actions/course'

export default async function NewCoursePage() {
    const supabase = await createClient()

    // Protect Route
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'creator') redirect('/learner')

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">สร้างคอร์สเรียนใหม่</h1>
                    <Link href="/creator" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        &larr; กลับไป Dashboard
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <form action={createCourse} className="space-y-6 p-8">

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                ชื่อคอร์ส / หัวข้อ <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    required
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    placeholder="เช่น สอนเขียนโปรแกรม Python เบื้องต้น"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                รายละเอียด / คำอธิบาย
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    placeholder="อธิบายสิ่งที่จะได้รับจากคอร์สนี้..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Content Type */}
                            <div>
                                <label htmlFor="content_type" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                    ประเภทสื่อ <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="content_type"
                                        name="content_type"
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    >
                                        <option value="video">วิดีโอ (Video)</option>
                                        <option value="pdf">เอกสาร PDF</option>
                                        <option value="article">บทความ (Article)</option>
                                        <option value="audio">เสียง (Audio)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                    สถานะ
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="status"
                                        name="status"
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    >
                                        <option value="draft">แบบร่าง (Draft)</option>
                                        <option value="published">เผยแพร่ทันที (Published)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category & Tags */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                    หมวดหมู่ <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="category"
                                        name="category"
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    >
                                        <option value="">เลือกหมวดหมู่</option>
                                        <option value="Programming">เขียนโปรแกรม (Programming)</option>
                                        <option value="Design">ออกแบบ (Design)</option>
                                        <option value="Business">ธุรกิจ (Business)</option>
                                        <option value="Marketing">การตลาด (Marketing)</option>
                                        <option value="Data Science">วิทยาศาสตร์ข้อมูล (Data Science)</option>
                                        <option value="Language">ภาษา (Language)</option>
                                        <option value="Other">อื่นๆ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                    Tags (คั่นด้วยจุลภาค)
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="tags"
                                        id="tags"
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                        placeholder="เช่น React, Webdev, Beginner"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">ช่วยให้ผู้เรียนค้นหาคอร์สของคุณเจอได้ง่ายขึ้น</p>
                                </div>
                            </div>
                        </div>

                        {/* Media URL */}
                        <div>
                            <label htmlFor="file_url" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                ลิงก์ไฟล์สื่อการเรียนรู้ (Video URL / PDF Link)
                            </label>
                            <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 dark:ring-gray-600">
                                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">https://</span>
                                    <input
                                        type="text"
                                        name="file_url"
                                        id="file_url"
                                        className="block flex-1 border-0 bg-transparent py-2.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                                        placeholder="youtube.com/watch?v=..."
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">หมายเหตุ: ในเวอร์ชัน Demo นี้กรุณาใส่เป็น External URL (เช่น YouTube, Google Drive)</p>
                            </div>
                        </div>

                        {/* Thumbnail URL */}
                        <div>
                            <label htmlFor="thumbnail_url" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                ลิงก์รูปภาพปก (Thumbnail URL)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="thumbnail_url"
                                    id="thumbnail_url"
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-x-4">
                            <Link
                                href="/creator"
                                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                            >
                                ยกเลิก
                            </Link>
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                บันทึกคอร์สเรียน
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}
