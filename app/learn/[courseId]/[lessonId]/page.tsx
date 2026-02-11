import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export default async function LearnPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
    const supabase = await createClient()
    const { courseId, lessonId } = await params

    // 1. Fetch Course & Lessons
    const { data: course } = await supabase
        .from('contents')
        .select('title')
        .eq('id', courseId)
        .single()

    const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id, title, content_type, is_preview')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true })

    if (!course || !lessons) {
        notFound()
    }

    // 2. Fetch Current Lesson Detail
    const { data: currentLesson } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

    if (!currentLesson) {
        // If lesson not found, redirect to first lesson if available
        if (lessons.length > 0) {
            redirect(`/learn/${courseId}/${lessons[0].id}`)
        } else {
            notFound()
        }
    }

    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden flex-col md:flex-row">

            {/* Sidebar (Desktop: Left, Mobile: Hidden/Bottom) */}
            <aside className="w-full md:w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href={`/courses/${courseId}`} className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-2 inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        กลับหน้าหลักคอร์ส
                    </Link>
                    <h2 className="font-bold text-gray-900 dark:text-white truncate" title={course.title}>
                        {course.title}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lessons.map((lesson, index) => {
                            const isActive = lesson.id === lessonId
                            return (
                                <li key={lesson.id}>
                                    <Link
                                        href={`/learn/${courseId}/${lesson.id}`}
                                        className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'}`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-200'}`}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                                                        {lesson.content_type === 'video' && (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        )}
                                                        {lesson.content_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-100 dark:bg-gray-900">
                <div className="max-w-5xl mx-auto w-full p-4 md:p-8">

                    {/* Video Player / Content Viewer */}
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg shadow-2xl overflow-hidden mb-8 relative group">
                        {currentLesson.content_type === 'video' && currentLesson.file_url ? (
                            <video
                                src={currentLesson.file_url}
                                controls
                                className="w-full h-full object-contain max-h-[70vh]"
                                poster="https://placehold.co/1920x1080/1f2937/ffffff?text=Video+Player"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : currentLesson.content_type === 'pdf' ? (
                            <div className="flex items-center justify-center h-96 bg-gray-800 text-white flex-col gap-4">
                                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                <p className="text-xl font-medium">เอกสาร PDF</p>
                                {currentLesson.file_url && (
                                    <a
                                        href={currentLesson.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full transition-colors font-medium"
                                    >
                                        ดาวน์โหลด / เปิดอ่าน
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-96 bg-gray-800 text-white">
                                <p>รูปแบบเนื้อหานี้ยังไม่รองรับการแสดงผล ({currentLesson.content_type})</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentLesson.title}</h1>
                            {/* Navigation Buttons (Prev/Next) could go here */}
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            {currentLesson.description ? (
                                <p className="whitespace-pre-line">{currentLesson.description}</p>
                            ) : (
                                <p className="text-gray-400 italic">ไม่มีคำอธิบายเพิ่มเติม</p>
                            )}
                        </div>
                    </div>

                    {/* Comments Section (Placeholder) */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ความคิดเห็น & ถาม-ตอบ</h3>
                        <div className="text-center py-8 text-gray-500">
                            Feature นี้จะเปิดใช้งานเร็วๆ นี้
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
