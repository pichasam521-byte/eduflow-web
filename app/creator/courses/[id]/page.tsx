import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Course Data
    const { data: course } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .single()

    if (!course) {
        return (
            <div className="text-center py-20 text-gray-500">
                <h2 className="text-2xl font-bold">ไม่พบคอร์สเรียนนี้</h2>
                <Link href="/creator" className="text-indigo-600 hover:underline mt-4 inline-block">กลับหน้าหลัก</Link>
            </div>
        )
    }

    // 2. Fetch Lessons
    const { data: lessons } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true })

    return (
        <div className="py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <Link href="/creator" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
                            &larr; กลับไป Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {course.title}
                            <span className={`text-sm px-2 py-1 rounded-full border ${course.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {course.status === 'published' ? 'เผยแพร่แล้ว' : 'แบบร่าง'}
                            </span>
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">{course.description}</p>

                        <div className="flex gap-2 mt-4 text-xs text-gray-500">
                            {course.category && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Category: {course.category}</span>}
                            {course.tags && course.tags.map((t: string) => (
                                <span key={t} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded">#{t}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/creator/courses/${id}/edit`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            แก้ไขคอร์ส
                        </Link>
                        <Link
                            href={`/creator/courses/${id}/lessons/new`}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            เพิ่มบทเรียนใหม่
                        </Link>
                    </div>
                </div>

                {/* Content List */}
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            บทเรียนและเนื้อหา ({lessons?.length || 0})
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            รายการวิดีโอ ใบงาน และเนื้อหาทั้งหมดในคอร์สนี้
                        </p>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lessons && lessons.length > 0 ? (
                            lessons.map((lesson, index) => (
                                <li key={lesson.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-400 font-mono text-sm w-6 text-center">{index + 1}</span>
                                            <div>
                                                <p className="text-sm font-medium text-indigo-600 truncate dark:text-indigo-400">
                                                    {lesson.title}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="capitalize bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                                        {lesson.content_type}
                                                    </span>
                                                    {lesson.is_preview && (
                                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">ดูฟรี</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* (Future: Add Edit/Delete buttons here) */}
                                            <button className="text-gray-400 hover:text-gray-500 p-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-12 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ยังไม่มีบทเรียน</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">เริ่มต้นสร้างบทเรียนแรกของคุณเลย!</p>
                                <div className="mt-6">
                                    <Link
                                        href={`/creator/courses/${id}/lessons/new`}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        เพิ่มบทเรียนใหม่
                                    </Link>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
