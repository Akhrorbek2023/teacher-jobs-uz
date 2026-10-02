"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { createClient } from "../../lib/supabase";

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

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [subjectsInput, setSubjectsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [certificatesInput, setCertificatesInput] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // AI Matching state
  const [aiMatches, setAiMatches] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const s = createClient();
        const res = await s.auth.getUser();
        const user = res?.data?.user;
        if (!user) {
          location.href = "/login";
          return;
        }

        const { data, error } = await s
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const userProfile = data || {
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          subjects: [],
          languages: [],
          certificates: [],
          experience_years: 0,
          min_salary: null,
          city: "",
          district: "",
          bio: ""
        };

        setProfile(userProfile);
        setSubjectsInput((userProfile.subjects || []).join(", "));
        setLanguagesInput((userProfile.languages || []).join(", "));
        setCertificatesInput((userProfile.certificates || []).join(", "));
      } catch (err) {
        console.error("Profile load error:", err);
        setMsg("Profilni yuklashda xatolik yuz berdi");
      }
    }

    loadProfile();
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const s = createClient();

      const subjects = subjectsInput
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

      const languages = languagesInput
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

      const certificates = certificatesInput
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

      const exp = Math.max(0, parseInt(profile.experience_years, 10) || 0);
      const sal = profile.min_salary ? Math.max(0, Number(profile.min_salary)) : null;

      const updated = {
        ...profile,
        subjects,
        languages,
        certificates,
        experience_years: exp,
        min_salary: sal,
        updated_at: new Date().toISOString()
      };

      const { error } = await s.from("profiles").upsert(updated);
      if (error) throw error;

      setProfile(updated);
      setMsg("✓ Profil muvaffaqiyatli saqlandi.");
    } catch (err) {
      setMsg("Xatolik: " + (err.message || "Saqlash imkoni bo‘lmadi"));
    } finally {
      setSaving(false);
    }
  }

  async function findMatches() {
    if (!profile) return;
    setAiLoading(true);
    setAiError("");
    setAiMatches(null);

    try {
      // 1. Fetch current published vacancies
      const vacRes = await fetch(`${API_URL}/api/vacancies?limit=30`);
      if (!vacRes.ok) throw new Error("Vakansiyalarni olishda xatolik");
      const vacJson = await vacRes.json();
      const vacancies = vacJson.data || [];

      if (vacancies.length === 0) {
        setAiError("Hozircha tizimda faol vakansiyalar mavjud emas.");
        return;
      }

      const subjects = subjectsInput.split(",").map(x => x.trim()).filter(Boolean);

      // 2. Send to AI match endpoint
      const aiRes = await fetch(`${API_URL}/api/ai/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: {
            full_name: profile.full_name || "",
            subjects: subjects.length ? subjects : profile.subjects || [],
            experience_years: Number(profile.experience_years) || 0,
            city: profile.city || "",
            district: profile.district || "",
            min_salary: profile.min_salary ? Number(profile.min_salary) : null,
            languages: languagesInput.split(",").map(x => x.trim()).filter(Boolean),
            certificates: certificatesInput.split(",").map(x => x.trim()).filter(Boolean),
            bio: profile.bio || ""
          },
          vacancies: vacancies.map(v => ({
            id: v.id,
            title: v.title,
            subject: v.subject || null,
            description: v.description,
            requirements: v.requirements || null,
            city: v.city || null,
            district: v.district || null,
            salary_min: v.salary_min ? Number(v.salary_min) : null,
            salary_max: v.salary_max ? Number(v.salary_max) : null
          }))
        })
      });

      if (!aiRes.ok) {
        const errJson = await aiRes.json().catch(() => ({}));
        throw new Error(errJson.error || "AI tahlilida xatolik yuz berdi");
      }

      const matchData = await aiRes.json();
      const vacMap = new Map(vacancies.map(v => [v.id, v]));

      // Merge match score with vacancy details
      const enrichedMatches = (matchData.matches || []).map(m => ({
        ...m,
        vacancy: vacMap.get(m.vacancy_id)
      })).filter(m => m.vacancy);

      setAiMatches(enrichedMatches);
      setAiSummary(matchData.summary || "");
    } catch (err) {
      setAiError(err.message || "Tahlil jarayonida xatolik");
    } finally {
      setAiLoading(false);
    }
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="container-x py-16 text-center text-gray-500">
          Yuklanmoqda...
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container-x py-12 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">O‘qituvchi profili</h1>
            <p className="text-gray-500 text-sm mt-1">
              Profilingiz qanchalik to‘liq bo‘lsa, AI sizga shunchalik mos vakansiyalarni tavsiya qiladi.
            </p>
          </div>
          <button
            type="button"
            onClick={findMatches}
            disabled={aiLoading}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>✨</span>
            {aiLoading ? "AI tahlil qilmoqda..." : "AI orqali mos ish topish"}
          </button>
        </div>

        {/* AI Recommendations Section */}
        {aiLoading && (
          <div className="card p-8 mt-6 text-center text-blue-600 font-semibold bg-blue-50 border-blue-200">
            🤖 AI profilingiz va barcha faol vakansiyalarni tahlil qilmoqda...
          </div>
        )}

        {aiError && (
          <div className="card p-4 mt-6 text-sm text-red-600 bg-red-50 border-red-200">
            {aiError}
          </div>
        )}

        {aiMatches && (
          <section className="card p-6 mt-6 border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                  <span>🎯</span> AI tavsiya etgan vakansiyalar
                </h2>
                {aiSummary && <p className="text-xs text-indigo-700 mt-1">{aiSummary}</p>}
              </div>
              <button
                onClick={() => setAiMatches(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                Yopish ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {aiMatches.slice(0, 5).map(m => (
                <div key={m.vacancy_id} className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800">
                        {m.score}% mos
                      </span>
                      <h3 className="font-bold text-base text-gray-900">
                        <Link href={`/vacancies/${m.vacancy.id}`} className="hover:text-blue-600">
                          {m.vacancy.title}
                        </Link>
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.vacancy.subject || "Fan ko‘rsatilmagan"} · 📍 {m.vacancy.city || "O‘zbekiston"} · 💰 {m.vacancy.salary_text || "Kelishiladi"}
                    </p>
                    {m.reasons?.length > 0 && (
                      <p className="text-xs text-emerald-700 mt-2 font-medium">
                        ✓ {m.reasons.join(" · ")}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/vacancies/${m.vacancy.id}`}
                    className="shrink-0 text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                  >
                    Batafsil →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={save} className="card p-8 mt-7 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-bold text-gray-700">Ism-familiya</label>
              <input
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={profile.full_name ?? ""}
                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Aziz Karimov"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">Shahar / Viloyat</label>
              <select
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500 bg-white"
                value={profile.city ?? ""}
                onChange={e => setProfile({ ...profile, city: e.target.value })}
              >
                <option value="">Hududni tanlang...</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">Tuman</label>
              <input
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={profile.district ?? ""}
                onChange={e => setProfile({ ...profile, district: e.target.value })}
                placeholder="Yunusobod tumani"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">Pedagogik tajriba (yil)</label>
              <input
                type="number"
                min={0}
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={profile.experience_years ?? 0}
                onChange={e => {
                  const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                  setProfile({ ...profile, experience_years: isNaN(val) ? 0 : val });
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Kutilayotgan minimal maosh (so‘m)</label>
              <input
                type="number"
                min={0}
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={profile.min_salary ?? ""}
                placeholder="5000000"
                onChange={e => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setProfile({ ...profile, min_salary: isNaN(val) ? null : val });
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">
              Dars beradigan fanlaringiz (vergul bilan ajrating)
            </label>
            <input
              className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
              value={subjectsInput}
              onChange={e => setSubjectsInput(e.target.value)}
              placeholder="Matematika, Fizika, Geometriya"
            />
            <p className="text-xs text-gray-400 mt-1">Misol: Matematika, Fizika, Informatika</p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">
              Sertifikatlar va toifa (vergul bilan ajrating)
            </label>
            <input
              className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
              value={certificatesInput}
              onChange={e => setCertificatesInput(e.target.value)}
              placeholder="1-toifa, IELTS 7.5, Milliy sertifikat A+"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">
              Qisqacha o‘zingiz haqingizda (Bio)
            </label>
            <textarea
              className="border rounded-xl w-full px-4 py-3 mt-1.5 min-h-28 focus:outline-blue-500"
              value={profile.bio ?? ""}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Ta'lim metodikangiz, yutuqlaringiz va maqsadlaringiz..."
            />
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 font-bold disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            {msg && (
              <span className={`text-sm font-semibold ${msg.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>
                {msg}
              </span>
            )}
          </div>
        </form>
      </main>
    </>
  );
}
