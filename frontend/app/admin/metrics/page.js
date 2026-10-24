"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function MetricsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // 30s auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-black uppercase px-2.5 py-1 rounded-md">
                Admin & Investor Dashboard
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-gray-500 font-medium">Real vaqt rejimi</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mt-2">
              📊 Teacher Jobs UZ — Asosiy Metrikalar
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Loyihaning o‘sish ko‘rsatkichlari, konversiya voronkasi va sun'iy intellekt faolligi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl transition"
            >
              {loading ? "Yangilanmoqda..." : "🔄 Yangilash"}
            </button>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
            >
              Bosh sahifa
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}. Backend ishlayotganiga ishonch hosil qiling.
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
                      {data.summary.telegram_connection.connected} / {data.summary.telegram_connection.total} ustoz
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mt-3">
                    Telegram ulanish konversiyasi
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
                    <span className="text-xs text-gray-400 font-medium">Maqsad: 70%+</span>
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
                    <span className="text-xs text-gray-400 font-medium">Maqsad: 75%+</span>
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
                    <span className="text-xs text-purple-600 font-bold">
                      O‘rtacha moslik: {data.summary.ai_matching.avg_match}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: data.summary.ai_matching.avg_match }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Market Demand & Vacancy Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📚</span> Eng talabgir fanlar (Bozor ehtiyoji)
                </h3>
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
              </div>

              {/* Real-time Activity Log */}
              <div className="card p-6 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚡</span> Jonli hodisalar oqimi (Live Telemetry)
                  </h3>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {data.recent_events.map((ev, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          <span className="font-mono font-bold text-gray-800">{ev.event}</span>
                        </div>
                        <span className="text-gray-400 font-mono">
                          {new Date(ev.timestamp).toLocaleTimeString("uz-UZ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-xs text-gray-400 text-center">
                  Har 30 soniyada avtomatik yangilanadi
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
