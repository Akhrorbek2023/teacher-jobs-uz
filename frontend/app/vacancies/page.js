"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import VacancyCard from "../../components/VacancyCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const REGIONS = [
  "Toshkent",
  "Samarqand",
  "Farg‘ona",
  "Andijon",
  "Namangan",
  "Buxoro",
  "Xorazm",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Sirdaryo",
  "Navoiy",
  "Qoraqalpog‘iston"
];

const SUBJECTS = [
  "Matematika",
  "Fizika",
  "Kimyo",
  "Biologiya",
  "Informatika va IT",
  "Ingliz tili",
  "Rus tili",
  "Ona tili va adabiyot",
  "Tarix",
  "Geografiya",
  "Boshlang‘ich ta'lim"
];

export default function Vacancies() {
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [subject, setSubject] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q.trim()) p.set("q", q.trim());
      if (city) p.set("city", city);
      if (subject) p.set("subject", subject);
      if (minSalary) p.set("minSalary", minSalary);

      const r = await fetch(`${API_URL}/api/vacancies?${p.toString()}`);
      if (!r.ok) throw new Error("Vakansiyalarni olishda xatolik");
      const j = await r.json();
      setJobs(j.data || []);
    } catch (e) {
      console.error("Vakansiyalarni yuklashda xatolik:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, city, subject, minSalary]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setQ("");
    setCity("");
    setSubject("");
    setMinSalary("");
  }

  const hasActiveFilters = Boolean(q || city || subject || minSalary);

  return (
    <>
      <Header />
      <main className="container-x py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Vakansiyalar</h1>
            <p className="mt-1 text-gray-500 text-sm">
              O‘zbekistondagi eng so‘nggi pedagogik vakansiyalarni qidiring.
            </p>
          </div>
          <Link
            href="/vacancies/new"
            className="rounded-xl bg-blue-600 text-white px-5 py-2.5 font-bold text-sm hover:bg-blue-700 self-start sm:self-auto"
          >
            + Vakansiya joylash
          </Link>
        </div>

        {/* Filter controls */}
        <div className="card p-5 mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Qidiruv (kalit so‘z)..."
            className="border rounded-xl px-4 py-2.5 text-sm focus:outline-blue-500"
          />

          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm focus:outline-blue-500 bg-white"
          >
            <option value="">Barcha hududlar</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm focus:outline-blue-500 bg-white"
          >
            <option value="">Barcha fanlar</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={minSalary}
            onChange={e => setMinSalary(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm focus:outline-blue-500 bg-white"
          >
            <option value="">Ixtiyoriy maosh</option>
            <option value="3000000">3 000 000 so‘mdan</option>
            <option value="5000000">5 000 000 so‘mdan</option>
            <option value="8000000">8 000 000 so‘mdan</option>
            <option value="12000000">12 000 000 so‘mdan</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Faol filtrlar mavjud.</span>
            <button
              onClick={resetFilters}
              className="text-blue-600 font-bold hover:underline"
            >
              Filtrlarni tozalash ✕
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">
            Vakansiyalar yuklanmoqda...
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {jobs.map(v => (
              <VacancyCard key={v.id} v={v} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center mt-6">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-bold text-gray-800">Vakansiyalar topilmadi</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Kiritilgan qidiruv mezonlariga mos keladigan vakansiya mavjud emas. Filtrlarni o‘zgartirib ko‘ring.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}
