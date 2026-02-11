'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useUploadFile } from '@/hooks/useUploadFile'
import { createClient } from '@/lib/supabase/client'

export default function NewLessonPage() {
    const params = useParams()
    const id = params?.id as string // Get ID from URL params

    const router = useRouter()
    const { uploadFile, uploading, error: uploadError } = useUploadFile()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [contentType, setContentType] = useState('video') // video, pdf, assignment
    const [file, setFile] = useState<File | null>(null)
    const [isPreview, setIsPreview] = useState(false)

    // Video State
    const [videoSource, setVideoSource] = useState<'upload' | 'youtube'>('upload')
    const [youtubeUrl, setYoutubeUrl] = useState('')

    // ... (rest of states are fine)

    // Check if ID exists (just in case)
    if (!id) return <div>Loading...</div>

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!title) {
            setError('กรุณากรอกชื่อบทเรียน')
            setLoading(false)
            return
        }

        try {
            let fileUrl = ''
            let filePath = ''

            // 1. Handle File Upload OR YouTube
            if (contentType === 'video' && videoSource === 'youtube') {
                // YouTube Logic
                if (!youtubeUrl) {
                    throw new Error('กรุณาระบุลิงก์ YouTube')
                }
                // Basic Validation
                if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
                    throw new Error('ลิงก์ YouTube ไม่ถูกต้อง')
                }
                fileUrl = youtubeUrl
            } else if (file) {
                // File Upload Logic
                const folder = contentType === 'video' ? 'videos' : 'docs'
                const result = await uploadFile({
                    bucket: 'lesson-files',
                    file: file,
                    path: `${id}/${folder}`,
                    cacheControl: '31536000'
                })

                if (!result) throw new Error('Upload failed')
                fileUrl = result.publicUrl
                filePath = result.filePath
            } else if (contentType !== 'article') {
                // If not article and not youtube and no file -> Error
                throw new Error('กรุณาอัปโหลดไฟล์หรือระบุลิงก์')
            }

            // 2. Save Lesson to Database
            const supabase = createClient()
            const { error: insertError } = await supabase
                .from('course_lessons')
                .insert({
                    course_id: id,
                    title,
                    description,
                    content_type: contentType,
                    file_url: fileUrl,
                    upload_file_path: filePath,
                    is_preview: isPreview,
                })

            if (insertError) throw insertError

            // Success
            router.push(`/creator/courses/${id}`)
            router.refresh()

        } catch (err: any) {
            console.error('Submit Error:', err)
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header ... */}
                <div className="mb-8">
                    <Link href={`/creator/courses/${id}`} className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
                        &larr; ยกเลิกและกลับไปหน้าคอร์ส
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">เพิ่มบทเรียนใหม่</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">สร้างเนื้อหาการสอนสำหรับคอร์สของคุณ</p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Alert */}
                        {(error || uploadError) && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error || uploadError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">หัวข้อบทเรียน <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border"
                                placeholder="เช่น Ep.1 แนะนำการเขียนโปรแกรม"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">คำอธิบายรายละเอียด</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border"
                                placeholder="รายละเอียดเกี่ยวกับบทเรียนนี้..."
                            />
                        </div>

                        {/* Content Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">ประเภทสื่อ</label>
                                <select
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border"
                                >
                                    <option value="video">วิดีโอ (Video)</option>
                                    <option value="pdf">เอกสาร (PDF)</option>
                                    <option value="audio">เสียง (Audio)</option>
                                    <option value="article">บทความ (Article)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">การเข้าถึง</label>
                                <div className="mt-2 flex items-center">
                                    <input
                                        id="is_preview"
                                        type="checkbox"
                                        checked={isPreview}
                                        onChange={(e) => setIsPreview(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_preview" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                        เปิดให้ทดลองเรียนฟรี (Preview)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Video Source Selection */}
                        {contentType === 'video' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">รูปแบบวิดีโอ</label>
                                <div className="flex gap-4">
                                    <label className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${videoSource === 'upload' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
                                        <input
                                            type="radio"
                                            name="videoSource"
                                            value="upload"
                                            checked={videoSource === 'upload'}
                                            onChange={() => setVideoSource('upload')}
                                            className="sr-only"
                                        />
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        อัปโหลดไฟล์
                                    </label>
                                    <label className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${videoSource === 'youtube' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
                                        <input
                                            type="radio"
                                            name="videoSource"
                                            value="youtube"
                                            checked={videoSource === 'youtube'}
                                            onChange={() => setVideoSource('youtube')}
                                            className="sr-only"
                                        />
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                        YouTube
                                    </label>
                                </div>

                                {videoSource === 'youtube' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            ลิงก์ YouTube Video
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="url"
                                                value={youtubeUrl}
                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                            <p className="mt-1 text-xs text-gray-500">รองรับลิงก์จาก YouTube เท่านั้น</p>
                                        </div>
                                    </div>
                                ) : (
                                    /* File Upload UI (Repurposed) */
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            อัปโหลดไฟล์ (MP4, WebM)
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                                            <div className="space-y-1 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1">
                                                        <span>เลือกไฟล์</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            accept="video/*"
                                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                        />
                                                    </label>
                                                    <p className="pl-1">หรือลากไฟล์มาวางที่นี่</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {file ? `เลือกไฟล์แล้ว: ${file.name}` : 'MP4, WebM up to 500MB'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Other Content Types (PDF, etc.) - Simplified Logic */}
                        {contentType !== 'video' && contentType !== 'article' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    อัปโหลดไฟล์ ({contentType === 'pdf' ? 'PDF Only' : 'เอกสารประกอบ'})
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true" >
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                            <label htmlFor="file-upload-doc" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1">
                                                <span>เลือกไฟล์</span>
                                                <input
                                                    id="file-upload-doc"
                                                    name="file-upload-doc"
                                                    type="file"
                                                    className="sr-only"
                                                    accept={contentType === 'pdf' ? '.pdf' : contentType === 'audio' ? 'audio/*' : '*/*'}
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {file ? `เลือกไฟล์แล้ว: ${file.name}` : contentType === 'pdf' ? 'PDF up to 10MB' : 'File Upload'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Article Type */}
                        {contentType === 'article' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">เนื้อหาบทความ (ใช้ช่องรายละเอียด)</label>
                                <p className="text-xs text-gray-500">กรุณากรอกเนื้อหาลงในช่อง "คำอธิบายรายละเอียด" ด้านบน</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading || uploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังบันทึกข้อมูล...
                                    </>
                                ) : 'บันทึกบทเรียน'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
