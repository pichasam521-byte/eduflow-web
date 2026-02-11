import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: ReactNode;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">E</div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
}
