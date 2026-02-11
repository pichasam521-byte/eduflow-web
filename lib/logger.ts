import { createClient } from '@/lib/supabase/server'

interface LogMetadata {
    [key: string]: any
}

export async function systemLog(
    level: 'INFO' | 'WARN' | 'ERROR' | 'ACTION',
    message: string,
    metadata?: LogMetadata,
    userId?: string,
    path?: string
) {
    // 1. Console Log (Immediate Feedback for Dev)
    const timestamp = new Date().toISOString()
    const logPrefix = `[${timestamp}][${level}]${path ? `[${path}]` : ''}`

    if (level === 'ERROR') {
        console.error(logPrefix, message, metadata)
    } else {
        console.log(logPrefix, message)
    }

    // 2. Database Log (Persistent Storage for Maintainability)
    try {
        const supabase = await createClient()

        // If userId is not provided, try to get from current session
        let finalUserId = userId
        if (!finalUserId) {
            const { data: { user } } = await supabase.auth.getUser()
            finalUserId = user?.id
        }

        await supabase.from('system_logs').insert({
            level,
            message,
            metadata: metadata || {},
            user_id: finalUserId,
            path
        })
    } catch (err) {
        // Fallback if DB logging fails (prevent infinite loop)
        console.error('Failed to write system log:', err)
    }
}
