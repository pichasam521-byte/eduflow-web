'use client'

import { useState } from 'react'
import { deleteCourseAction, unenrollCourseAction } from './actions'
import { useRouter, usePathname } from 'next/navigation'

export function CourseDeleteButton({ courseId }: { courseId: string }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const handleDelete = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            return
        }

        setIsPending(true)
        try {
            await deleteCourseAction(courseId)

            // If we are on the course detail page, redirect away
            if (pathname.includes(`/courses/${courseId}`)) {
                router.replace('/creator')
            } else {
                router.refresh() // Just refresh if on dashboard
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการลบ: ' + error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
        >
            {isPending ? (
                <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            )}
            ลบคอร์ส
        </button>
    )
}

export function CourseUnenrollButton({ courseId }: { courseId: string }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleUnenroll = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการลงทะเบียนคอร์สนี้? ข้อมูลการเรียนของคุณอาจสูญหาย')) {
            return
        }

        setIsPending(true)
        try {
            await unenrollCourseAction(courseId)
            router.refresh()
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleUnenroll}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors"
        >
            {isPending ? 'กำลังยกเลิก...' : 'ยกเลิกการลงทะเบียน'}
        </button>
    )
}
