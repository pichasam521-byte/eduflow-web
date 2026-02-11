'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { systemLog } from '@/lib/logger' // Add Logger

export async function deleteCourseAction(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        await systemLog('WARN', 'Unauthorized delete attempt', { courseId }, undefined, 'deleteCourseAction') // Use undefined instead of user?.id (which is null here)
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const { data: course } = await supabase
        .from('contents')
        .select('creator_id, title')
        .eq('id', courseId)
        .single()

    if (!course || course.creator_id !== user.id) {
        // user.id is safe here because we checked !user above
        await systemLog('WARN', 'Forbidden delete attempt: Not owner', { courseId, userId: user.id }, user.id, 'deleteCourseAction')
        throw new Error("Forbidden: You do not own this course")
    }

    // ... Unenroll Action ...

    if (!user) {
        await systemLog('WARN', 'Unauthorized unenroll attempt', { courseId }, undefined, 'unenrollCourseAction') // Use undefined
        throw new Error("Unauthorized")
    }

    // Delete
    const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', courseId)

    if (error) {
        await systemLog('ERROR', 'Delete Course Failed', { error, courseId }, user.id, 'deleteCourseAction')
        console.error("Delete Error:", error)
        throw new Error(error.message)
    }

    // Success Log (Audit Trail NFR 2.5)
    await systemLog('ACTION', `Course deleted: ${course.title} (${courseId})`, { courseTitle: course.title }, user.id, 'deleteCourseAction')

    revalidatePath('/creator')
    return { success: true }
}

export async function unenrollCourseAction(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        await systemLog('WARN', 'Unauthorized unenroll attempt', { courseId }, undefined, 'unenrollCourseAction')
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)

    if (error) {
        await systemLog('ERROR', 'Unenroll Failed', { error, courseId }, user.id, 'unenrollCourseAction')
        console.error("Unenroll Error:", error)
        throw new Error(error.message)
    }

    // Success Log (UX Tracking NFR 2.5)
    await systemLog('INFO', `User unenrolled from course ${courseId}`, { courseId }, user.id, 'unenrollCourseAction')

    revalidatePath('/learner')
    return { success: true }
}
