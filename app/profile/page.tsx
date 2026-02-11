'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useUploadFile } from '@/hooks/useUploadFile'
import { updateProfile, changePassword, deleteAccount } from '@/app/actions/profile'
import Link from 'next/link'

type Tab = 'general' | 'security' | 'danger'

export default function ProfilePage() {
    const router = useRouter()
    const { uploadFile, uploading } = useUploadFile()

    // UI State
    const [activeTab, setActiveTab] = useState<Tab>('general')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // User Data State
    const [userId, setUserId] = useState<string | null>(null)
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    // Password State
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // File Upload State
    const [file, setFile] = useState<File | null>(null)

    // Fetch Profile
    useEffect(() => {
        async function fetchProfile() {
            setLoading(true)
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)
            setEmail(user.email || '')

            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setFullName(data.full_name || '')
                setUsername(data.username || '')
                setAvatarUrl(data.avatar_url)
            }
            setLoading(false)
        }
        fetchProfile()
    }, [router])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string)
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const clearMessages = () => {
        setError(null)
        setSuccessMessage(null)
    }

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        clearMessages()

        try {
            let finalAvatarUrl = avatarUrl

            if (file) {
                const fileExt = file.name.split('.').pop()
                const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

                const result = await uploadFile({
                    bucket: 'avatars',
                    file: file,
                    path: filePath,
                    upsert: true
                })
                if (result) finalAvatarUrl = result.publicUrl
            }

            const formData = new FormData()
            formData.append('fullName', fullName)
            if (finalAvatarUrl) formData.append('avatarUrl', finalAvatarUrl)

            const res = await updateProfile(formData)
            if (res?.error) setError(res.error)
            else {
                setSuccessMessage('บันทึกข้อมูลเรียบร้อยแล้ว')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด')
        } finally {
            setSaving(false)
        }
    }

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        clearMessages()

        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านยืนยันไม่ตรงกัน')
            setSaving(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append('password', newPassword)
            formData.append('confirmPassword', confirmPassword)

            const res = await changePassword(formData)
            if (res?.error) setError(res.error)
            else {
                setSuccessMessage('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบัญชี? การกระทำนี้ไม่สามารถย้อนกลับได้')) return
        setSaving(true)
        const res = await deleteAccount()
        if (res?.error) {
            setError(res.error)
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ตั้งค่าบัญชี</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">จัดการข้อมูลส่วนตัวและความปลอดภัย</p>
                    </div>
                    <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        &larr; กลับหน้าหลัก
                    </Link>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">

                    {/* Sidebar Menu */}
                    <aside className="py-6 px-2 sm:px-6 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit mb-6 lg:mb-0">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`${activeTab === 'general' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900'} group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                            >
                                <svg className={`${activeTab === 'general' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="truncate">ข้อมูลทั่วไป</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`${activeTab === 'security' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900'} group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                            >
                                <svg className={`${activeTab === 'security' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="truncate">ความปลอดภัย</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('danger')}
                                className={`${activeTab === 'danger' ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900'} group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                            >
                                <svg className={`${activeTab === 'danger' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="truncate">โซนอันตราย</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">

                        {/* Messages */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        )}

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <form onSubmit={handleSubmitProfile} className="bg-white dark:bg-gray-800 shadow sm:rounded-md overflow-hidden">
                                <div className="px-4 py-5 sm:p-6 space-y-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">ข้อมูลส่วนตัว</h3>

                                    {/* Avatar */}
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative group flex-shrink-0">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-200">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold bg-gray-100">
                                                        {fullName?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 text-white text-xs font-medium cursor-pointer rounded-full transition-opacity">
                                                เปลี่ยนรูป
                                            </label>
                                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <label htmlFor="avatar-upload" className="block text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                                                เปลี่ยนรูปโปรไฟล์
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG ขนาดไม่เกิน 5MB</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="col-span-6 sm:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อผู้ใช้งาน</label>
                                            <input type="text" disabled value={username} className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                        <div className="col-span-6 sm:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">อีเมล</label>
                                            <input type="text" disabled value={email} className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ-นามสกุล</label>
                                            <input type="text" id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-right sm:px-6">
                                    <button type="submit" disabled={saving || uploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <form onSubmit={handleSubmitPassword} className="bg-white dark:bg-gray-800 shadow sm:rounded-md overflow-hidden">
                                <div className="px-4 py-5 sm:p-6 space-y-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">เปลี่ยนรหัสผ่าน</h3>
                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">รหัสผ่านใหม่</label>
                                            <input type="password" id="newPassword" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ยืนยันรหัสผ่านใหม่</label>
                                            <input type="password" id="confirmPassword" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-right sm:px-6">
                                    <button type="submit" disabled={saving || !newPassword} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                        {saving ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Danger Tab */}
                        {activeTab === 'danger' && (
                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md overflow-hidden border border-red-100 dark:border-red-900/30">
                                <div className="px-4 py-5 sm:p-6 space-y-6">
                                    <h3 className="text-lg leading-6 font-medium text-red-600 dark:text-red-400">โซนอันตราย</h3>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-md border border-red-100 dark:border-red-900/20">
                                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300">ลบบัญชีผู้ใช้</h4>
                                        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                                            การกระทำนี้จะลบข้อมูลส่วนตัว คอร์สเรียน และประวัติการเรียนทั้งหมดของคุณอย่างถาวร ไม่สามารถกู้คืนได้
                                        </p>
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={handleDeleteAccount}
                                                disabled={saving}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                            >
                                                {saving ? 'กำลังลบ...' : 'ฉันต้องการลบบัญชี'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
