import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Define Search Params Type (Next.js 15+)
type SearchParams = { [key: string]: string | string[] | undefined }

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const sp = searchParams // Await search params is not needed for Next.js 14/13, searchParams is already resolved.

    const query = typeof sp.q === 'string' ? sp.q : ''
    const category = typeof sp.category === 'string' ? sp.category : ''
    const tag = typeof sp.tag === 'string' ? sp.tag : ''

    // Pagination
    const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1
    const ITEMS_PER_PAGE = 12
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    // Build Query
    let queryBuilder = supabase
        .from('contents')
        .select('*, users(full_name)', { count: 'exact' }) // Add Count
        .eq('status', 'published') // Show only published courses
        .order('created_at', { ascending: false })
        .range(from, to)

    // Apply Filters
    if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`)
    }
    if (category) {
        queryBuilder = queryBuilder.eq('category', category)
    }
    if (tag) {
        // Filter by array containment (Postgres @> operator via Supabase .contains)
        queryBuilder = queryBuilder.contains('tags', [tag])
    }

    const { data: courses, error, count } = await queryBuilder

    // Pagination Controls
    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Get Unique Categories for Filter Dropdown (Optional: Hardcoded for MVP or fetched)
    const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Language']

    // Get Popular Tags (Mock for now or fetch distinct tags)
    const popularTags = ['React', 'Next.js', 'Python', 'UX/UI', 'Digital Marketing']

    // Helper to build query string for links
    const buildQueryString = (newPage: number, currentQuery: string, currentCategory: string, currentTag: string) => {
        const params = new URLSearchParams();
        if (currentQuery) params.set('q', currentQuery);
        if (currentCategory) params.set('category', currentCategory);
        if (currentTag) params.set('tag', currentTag);
        if (newPage > 1) params.set('page', newPage.toString());
        return params.toString() ? `?${params.toString()}` : '';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">คอร์สเรียนทั้งหมด</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">ค้นหาบทเรียนที่คุณสนใจจากพาร์ทเนอร์คุณภาพ</p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Input */}
                    <div className="flex-1 w-full">
                        <form action="/courses" method="GET" className="relative">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="ค้นหาชื่อคอร์ส, บทเรียน..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {/* Keep other params */}
                            {category && <input type="hidden" name="category" value={category} />}
                            {tag && <input type="hidden" name="tag" value={tag} />}
                            {page > 1 && <input type="hidden" name="page" value={page} />}
                        </form>
                    </div>

                    {/* Category Filter */}
                    <div className="w-full md:w-auto">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            <Link
                                href={buildQueryString(1, query, '', tag)} // Reset category, keep query/tag, reset page
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${!category ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                            >
                                ทั้งหมด
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={buildQueryString(1, query, cat, tag)} // Set category, keep query/tag, reset page
                                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Optional: Active Filters Display */}
                {(query || category || tag) && (
                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                        <span>ผลการค้นหาสำหรับ:</span>
                        {query && <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>}
                        {category && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-xs">{category}</span>}
                        {tag && <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-md text-xs">#{tag}</span>}
                        <Link href="/courses" className="text-red-500 hover:text-red-600 underline ml-2">ล้างตัวกรอง</Link>
                    </div>
                )}


                {/* Content Grid */}
                {courses && courses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {courses.map((course: any) => (
                                <Link href={`/courses/${course.id}`} key={course.id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ring-1 ring-gray-900/5 dark:ring-white/10 h-full">
                                    {/* Thumbnail */}
                                    <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative h-48">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                loading="lazy" // Lazy Load Image
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                                                <span className="text-4xl">📚</span>
                                            </div>
                                        )}
                                        {course.category && (
                                            <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                                {course.category}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.content_type === 'course' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}>
                                                    {course.content_type === 'course' ? 'คอร์สเรียน' : 'สื่อการเรียนรู้'}
                                                </span>
                                                {/* Show Tags if available */}
                                                {course.tags && course.tags.length > 0 && (
                                                    <div className="flex gap-1 overflow-hidden">
                                                        {course.tags.slice(0, 2).map((t: string) => (
                                                            <span key={t} className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 truncate">
                                                                #{t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                {course.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 truncate pr-2">
                                                <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <span className="truncate">{course.users?.full_name || 'ผู้สอน'}</span>
                                            </div>
                                            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform whitespace-nowrap">
                                                ดูรายละเอียด &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Link
                                    href={buildQueryString(page - 1, query, category, tag)}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${!hasPrevPage ? 'invisible' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    &larr; ก่อนหน้า
                                </Link>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    หน้า {page} / {totalPages}
                                </span>
                                <Link
                                    href={buildQueryString(page + 1, query, category, tag)}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${!hasNextPage ? 'invisible' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    ถัดไป &rarr;
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ไม่พบคอร์สเรียน</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ลองเปลี่ยนคำค้นหา หรือ หมวดหมู่ เพื่อดูคอร์สอื่นๆ</p>
                        <div className="mt-6">
                            <Link href="/courses" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                ดูคอร์สทั้งหมด
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
