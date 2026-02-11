'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const fullName = formData.get('fullName') as string
    const avatarUrl = formData.get('avatarUrl') as string

    // 2. Validate
    if (!fullName || fullName.trim() === '') {
        return { error: 'กรุณากรอกชื่อ-นามสกุล' }
    }

    // 3. Update User Profile
    const { error } = await supabase
        .from('users')
        .update({
            full_name: fullName,
            avatar_url: avatarUrl, // Update avatar URL if provided (handled by client upload)
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update profile error:', error)
        return { error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' }
    }

    // 4. Revalidate & Return Success
    revalidatePath('/profile')
    revalidatePath('/', 'layout') // Revalidate Navbar profile info

    return { success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' }
}

export async function changePassword(formData: FormData) {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // 2. Validate
    if (!password || password.length < 6) {
        return { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }
    }
    if (password !== confirmPassword) {
        return { error: 'รหัสผ่านยืนยันไม่ตรงกัน' }
    }

    // 3. Update Password via Supabase Auth
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Change password error:', error)
        return { error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้: ' + error.message }
    }

    return { success: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' }
}

export async function deleteAccount() {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'ไม่พบผู้ใช้งาน' }
    }

    // 2. Delete User Data (Cascade will handle related data if set up, currently we delete from users table)
    // Note: Deleting from public.users usually doesn't delete from auth.users automaticallly without trigger.
    // For MVP, we delete public profile and sign out.
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

    if (error) {
        console.error('Delete account error:', error)
        return { error: 'ไม่สามารถลบบัญชีได้: ' + error.message }
    }

    // 3. Sign Out
    await supabase.auth.signOut()

    redirect('/login')
}
