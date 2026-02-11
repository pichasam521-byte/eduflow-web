'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import VideoPlayer from '@/components/VideoPlayer'

export default function LessonPage() {
    const params = useParams()
    const { id: courseId, lessonId } = params as { id: string, lessonId: string }
    const router = useRouter()

    const [lesson, setLesson] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState<'started' | 'completed'>('started')

    useEffect(() => {
        if (!lessonId) return

        const fetchLesson = async () => {
            const supabase = createClient()

            // 1. Fetch Lesson Data
            const { data, error } = await supabase
                .from('course_lessons')
                .select('*')
                .eq('id', lessonId)
                .single()

            if (error) {
                console.error(error)
                router.push(`/courses/${courseId}`) // Back if not found
                return
            }
            setLesson(data)

            // 2. Track View / Get Progress
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Upsert 'started' status if not exists
                // We'll update only if it's new
                const { data: existing } = await supabase
                    .from('lesson_progress')
                    .select('status')
                    .eq('user_id', user.id)
                    .eq('lesson_id', lessonId)
                    .single()

                if (existing) {
                    setProgress(existing.status)
                } else {
                    await supabase
                        .from('lesson_progress')
                        .insert({
                            user_id: user.id,
                            lesson_id: lessonId,
                            course_id: courseId,
                            status: 'started'
                        })
                }
            }
            setLoading(false)
        }

        fetchLesson()
    }, [lessonId, courseId, router])

    const markAsCompleted = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('lesson_progress')
            .update({ status: 'completed', last_watched_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)

        if (!error) {
            setProgress('completed')
        }
    }

    if (loading) return <div className="p-8 text-center">กำลังโหลดบทเรียน...</div>
    if (!lesson) return <div className="p-8 text-center text-red-500">ไม่พบบทเรียน</div>

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Validated Header/Navigation */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href={`/courses/${courseId}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        กลับหน้าคอร์ส
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md hidden sm:block">
                        {lesson.title}
                    </h1>
                    <div className="w-24"></div> {/* Spacer for center alignment */}
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Media Player Area */}
                <div className="bg-black rounded-xl overflow-hidden shadow-lg mb-8 aspect-video relative flex items-center justify-center">
                    {lesson.content_type === 'video' && (
                        <VideoPlayer src={lesson.file_url || lesson.upload_file_path} />
                    )}

                    {lesson.content_type === 'audio' && (
                        <div className="w-full p-8 bg-gray-900 flex flex-col items-center justify-center h-full">
                            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </div>
                            <audio controls className="w-full max-w-md" src={lesson.file_url || lesson.upload_file_path}>
                                Browser ไม่รองรับ Audio Element
                            </audio>
                        </div>
                    )}

                    {lesson.content_type === 'pdf' && (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center relative">
                            {/* Fallback / Embed */}
                            <iframe
                                src={lesson.file_url || lesson.upload_file_path}
                                className="w-full h-full"
                                title="PDF Viewer"
                            />
                            <div className="absolute bottom-4 right-4">
                                <a
                                    href={lesson.file_url || lesson.upload_file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm"
                                >
                                    เปิดในแท็บใหม่ / ดาวน์โหลด
                                </a>
                            </div>
                        </div>
                    )}

                    {lesson.content_type === 'article' && (
                        <div className="w-full h-full bg-white dark:bg-gray-800 p-8 overflow-y-auto prose dark:prose-invert max-w-none">
                            {/* Render Text Content (Description as body for MVP) */}
                            {/* In real app, render Markdown */}
                            <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                                {lesson.description || "ไม่มีเนื้อหาบทความ"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lesson Details & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{lesson.title}</h2>
                        {lesson.content_type !== 'article' && (
                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                                {lesson.description}
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-64 flex flex-col gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">ความคืบหน้า</h3>
                            {progress === 'completed' ? (
                                <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-center font-medium flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    เรียนจบแล้ว
                                </div>
                            ) : (
                                <button
                                    onClick={markAsCompleted}
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    ทำเครื่องหมายว่าเรียนจบ
                                </button>
                            )}
                        </div>

                        {/* Next Lesson Button Logic would go here */}
                        <div className="text-sm text-gray-500 text-center">
                            บทเรียนถัดไปจะปรากฏที่นี่ <br /> (ยังไม่รองรับใน Demo)
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
