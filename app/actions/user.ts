'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upgradeToCreator() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'กรุณาเข้าสู่ระบบ' }
    }

    const { error } = await supabase
        .from('users')
        .update({ role: 'creator' })
        .eq('id', user.id)

    if (error) {
        return { error: 'เกิดข้อผิดพลาดในการอัปเกรดสถานะ' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
