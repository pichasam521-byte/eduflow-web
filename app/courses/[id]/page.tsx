import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EnrollButton from '@/components/EnrollButton'
import { CourseUnenrollButton, CourseDeleteButton } from '@/app/creator/CourseActions'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch course details
    const { data: course } = await supabase
        .from('contents')
        .select('*, users(full_name)')
        .eq('id', id)
        .single()

    if (!course) {
        notFound()
    }

    // 2. Fetch Lessons
    const { data: lessons } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true })

    // 3. CHECK ENROLLMENT
    const { data: { user } } = await supabase.auth.getUser()
    let isEnrolled = false

    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .single()

        if (enrollment) {
            isEnrolled = true
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen">
            {/* Header / Banner */}
            <div className="relative bg-gray-800 pb-32 overflow-hidden h-96">
                <div className="absolute inset-0">
                    {course.thumbnail_url ? (
                        <img className="w-full h-full object-cover opacity-40 ml-auto mr-auto" src={course.thumbnail_url} alt={course.title} />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-gray-900 opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" aria-hidden="true" />
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 h-full flex flex-col justify-end">
                    <span className="bg-indigo-600/90 text-white px-3 py-1 rounded-full text-sm font-medium w-fit mb-4">
                        {course.content_type === 'course' ? 'คอร์สเรียน' : 'สื่อการเรียนรู้'}
                    </span>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">{course.title}</h1>
                    <div className="mt-4 flex items-center gap-4 text-gray-200">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                            <span>โดย {course.users?.full_name || 'ผู้สอน'}</span>
                        </div>
                        <span>•</span>
                        <span>{lessons?.length || 0} บทเรียน</span>
                    </div>
                </div>
            </div>

            {/* Content & Sidebar */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">รายละเอียดคอร์ส</h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                {course.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                            </div>
                        </div>

                        {/* Curriculum / Lessons List */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                    เนื้อหาบทเรียน
                                </h3>
                                <span className="text-sm text-gray-500">{lessons?.length || 0} ตอน</span>
                            </div>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {lessons && lessons.length > 0 ? (
                                    lessons.map((lesson, index) => (
                                        <li key={lesson.id} className="group hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-colors">
                                            {/* Link disabled if not enrolled and not preview */}
                                            {isEnrolled || lesson.is_preview || (user && user.id === course.creator_id) ? (
                                                <Link
                                                    href={`/learn/${id}/${lesson.id}`}
                                                    className="block p-4 sm:px-6"
                                                >
                                                    <LessonItemContent lesson={lesson} index={index} />
                                                </Link>
                                            ) : (
                                                <div className="block p-4 sm:px-6 cursor-not-allowed opacity-75">
                                                    <LessonItemContent lesson={lesson} index={index} locked />
                                                </div>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        ยังไม่มีเนื้อหาในขณะนี้
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar / CTA */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">เข้าเรียนคอร์สนี้</h3>

                            {/* Price (MVP Free) */}
                            <div className="flex items-baseline mb-6">
                                <span className="text-3xl font-extrabold text-green-600">ฟรี</span>
                                <span className="ml-2 text-sm text-gray-500 line-through">฿0.00</span>
                            </div>

                            {/* Action Button */}
                            {user && user.id === course.creator_id ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-200 mb-4 flex items-start gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>คุณเป็นเจ้าของคอร์สนี้</span>
                                    </div>
                                    <Link
                                        href={`/creator/courses/${id}`}
                                        className="w-full block text-center bg-indigo-600 border border-transparent rounded-lg shadow-lg py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    >
                                        แก้ไขบทเรียน
                                    </Link>
                                    <div className="flex justify-center pt-2 w-full">
                                        <div className="w-full">
                                            <CourseDeleteButton courseId={id} />
                                        </div>
                                    </div>
                                </div>
                            ) : isEnrolled ? (
                                <>
                                    <Link
                                        href={lessons && lessons.length > 0 ? `/learn/${id}/${lessons[0].id}` : '#'}
                                        className="w-full block text-center bg-green-600 border border-transparent rounded-lg shadow-lg py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all hover:scale-[1.02]"
                                    >
                                        เข้าเรียนต่อ
                                    </Link>
                                    <div className="mt-3 text-center">
                                        <CourseUnenrollButton courseId={id} />
                                    </div>
                                </>
                            ) : (
                                user ? (
                                    <EnrollButton courseId={id} />
                                ) : (
                                    <Link
                                        href={`/login?redirect=/courses/${id}`}
                                        className="w-full block text-center bg-indigo-600 border border-transparent rounded-lg shadow-lg py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
                                    >
                                        เข้าสู่ระบบเพื่อลงทะเบียน
                                    </Link>
                                )
                            )}

                            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center gap-1">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>เรียนได้ตลอดชีพ</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>ใบประกาศฯ</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    <span>เรียนได้ทุกที่</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function LessonItemContent({ lesson, index, locked }: { lesson: any, index: number, locked?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${locked ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
                    {index + 1}
                </div>
                <div>
                    <p className={`text-sm font-medium transition-colors ${locked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                        {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 capitalize">
                            {lesson.content_type}
                        </span>
                        {lesson.is_preview && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ดูฟรี
                            </span>
                        )}
                        {locked && !lesson.is_preview && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                ล็อก
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                {locked && !lesson.is_preview ? (
                    <svg className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                ) : (
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
        </div>
    )
}
