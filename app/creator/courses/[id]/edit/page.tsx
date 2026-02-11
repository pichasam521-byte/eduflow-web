import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateCourse } from '@/app/actions/course'

export default async function EditCoursePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params

    // Protect Route
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch Course Data
    const { data: course, error } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id) // Security: ensure ownership
        .single()

    if (error || !course) {
        redirect('/creator')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">แก้ไขคอร์สเรียน</h1>
                    <Link href={`/creator/courses/${id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        &larr; ยกเลิกและกลับไปหน้าจัดการ
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    {/* Pass course ID via hidden input or bind arguments if using server actions directly */}
                    <form action={updateCourse} className="space-y-6 p-8">
                        <input type="hidden" name="id" value={course.id} />

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
                                    defaultValue={course.title}
                                    required
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
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
                                    defaultValue={course.description || ''}
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
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
                                        defaultValue={course.content_type}
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                        disabled // Usually changing type after creation is tricky, maybe disable or allow carefully
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
                                        defaultValue={course.status}
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    >
                                        <option value="draft">แบบร่าง (Draft)</option>
                                        <option value="pending_review">รอตรวจสอบ (Pending Review)</option>
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
                                        defaultValue={course.category || ''}
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
                                        defaultValue={course.tags ? course.tags.join(', ') : ''}
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                        placeholder="เช่น React, Webdev, Beginner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media URL */}
                        <div>
                            <label htmlFor="file_url" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                ลิงก์ไฟล์สื่อการเรียนรู้ (Video URL / PDF Link)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="file_url"
                                    id="file_url"
                                    defaultValue={course.file_url || ''}
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                />
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
                                    defaultValue={course.thumbnail_url || ''}
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-x-4">
                            <Link
                                href={`/creator/courses/${id}`}
                                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                            >
                                ยกเลิก
                            </Link>
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                อัปเดตข้อมูล
                            </button>
                        </div>
                    </form>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/20 px-8 py-6 border-t border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">ลบคอร์สเรียน</h3>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลและไฟล์ทั้งหมดจะถูกลบถาวร
                                </p>
                            </div>
                            <form action={async (formData) => {
                                'use server'
                                const { deleteCourse } = await import('@/app/actions/course')
                                await deleteCourse(formData)
                            }}>
                                <input type="hidden" name="id" value={course.id} />
                                <button
                                    type="submit"
                                    className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                // Add simple confirm via onclick (client-side) if possible, but strict server action doesn't allow easy prompt without client component.
                                // For MVP, we trust the "Danger" visual cue. 
                                >
                                    ลบคอร์ส
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
