'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function enrollCourse(courseId: string) {
    const supabase = await createClient()

    // 1. Get Logged In User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Check if already enrolled
    const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (existing) {
        // Enrolled already, just redirect to course page
        redirect(`/courses/${courseId}`)
    }

    // 3. Insert Enrollment
    const { error } = await supabase
        .from('enrollments')
        .insert({
            user_id: user.id,
            course_id: courseId,
        })

    if (error) {
        // Handle error (e.g. duplicate key or constraint)
        return { error: 'Failed to enroll course' }
    }

    // 4. Success -> Revalidate & Redirect
    revalidatePath(`/courses/${courseId}`)
    revalidatePath('/learner')

    // Redirect logic handled in client? Or here? 
    // In Server Action, redirect throws error, so catch it if need be. But here we want to go back or stay put?
    // Let's redirect to learning page? Or just reload.
    // Ideally user might want to start learning immediately.
    // Let's find first lesson ID first? Or just back to course detail which now shows "Continue Learning".

    // For now, revalidate and return success to client component to handle navigation.
    return { success: true }
}
