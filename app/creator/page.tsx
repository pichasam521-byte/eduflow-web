import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CourseDeleteButton } from './CourseActions'

export default async function CreatorDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'creator') {
        redirect('/learner')
    }

    // Fetch created courses (Example query)
    const { data: myCourses } = await supabase
        .from('contents')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard ผู้สอน
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                            สวัสดีคุณครู, {profile?.full_name || user.email}
                        </span>
                        <Link
                            href="/creator/courses/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            + สร้างคอร์สใหม่
                        </Link>
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">จำนวนคอร์สทั้งหมด</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{myCourses?.length || 0}</dd>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">ผู้เรียนทั้งหมด</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">0</dd>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">รายได้รวม</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">฿0.00</dd>
                        </div>
                    </div>

                    {/* Course List */}
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">คอร์สของคุณ</h2>

                    {!myCourses || myCourses.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ยังไม่มีคอร์สเรียน</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">เริ่มต้นสร้างคอร์สเรียนแรกของคุณเลย!</p>
                            <div className="mt-6">
                                <Link
                                    href="/creator/courses/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    สร้างคอร์สใหม่
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                {myCourses.map((course) => (
                                    <li key={course.id}>
                                        <div className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-indigo-600 truncate">{course.title}</p>
                                                <div className="ml-2 flex-shrink-0 flex gap-2">
                                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${course.status === 'published' ? 'bg-green-100 text-green-800' :
                                                        course.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {course.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between items-center">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        {course.content_type}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center gap-3 sm:mt-0">
                                                    <CourseDeleteButton courseId={course.id} />
                                                    <Link
                                                        href={`/courses/${course.id}`}
                                                        className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                                    >
                                                        ดูตัวอย่าง
                                                    </Link>
                                                    <Link
                                                        href={`/creator/courses/${course.id}`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        จัดการเนื้อหา
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
