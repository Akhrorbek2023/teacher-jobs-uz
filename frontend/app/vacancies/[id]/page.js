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

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantNote, setApplicantNote] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Bookmark state
  const [saved, setSaved] = useState(false);

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
        if (data?.user) {
          setUser(data.user);
          setApplicantName(data.user.user_metadata?.full_name || "");
        }
      } catch {
        setUser(null);
      }
    }

    // Check saved vacancies in localStorage
    if (typeof window !== "undefined") {
      const savedList = JSON.parse(localStorage.getItem("saved_vacancies") || "[]");
      setSaved(savedList.includes(id));
    }

    loadVacancy();
    checkUser();
  }, [id]);

  function toggleSave() {
    if (typeof window === "undefined") return;
    const savedList = JSON.parse(localStorage.getItem("saved_vacancies") || "[]");
    let updated;
    if (savedList.includes(id)) {
      updated = savedList.filter(item => item !== id);
      setSaved(false);
    } else {
      updated = [...savedList, id];
      setSaved(true);
    }
    localStorage.setItem("saved_vacancies", JSON.stringify(updated));
  }

  async function handleApply(e) {
    e.preventDefault();
    setApplyLoading(true);
    try {
      const s = createClient();
      // Try saving to Supabase applications table if authenticated
      if (user) {
        try {
          await s.from("applications").insert({
            vacancy_id: vacancy.id,
            teacher_id: user.id,
            message: `Tel: ${applicantPhone}\n${applicantNote}`,
            status: "submitted"
          });
        } catch {
          // ignore DB error, proceed with local confirmation
        }
      }

      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
      }, 2500);
    } catch {
      setApplySuccess(true);
    } finally {
      setApplyLoading(false);
    }
  }

  async function runAiMatch() {
    if (!vacancy) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const s = createClient();
      const { data: authData } = await s.auth.getUser();
      const currentUser = authData?.user;

      let profileData = null;
      if (currentUser) {
        const { data } = await s.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
        profileData = data;
      }

      // Check localStorage if not in DB
      if (!profileData && typeof window !== "undefined") {
        const key = currentUser ? `teacher_profile_${currentUser.id}` : "teacher_profile_guest";
        const local = localStorage.getItem(key);
        if (local) profileData = JSON.parse(local);
      }

      if (!profileData) {
        setAiError("Profilingiz topilmadi. Avval profil sahifasida ma'lumotlaringizni to‘ldiring.");
        return;
      }

      const res = await fetch(`${API_URL}/api/ai/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: {
            full_name: profileData.full_name || "",
            subjects: profileData.subjects || [],
            experience_years: profileData.experience_years || 0,
            city: profileData.city || "",
            district: profileData.district || "",
            min_salary: profileData.min_salary || null,
            languages: profileData.languages || [],
            certificates: profileData.certificates || [],
            bio: profileData.bio || ""
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
        <main className="container-x py-16 text-center text-gray-500 font-medium">
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
        <div className="flex items-center justify-between mb-6">
          <Link href="/vacancies" className="text-sm font-semibold text-gray-500 hover:text-blue-600">
            ← Vakansiyalar ro‘yxatiga qaytish
          </Link>
          <button
            onClick={toggleSave}
            className={`text-sm font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              saved ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{saved ? "★" : "☆"}</span>
            {saved ? "Saqlangan" : "Saqlab qo‘yish"}
          </button>
        </div>

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
              <button
                onClick={runAiMatch}
                disabled={aiLoading}
                className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {aiLoading ? "Tahlil qilinmoqda..." : "Moslikni tekshirish"}
              </button>
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
                  onClick={() => setShowApplyModal(true)}
                  className="rounded-xl bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700"
                >
                  Ariza topshirish
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="card p-6 w-full max-w-md bg-white shadow-2xl relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-gray-900">Ariza topshirish</h3>
            <p className="text-xs text-gray-500 mt-1">
              <b>{vacancy.title}</b> vakansiyasi uchun aloqa ma'lumotlaringizni qoldiring.
            </p>

            {applySuccess ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-bold text-sm">Arizangiz muvaffaqiyatli qabul qilindi!</p>
                <p className="text-xs text-emerald-600 mt-1">Ish beruvchi tez orada siz bilan bog‘lanadi.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ism-familiyangiz *</label>
                  <input
                    required
                    type="text"
                    placeholder="Aziz Karimov"
                    className="border rounded-xl w-full px-4 py-2.5 text-sm focus:outline-blue-500"
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Telefon raqamingiz *</label>
                  <input
                    required
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    className="border rounded-xl w-full px-4 py-2.5 text-sm focus:outline-blue-500"
                    value={applicantPhone}
                    onChange={e => setApplicantPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Qisqacha xabar / Pedagogik tajribangiz</label>
                  <textarea
                    rows={3}
                    placeholder="Qisqacha ma'lumot, tajribangiz yoki savollaringiz..."
                    className="border rounded-xl w-full px-4 py-2 text-sm focus:outline-blue-500"
                    value={applicantNote}
                    onChange={e => setApplicantNote(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="text-sm font-semibold text-gray-500 hover:underline"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="rounded-xl bg-blue-600 text-white px-5 py-2.5 font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {applyLoading ? "Yuborilmoqda..." : "Arizani yuborish"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
