import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-20">
      <div className="container-x py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="font-black text-xl tracking-tight">
            Teacher<span className="text-blue-600">Jobs</span> UZ
          </Link>
          <p className="mt-3 text-sm text-gray-500 max-w-sm leading-relaxed">
            O‘zbekistondagi o‘qituvchilar va ta’lim muassasalari uchun yagona professional vakansiyalar va AI moslik platformasi.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Platforma faol
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900 mb-3">Bo‘limlar</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/vacancies" className="hover:text-blue-600">Barcha vakansiyalar</Link></li>
            <li><Link href="/vacancies/new" className="hover:text-blue-600">Vakansiya joylash</Link></li>
            <li><Link href="/profile" className="hover:text-blue-600">O‘qituvchi profili</Link></li>
            <li><Link href="/login" className="hover:text-blue-600">Kirish / Ro‘yxatdan o‘tish</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900 mb-3">Integratsiyalar & Aloqa</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <span className="flex items-center gap-1.5">
                <span>🤖</span> <b>Telegram bot:</b> @teacher_jobs_uz_bot
              </span>
            </li>
            <li>
              <span className="flex items-center gap-1.5">
                <span>⚡</span> AI Moslik tahlili
              </span>
            </li>
            <li>
              <span className="text-xs text-gray-400">
                Savol va takliflar bo‘yicha qo‘llab-quvvatlash xizmati
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-gray-400">
        © 2026 Teacher Jobs UZ. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
