"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { trackEvent } from "../../../lib/analytics";

export default function MetricsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  async function loadMetrics() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/metrics`);
      if (!res.ok) throw new Error("Metrikalarni yuklab bo‘lmadi");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  // Simulate a live test application to see metrics increment
  async function triggerTestApplication() {
    setActionMsg("Yuborilmoqda...");
    await trackEvent("vacancy_applied", {
      test: true,
      vacancy_title: "Ingliz tili o‘qituvchisi",
      timestamp: new Date().toISOString()
    });
    setTimeout(() => {
      loadMetrics();
      setActionMsg("✓ Real ariza qayd etildi va hisoblagich oshdi!");
      setTimeout(() => setActionMsg(""), 3000);
    }, 400);
  }

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 15000); // 15s auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-2.5 py-1 rounded-md">
                100% Real Ma'lumotlar
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-gray-500 font-medium">Baza va Bot bilan to‘g‘ridan-to‘g‘ri sinxron</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mt-2">
              📊 Teacher Jobs UZ — Jonli Analitika
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Haqiqiy bazadagi vakansiyalar, ro‘yxatdan o‘tgan ustozlar va ariza ko‘rsatkichlari
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerTestApplication}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-sm"
              title="Real vaqtda test arizasi qo'shish va hisoblagichni tekshirish"
            >
              + Sinov arizasi yuborish
            </button>
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
            >
              {loading ? "..." : "🔄 Yangilash"}
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm mb-6 font-semibold animate-fade-in">
            {actionMsg}
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}. Backend API ishlayotganiga ishonch hosil qiling.
          </div>
        )}

        {data?.summary && (
          <div className="space-y-8">
            {/* 1. North Star Card */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    ⭐ North Star Metric (Bosh Ko‘rsatkich)
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black">
                    {data.summary.north_star.title}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1 max-w-xl">
                    {data.summary.north_star.subtext}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 shrink-0 min-w-44">
                  <div className="text-5xl font-black text-white">
                    {data.summary.north_star.value}
                  </div>
                  <div className="text-emerald-300 font-bold text-xs mt-1">
                    {data.summary.north_star.trend}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Key Conversion Metrics (3 cards grid) */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Telegram Connection Rate */}
              <div className="card p-6 border-blue-100 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">✈️</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {data.summary.telegram_connection.connected} / {data.summary.telegram_connection.total} ulangan
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mt-3">
                    Telegram ulanish ko‘rsatkichi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.summary.telegram_connection.subtext}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-blue-600">
                      {data.summary.telegram_connection.rate}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {data.summary.telegram_connection.connected} ta foydalanuvchi
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: data.summary.telegram_connection.rate }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Profile Completion Rate */}
              <div className="card p-6 border-emerald-100 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">📋</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {data.summary.profile_completion.completed} / {data.summary.profile_completion.total} to‘liq
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mt-3">
                    Profil to‘ldirilganlik darajasi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.summary.profile_completion.subtext}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-emerald-600">
                      {data.summary.profile_completion.rate}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {data.summary.profile_completion.total > 0 ? "Baza ma'lumoti" : "Yangi profillar kutilmoqda"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: data.summary.profile_completion.rate }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* AI Matching Activity */}
              <div className="card p-6 border-purple-100 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🤖</span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg font-mono">
                      {data.summary.ai_matching.model}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mt-3">
                    AI Gemini tavsiyalar faolligi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.summary.ai_matching.subtext}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-purple-600">
                      {data.summary.ai_matching.total_runs} marta
                    </span>
                    <span className="text-xs text-purple-600 font-semibold">
                      Google GenAI API
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, data.summary.ai_matching.total_runs * 10)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Real Market Demand (Subject breakdown + Average Salary) */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>📚</span> Real e'lonlar bo‘yicha fanlar
                  </h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                    Jami: {data.summary.market_liquidity.active_vacancies} ta vakansiya
                  </span>
                </div>
                <div className="space-y-3">
                  {data.summary.market_liquidity.top_subjects.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400 w-5">#{idx + 1}</span>
                        <span className="font-bold text-gray-800 text-sm">{item.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {item.count} ta vakansiya
                        </span>
                        <span className="text-xs text-emerald-600 font-bold">
                          {item.demand}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-500">O‘rtacha taklif etilayotgan maosh:</span>
                  <span className="font-black text-gray-900 text-base">{data.summary.market_liquidity.avg_salary}</span>
                </div>
              </div>

              {/* Real-time Activity Log */}
              <div className="card p-6 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚡</span> Jonli hodisalar jurnali (Haqiqiy log)
                  </h3>
                  {data.recent_events && data.recent_events.length > 0 ? (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {data.recent_events.map((ev) => (
                        <div key={ev.id || ev.timestamp} className="text-xs p-2.5 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="font-mono font-bold text-gray-800">{ev.event}</span>
                            {ev.properties?.subject && (
                              <span className="text-gray-500">({ev.properties.subject})</span>
                            )}
                          </div>
                          <span className="text-gray-400 font-mono">
                            {new Date(ev.timestamp).toLocaleTimeString("uz-UZ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-400">
                      Hozircha yangi hodisa yo‘q. Saytda ariza yuborilganda yoki bot ulanganda bu yerda real vaqtda aks etadi.
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  Har 15 soniyada avtomatik yangilanadi
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
