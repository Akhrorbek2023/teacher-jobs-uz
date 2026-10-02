"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import { createClient } from "../../../lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function VacancyDetail({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Matching state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadVacancy() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/vacancies/${id}`);
        if (!res.ok) throw new Error("Vakansiya topilmadi");
        const json = await res.json();
        setVacancy(json.data);
      } catch (err) {
        setError(err.message || "Vakansiyani yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    }

    async function checkUser() {
      try {
        const s = createClient();
        const { data } = await s.auth.getUser();
        setUser(data?.user ?? null);
      } catch {
        setUser(null);
      }
    }

    loadVacancy();
    checkUser();
  }, [id]);

  async function runAiMatch() {
    if (!vacancy) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) {
        setAiError("AI moslikni tekshirish uchun tizimga kiring.");
        return;
      }

      const { data: profile } = await s.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!profile) {
        setAiError("Profilingiz topilmadi. Avval profilingizni to‘ldiring.");
        return;
      }

      const res = await fetch(`${API_URL}/api/ai/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: {
            full_name: profile.full_name || "",
            subjects: profile.subjects || [],
            experience_years: profile.experience_years || 0,
            city: profile.city || "",
            district: profile.district || "",
            min_salary: profile.min_salary || null,
            languages: profile.languages || [],
            certificates: profile.certificates || [],
            bio: profile.bio || ""
          },
          vacancies: [
            {
              id: vacancy.id,
              title: vacancy.title,
              subject: vacancy.subject || null,
              description: vacancy.description,
              requirements: vacancy.requirements || null,
              city: vacancy.city || null,
              district: vacancy.district || null,
              salary_min: vacancy.salary_min ? Number(vacancy.salary_min) : null,
              salary_max: vacancy.salary_max ? Number(vacancy.salary_max) : null
            }
          ]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "AI tahlilida xatolik yuz berdi");
      }

      const data = await res.json();
      const match = data.matches?.[0] || null;
      setAiResult(match);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="container-x py-16 text-center text-gray-500">
          Yuklanmoqda...
        </main>
      </>
    );
  }

  if (error || !vacancy) {
    return (
      <>
        <Header />
        <main className="container-x py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{error || "Vakansiya topilmadi"}</h2>
          <Link href="/vacancies" className="mt-4 inline-block text-blue-600 font-bold hover:underline">
            ← Barcha vakansiyalarga qaytish
          </Link>
        </main>
      </>
    );
  }

  const company = vacancy.companies;

  return (
    <>
      <Header />
      <main className="container-x py-10 max-w-4xl">
        <Link href="/vacancies" className="text-sm font-semibold text-gray-500 hover:text-blue-600 mb-6 inline-block">
          ← Vakansiyalar ro‘yxatiga qaytish
        </Link>

        <div className="card p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{vacancy.title}</h1>
                {(vacancy.verified || company?.verified) && (
                  <span className="text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
                    ✓ Verified
                  </span>
                )}
              </div>
              {company && (
                <p className="text-blue-600 font-semibold text-base mt-1">
                  {company.name}
                  {company.city ? ` · ${company.city}` : ""}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                📍 {vacancy.city || "O‘zbekiston"}{vacancy.district ? `, ${vacancy.district}` : ""} · Fan: {vacancy.subject || "Ko‘rsatilmagan"}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block text-lg font-black text-blue-700 bg-blue-50 px-4 py-2 rounded-xl">
                {vacancy.salary_text || (vacancy.salary_min ? `${Number(vacancy.salary_min).toLocaleString()} so‘m+` : "Kelishiladi")}
              </span>
              <p className="text-xs text-gray-400 mt-1">
                {vacancy.employment_type === "part_time" ? "Yarim stavka" : "To‘liq stavka"}
              </p>
            </div>
          </div>

          {/* AI Matching Box */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>🤖</span> AI Moslik Tekshiruvi
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Profilingiz va ushbu vakansiya talablarini sun'iy intellekt orqali solishtiring
                </p>
              </div>
              {user ? (
                <button
                  onClick={runAiMatch}
                  disabled={aiLoading}
                  className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {aiLoading ? "Tahlil qilinmoqda..." : "Moslikni tekshirish"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-white border border-blue-200 text-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-50"
                >
                  Kirish va tekshirish
                </Link>
              )}
            </div>

            {aiError && (
              <p className="text-sm text-red-600 mt-3">{aiError}</p>
            )}

            {aiResult && (
              <div className="mt-5 pt-4 border-t border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-blue-700">
                    {aiResult.score}%
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${aiResult.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs">
                  {aiResult.reasons?.length > 0 && (
                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                      <p className="font-bold text-emerald-700 mb-1">Mos kelgan jihatlar:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-700">
                        {aiResult.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResult.gaps?.length > 0 && (
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                      <p className="font-bold text-amber-700 mb-1">E'tibor berish kerak:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-700">
                        {aiResult.gaps.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Vakansiya tavsifi</h2>
              <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                {vacancy.description}
              </p>
            </div>

            {vacancy.requirements && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nomzodga talablar</h2>
                <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                  {vacancy.requirements}
                </p>
              </div>
            )}

            {vacancy.responsibilities && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Asosiy vazifalar</h2>
                <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                  {vacancy.responsibilities}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-4">
            <div>
              {vacancy.published_at && (
                <p className="text-xs text-gray-400">
                  E'lon sanasi: {new Date(vacancy.published_at).toLocaleDateString("uz-UZ")}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {vacancy.source_url ? (
                <a
                  href={vacancy.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700"
                >
                  Asl manbaga o‘tish ↗
                </a>
              ) : company?.telegram ? (
                <a
                  href={`https://t.me/${company.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700"
                >
                  Telegram orqali bog‘lanish
                </a>
              ) : (
                <button
                  onClick={() => alert("Ushbu vakansiya uchun ariza qabul qilish tizimi orqali bog'lanishingiz mumkin.")}
                  className="rounded-xl bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700"
                >
                  Ariza topshirish
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
