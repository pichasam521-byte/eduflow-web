'use client'

import { useTransition } from 'react'
import { enrollCourse } from '@/app/actions/courses'
import { useRouter } from 'next/navigation'

export default function EnrollButton({ courseId }: { courseId: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleEnroll = () => {
        startTransition(async () => {
            await enrollCourse(courseId)
            // Server action revalidates path, but we can also refresh router
            router.refresh()
        })
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={isPending}
            className="w-full block text-center bg-indigo-600 border border-transparent rounded-lg shadow-lg py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? (
                <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังลงทะเบียน...
                </div>
            ) : (
                'ลงทะเบียนเรียนทันที'
            )}
        </button>
    )
}
