'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLesson(lessonId: string) {
    const supabase = await createClient()
    const { data: lesson, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

    if (error) return null
    return lesson
}

export async function trackLessonView(courseId: string, lessonId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return // Guest view doesn't track progress

    // Upsert tracking record
    // Using ON CONFLICT (user_id, lesson_id) provided by create table UNIQUE constraint
    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            status: 'started',
            last_watched_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, lesson_id'
        })

    if (error) console.error('Track lesson error:', error)
}
