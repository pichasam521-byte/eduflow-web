'use client'

import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';
import { signup } from '@/app/actions/auth';
import { useState } from 'react';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await signup(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch (e) {
            setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="สมัครสมาชิกใหม่"
            subtitle={
                <>
                    มีบัญชีอยู่แล้ว? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 underline">เข้าสู่ระบบ</Link>
                </>
            }
        >
            <form className="space-y-6" action={handleSubmit}>
                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        รหัสผู้ใช้งาน (User ID) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            pattern="^[a-zA-Z0-9_]+$"
                            title="กรุณากรอกรหัสผู้ใช้งานเป็นตัวเลขหรือภาษาอังกฤษ"
                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                            placeholder="เช่น 66123456"
                        />
                        <p className="mt-1 text-xs text-gray-500">ใช้สำหรับเข้าสู่ระบบ (รหัสนักเรียน/นักศึกษา หรือรหัสพนักงาน)</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                            placeholder="สมชาย ใจดี"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        รหัสผ่าน <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        ประเภทผู้ใช้งาน
                    </label>
                    <div className="mt-2">
                        <select
                            id="role"
                            name="role"
                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                        >
                            <option value="learner">ผู้เรียน (Learner)</option>
                            <option value="creator">ผู้สอน / ผู้สร้างเนื้อหา (Creator)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
