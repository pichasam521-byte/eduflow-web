import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CourseUnenrollButton } from '../creator/CourseActions'

export default async function LearnerDashboard() {
    const supabase = await createClient()

    // 1. Protect route
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    // 3. Fetch Enrolled Courses
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            *,
            contents (
                id,
                title,
                description,
                thumbnail_url,
                content_type,
                users (full_name)
            )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard ผู้เรียน
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            ยินดีต้อนรับ, {profile?.full_name || user.email}
                        </div>
                        <form action={async () => {
                            'use server'
                            const { upgradeToCreator } = await import('@/app/actions/user')
                            await upgradeToCreator()
                            redirect('/creator')
                        }}>
                            <button
                                type="submit"
                                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100 border border-indigo-200 transition-colors"
                            >
                                สมัครเป็นผู้สอน
                            </button>
                        </form>
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

                    {/* Courses Grid */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            คอร์สที่คุณกำลังเรียน ({enrollments?.length || 0})
                        </h2>

                        {!enrollments || enrollments.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">คุณยังไม่ได้ลงทะเบียนเรียนคอร์สใดๆ</p>
                                <p className="text-gray-400 text-sm mb-6">เริ่มต้นการเรียนรู้ของคุณได้เลยวันนี้</p>
                                <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-105">
                                    ค้นหาคอร์สที่น่าสนใจ
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrollments.map((enroll) => {
                                    const course = enroll.contents
                                    // Handle missing content gracefully
                                    if (!course) return null

                                    return (
                                        <div key={enroll.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                                            {/* Thumbnail */}
                                            <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full relative">
                                                {course.thumbnail_url ? (
                                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold opacity-75">
                                                        {course.title.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                    {course.content_type === 'course' ? 'คอร์สเรียน' : 'สื่อความรู้'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2" title={course.title}>
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                                        {course.description || 'ไม่มีรายละเอียด'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto mb-4">
                                                    <div className="flex items-center text-xs text-gray-400">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                                        สอนโดย {course.users?.full_name || 'ไม่ระบุ'}
                                                    </div>
                                                    <CourseUnenrollButton courseId={course.id} />
                                                </div>

                                                <Link
                                                    href={`/courses/${course.id}`}
                                                    className="w-full block text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm"
                                                >
                                                    เข้าเรียนต่อ
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommended Section */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                            แนะนำสำหรับคุณ
                        </h2>
                        <RecommendedSection userId={user.id} enrolledIds={enrollments?.map(e => e.content_id) || []} />
                    </div>
                </div>
            </main>
        </div>
    )
}

async function RecommendedSection({ userId, enrolledIds }: { userId: string, enrolledIds: string[] }) {
    const supabase = await createClient()

    // 1. Get User Interests (History)
    const { data: history } = await supabase
        .from('interaction_history')
        .select('content_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // 2. Fetch Recommended
    // For MVP: Fetch Published courses NOT in enrolledIds
    let query = supabase
        .from('contents')
        .select('*, users(full_name)')
        .eq('status', 'published')
        .limit(3)

    if (enrolledIds.length > 0) {
        // filter out enrolled (Note: valid UUIDs only required if enrolledIds is not empty)
        // Using not.in filter properly requiring a list
        query = query.not('id', 'in', `(${enrolledIds.map(id => `"${id}"`).join(',')})`)
    }

    const { data: recommendations } = await query

    if (!recommendations || recommendations.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">ยังไม่มีคอร์สแนะนำเพิ่มเติมในขณะนี้</p>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((course: any) => (
                <Link href={`/courses/${course.id}`} key={course.id} className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">📚</div>
                        )}
                        {course.category && (
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {course.category}
                            </span>
                        )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                            <span>{course.users?.full_name}</span>
                            <span className="text-indigo-500 font-medium">ดูรายละเอียด &rarr;</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
