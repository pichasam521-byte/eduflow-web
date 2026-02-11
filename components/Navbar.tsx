'use client'

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    user: any;
    profile: any;
}

export default function Navbar({ user, profile }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
    }

    return (
        <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
                                EduFlow
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="text-slate-300 hover:text-white font-medium transition-colors">
                            หน้าแรก
                        </Link>
                        <Link href="/courses" className="text-slate-300 hover:text-white font-medium transition-colors">
                            คอร์สเรียนทั้งหมด
                        </Link>
                        {profile?.role === 'creator' && (
                            <Link href="/creator" className="text-slate-300 hover:text-white font-medium transition-colors">
                                Dashboard ผู้สอน
                            </Link>
                        )}
                        {(profile?.role === 'learner' || profile?.role === 'creator') && (
                            <Link href="/learner" className="text-slate-300 hover:text-white font-medium transition-colors">
                                คอร์สของฉัน
                            </Link>
                        )}
                    </div>

                    {/* User Auth Section */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="hidden md:flex flex-col items-end hover:opacity-80 transition-opacity group">
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <span className="block text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                {profile?.full_name || user.email}
                                            </span>
                                            <span className="block text-xs text-slate-400 capitalize">
                                                {profile?.role || 'User'}
                                            </span>
                                        </div>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:block text-sm font-medium text-red-400 hover:text-red-300 transition-colors border border-red-800 hover:bg-red-900/20 px-3 py-1.5 rounded-md"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    เข้าสู่ระบบ
                                </Link>
                                <Link href="/register" className="hidden sm:inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-indigo-500/30 transition-all hover:scale-105">
                                    สมัครสมาชิก
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
                            หน้าแรก
                        </Link>
                        <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
                            คอร์สเรียนทั้งหมด
                        </Link>
                        {profile?.role === 'creator' && (
                            <Link href="/creator" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
                                Dashboard ผู้สอน
                            </Link>
                        )}
                        {(profile?.role === 'learner' || profile?.role === 'creator') && (
                            <Link href="/learner" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
                                คอร์สของฉัน
                            </Link>
                        )}
                        {user && (
                            <>
                                <div className="border-t border-gray-700 my-2"></div>
                                <div className="px-3 py-2 flex items-center gap-3">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold border border-indigo-800">
                                            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-sm font-medium text-white">
                                        {profile?.full_name || user.email}
                                        <span className="block text-xs text-slate-400 capitalize">{profile?.role}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                    ออกจากระบบ
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
