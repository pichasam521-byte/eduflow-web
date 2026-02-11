import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  // Fetch Featured Courses (Real Data)
  const { data: realCourses } = await supabase
    .from('contents')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      content_type,
      users (
        full_name
      )
    `)
    .eq('status', 'published')
    .in('content_type', ['course', 'video']) // Show courses and videos
    .order('created_at', { ascending: false })
    .limit(3);

  // Fallback to mock data if no courses exist (to keep the site beautiful)
  const courses = (realCourses && realCourses.length > 0) ? realCourses : [
    { id: 'mock-1', title: 'Fullstack Development', description: 'เรียนรู้ทักษะที่จำเป็นสำหรับการทำงานในยุคดิจิทัล พร้อมกรณีศึกษาและ Workshop ที่ใช้งานได้จริง', thumbnail_url: null, content_type: 'Tech', users: { full_name: 'Instructor Name' }, isMock: true },
    { id: 'mock-2', title: 'Digital Marketing Strategy', description: 'เจาะลึกกลยุทธ์การตลาดออนไลน์ให้ธุรกิจของคุณเติบโตอย่างก้าวกระโดด', thumbnail_url: null, content_type: 'Business', users: { full_name: 'Instructor Name' }, isMock: true },
    { id: 'mock-3', title: 'UI/UX Design Fundamentals', description: 'พื้นฐานการออกแบบที่ควรรู้ สร้างประสบการณ์ที่ดีให้กับผู้ใช้งาน', thumbnail_url: null, content_type: 'Design', users: { full_name: 'Instructor Name' }, isMock: true }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">

      {/* Hero Section - Clean White */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Soft Blue Gradient Blur */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mx-auto max-w-4xl fade-in">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-indigo-800 bg-indigo-50 border border-indigo-100 mb-8 shadow-sm hover:bg-indigo-100 transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
              แพลตฟอร์มการเรียนรู้สำหรับมืออาชีพ
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl mb-6 leading-tight">
              ยกระดับทักษะของคุณ <br className="hidden md:block" />
              <span className="text-indigo-800">
                สู่อนุคตที่เหนือกว่า
              </span>
            </h1>

            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              แหล่งรวมคอร์สเรียนคุณภาพที่ออกแบบมาเพื่อการใช้งานจริง (คอร์สจริงจากDatabase) <br className="hidden md:block" />
              เรียนรู้จากผู้เชี่ยวชาญ และเติบโตในสายงานของคุณอย่างมั่นคง
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 fade-in delay-200">
              <Link
                href="/courses"
                className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all bg-indigo-900 rounded-lg shadow-lg shadow-indigo-900/20 hover:bg-indigo-800 hover:shadow-indigo-900/30 hover:-translate-y-0.5"
              >
                เริ่มเรียนรู้เลย
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-slate-700 transition-all bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-indigo-900 hover:border-indigo-200"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section - White */}
      <section className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-100 pb-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
                คอร์สเรียนแนะนำ
              </h2>
              <p className="text-lg text-slate-500">
                เนื้อหาเข้มข้น ตอบโจทย์การทำงานจริง (คัดสรรโดยอาจารย์จากระบบ)
              </p>
            </div>
            <Link href="/courses" className="hidden md:flex items-center px-5 py-2.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition-all group">
              ดูทั้งหมด <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((item: any, index: number) => (
              <Link href={item.isMock ? '#' : `/courses/${item.id}`} key={item.id} className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 hover:-translate-y-1 block">

                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  {/* Thumbnail / Gradient Fallback */}
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${index % 3 === 0 ? 'from-slate-100 to-slate-200' : index % 3 === 1 ? 'from-indigo-50 to-blue-100' : 'from-gray-100 to-slate-200'}`} />

                      {/* Icon as Fallback */}
                      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                        {index % 3 === 0 ? '💻' : index % 3 === 1 ? '📊' : '🎨'}
                      </div>
                    </>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-700 backdrop-blur border border-slate-200 shadow-sm">
                      {item.content_type || 'General'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-800 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed min-h-[40px]">
                    {item.description ? (item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description) : 'ไม่มีรายละเอียด'}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold ring-2 ring-white">
                        {(item.users?.full_name || 'T')[0]}
                      </div>
                      <span className="text-sm font-medium text-slate-600 truncate max-w-[100px]" title={item.users?.full_name}>
                        {item.users?.full_name || 'ผู้สอน'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-indigo-900">
                      {/* Mock Price for MVP */}
                      Free
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/courses" className="inline-block px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 w-full transition-colors">
              ดูคอร์สทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid - Clean Light Gray */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-800 font-semibold tracking-wide uppercase mb-3 text-sm">Why EduFlow</h2>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">เรียนรู้อย่างมีประสิทธิภาพ</h3>
            <p className="text-slate-600 text-lg">
              แพลตฟอร์มที่ออกแบบมาเพื่อสนับสนุนการเรียนรู้ตลอดชีวิตของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Certification', desc: 'ได้รับใบรับรองเมื่อเรียนจบ เพื่อยืนยันความสามารถของคุณ', icon: 'cert-icon' },
              { title: 'Expert Instructors', desc: 'เรียนรู้จากผู้เชี่ยวชาญที่มีประสบการณ์จริงในอุตสาหกรรม', icon: 'expert-icon' },
              { title: 'Flexible Learning', desc: 'จัดสรรเวลาเรียนได้ตามที่คุณสะดวก รองรับทุกอุปกรณ์', icon: 'flex-icon' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-2xl mb-6 text-indigo-700">
                  {idx === 0 ? '🎓' : idx === 1 ? '👨‍🏫' : '📱'}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Navy Accent */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="bg-indigo-900 rounded-2xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
              พร้อมที่จะเริ่มต้นหรือยัง?
            </h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              สมัครสมาชิกวันนี้เพื่อเริ่มต้นเส้นทางการเรียนรู้ของคุณ
            </p>

            <div className="flex justify-center relative z-10">
              <Link href="/register" className="px-8 py-3 bg-white text-indigo-900 font-bold text-lg rounded-lg shadow hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
                สมัครสมาชิกฟรี
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
