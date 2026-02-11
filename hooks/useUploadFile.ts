import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface UploadOptions {
    bucket: string
    file: File
    path?: string // Optional custom path (e.g. "folder/filename.ext")
    cacheControl?: string
    upsert?: boolean
}

export function useUploadFile() {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const uploadFile = async ({
        bucket,
        file,
        path,
        cacheControl = '3600', // Default 1 hour cache
        upsert = false
    }: UploadOptions) => {
        setUploading(true)
        setError(null)
        const supabase = createClient()

        try {
            // 1. Prepare file path
            // If path is provided, use it directly (caller handles naming/uniqueness)
            // If not, generate a unique name
            let filePath = path
            if (!filePath) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                filePath = fileName
            }

            // 2. Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: cacheControl,
                    upsert: upsert
                })

            if (uploadError) {
                throw uploadError
            }

            // 3. Get Public URL
            // Ensure the path matches what was uploaded
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data?.path || filePath)

            return { publicUrl, filePath: data?.path || filePath }

        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Error uploading file')
            return null
        } finally {
            setUploading(false)
        }
    }

    return { uploadFile, uploading, error }
}
