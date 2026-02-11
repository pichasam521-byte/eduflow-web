'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Helper function to generate dummy email
const generateEmail = (username: string) => `${username.toLowerCase()}@eduflow.local`

export async function login(formData: FormData) {
    const supabase = await createClient()

    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
    }

    // Convert username to dummy email
    const email = generateEmail(username)

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // If error, it might be incorrect username or password
    if (error) {
        return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
    }

    // Check user role to redirect correctly
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        let { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        // Auto-fix: If profile is missing (e.g. signup error), create a default learner profile
        if (!profile) {
            console.log('Profile missing for user, creating default learner profile...')
            const name = user.user_metadata?.full_name || username

            const { error: insertError } = await supabase.from('users').insert({
                id: user.id,
                email: user.email!, // Email from auth is generated and safe
                full_name: name,
                role: 'learner', // Default to learner
                // username: username // We don't strictly need username column if not in schema, but good to have if schema has it
                // Based on auth.ts signup function, schema HAS username?
                // Step 1209 line 111 inserts username. So we should insert it.
                username: username
            })

            if (!insertError) {
                profile = { role: 'learner' }
            } else {
                console.error('Failed to auto-create profile:', insertError)
                // Fallback: assume learner to allow access (though page might break if profile needed)
                profile = { role: 'learner' }
            }
        }

        revalidatePath('/', 'layout')

        if (profile?.role === 'creator') {
            redirect('/creator')
        } else {
            redirect('/learner')
        }
    }

    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string // 'learner' or 'creator'

    if (!username || !password || !name) {
        return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
    }

    // Basic validation for username (alphanumeric only recommended)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { error: 'ชื่อผู้ใช้ควรประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง (_) เท่านั้น' }
    }

    // Convert username to dummy email
    const email = generateEmail(username)

    // 1. Check if username already exists in public.users (Custom Check)
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

    if (existingUser) {
        return { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }
    }

    // 2. SignUp with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                username: username, // Store username in metadata too
                role: role || 'learner',
            },
        },
    })

    if (error) {
        // Handle "User already registered" from Supabase side (email conflict)
        if (error.message.includes('already registered')) {
            return { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว (System Conflict)' }
        }
        return { error: error.message }
    }

    if (data.user) {
        // 3. Insert into public.users table
        const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            username: username,
            // email removed
            full_name: name,
            role: role || 'learner',
        })

        if (profileError) {
            console.error('Error creating user profile:', profileError)
            // Optional: Delete the auth user if profile creation fails to keep consistency
            // await supabase.auth.admin.deleteUser(data.user.id)
            return { error: 'สมัครสมาชิกสำเร็จ แต่ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้: ' + profileError.message }
        }
    }

    // Auth signup might return error but data could be null.
    // The previous check handles database error, this catches other auth errors if data.user is null but error exists.
    // However, we already checked 'if (error)' earlier (line 107), so we don't need 'else might' here.

    revalidatePath('/', 'layout')
    const message = encodeURIComponent('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผู้ใช้งานของคุณ')
    redirect(`/login?message=${message}`)
}
