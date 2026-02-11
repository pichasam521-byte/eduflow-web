'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCourse(formData: FormData) {
    const supabase = await createClient()

    // 1. Check Auth & Creator Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'creator') {
        redirect('/learner?error=Unauthorized')
    }

    // 2. Validate Data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const contentType = formData.get('content_type') as string
    const status = formData.get('status') as string
    const fileUrl = formData.get('file_url') as string
    const thumbnailUrl = formData.get('thumbnail_url') as string

    // New Fields
    const category = formData.get('category') as string
    const tagsRaw = formData.get('tags') as string

    // Process Tags: "React, Web" -> ["React", "Web"]
    let tags: string[] = []
    if (tagsRaw) {
        tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }

    if (!title || !contentType) {
        redirect('/creator/courses/new?error=Missing+Data')
    }

    // 2. Insert into Database
    const { error } = await supabase.from('contents').insert({
        title,
        description,
        content_type: contentType,
        status,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        category: category,
        tags: tags,
        creator_id: user.id
    })

    if (error) {
        console.error('Create course error:', error)
        redirect('/creator/courses/new?error=Database+Error')
    }

    // 4. Revalidate & Redirect
    revalidatePath('/creator')
    revalidatePath('/courses')
    redirect('/creator')
}

export async function updateCourse(formData: FormData) {
    const supabase = await createClient()

    // 1. Check User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Validate Data
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const fileUrl = formData.get('file_url') as string
    const thumbnailUrl = formData.get('thumbnail_url') as string

    // New Fields
    const category = formData.get('category') as string
    const tagsRaw = formData.get('tags') as string

    // Process Tags
    let tags: string[] = []
    if (tagsRaw) {
        tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }

    if (!id || !title) {
        redirect(`/creator/courses/${id}/edit?error=Missing+Data`)
    }

    // 3. Update Database (Ensure creator owns it)
    const { error } = await supabase
        .from('contents')
        .update({
            title,
            description,
            status,
            file_url: fileUrl,
            thumbnail_url: thumbnailUrl,
            category: category,
            tags: tags,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('creator_id', user.id)

    if (error) {
        console.error(error)
        redirect(`/creator/courses/${id}/edit?error=Failed+to+update`)
    }

    redirect(`/creator/courses/${id}`)
}

export async function deleteCourse(formData: FormData) {
    const supabase = await createClient()

    // 1. Check User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const id = formData.get('id') as string
    if (!id) redirect('/creator?error=ID+Required')

    // 2. Delete Content Row
    // Note: Assuming RLS allows deletion based on owner policy
    const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id) // Security check

    if (error) {
        console.error('Delete Error:', error)
        redirect(`/creator/courses/${id}/edit?error=Failed+to+delete`)
    }

    revalidatePath('/creator')
    redirect('/creator')
}
