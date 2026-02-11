import type { Metadata } from "next";
import { Inter, Sarabun } from "next/font/google";
import "./globals.css";
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "EduFlow - ศูนย์รวมการเรียนรู้ดิจิทัล",
  description: "แพลตฟอร์มการเรียนรู้และแบ่งปันความรู้ที่ทันสมัย",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="th">
      <body
        className={`${inter.variable} ${sarabun.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Navbar user={user} profile={profile} />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} EduFlow. All rights reserved. ศูนย์รวมการเรียนรู้ไร้ขีดจำกัด
          </div>
        </footer>
      </body>
    </html>
  );
}
