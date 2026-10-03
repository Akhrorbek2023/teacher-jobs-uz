import Link from "next/link";
import Header from "../components/Header";
import VacancyCard from "../components/VacancyCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getJobs() {
  try {
    const r = await fetch(`${API_URL}/api/vacancies?limit=6`, { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    return data.data || [];
  } catch {
    return [];
  }
}
export default async function Home() {
  const jobs=await getJobs();
  return <>
    <Header/>
    <main>
      <section className="bg-gradient-to-b from-blue-50 to-transparent">
        <div className="container-x py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-sm font-bold">O‘qituvchilar uchun maxsus platforma</span>
            <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight">Sizga mos o‘qituvchilik ishini toping.</h1>
            <p className="mt-5 text-lg text-gray-600 max-w-2xl">Davlat va xususiy ta’lim muassasalaridagi vakansiyalarni bir joyda qidiring. AI sizga mos variantlarni tushuntirib beradi.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/vacancies" className="rounded-2xl bg-blue-600 text-white px-6 py-3 font-bold">Vakansiyalarni qidirish</Link>
              <Link href="/login?mode=register" className="rounded-2xl bg-white border px-6 py-3 font-bold hover:bg-gray-50">Profil yaratish</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="container-x py-14">
        <div className="flex justify-between items-end mb-6"><div><p className="text-blue-600 font-bold">Yangi</p><h2 className="text-3xl font-black">So‘nggi vakansiyalar</h2></div><Link href="/vacancies" className="font-bold">Barchasi →</Link></div>
        {jobs.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{jobs.map(v=><VacancyCard key={v.id} v={v}/>)}</div> :
        <div className="card p-10 text-center text-gray-500">Vakansiyalar hali yuklanmagan. Supabase va backend sozlamalarini tekshiring.</div>}
      </section>
      <section className="container-x pb-20 grid md:grid-cols-3 gap-5">
        {[
          ["🎯","AI Matching","Profilingiz va vakansiya talablarini taqqoslab, moslik sabablarini ko‘rsatadi."],
          ["🛡️","Verified vakansiyalar","Ish beruvchi va manbani tekshirish uchun alohida status."],
          ["🔔","Telegram alert","Yangi mos vakansiyalarni Telegram orqali olish uchun tayyor integratsiya."]
        ].map(([i,t,d])=><div className="card p-6" key={t}><div className="text-3xl">{i}</div><h3 className="font-bold text-xl mt-4">{t}</h3><p className="text-gray-600 mt-2">{d}</p></div>)}
      </section>
    </main>
  </>
}
