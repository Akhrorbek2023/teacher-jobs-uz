"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const s = createClient();
      const r = mode === "login"
        ? await s.auth.signInWithPassword({ email, password })
        : await s.auth.signUp({ email, password });

      if (r.error) {
        setMsg(r.error.message);
      } else {
        if (mode === "login") {
          setMsg("Kirish muvaffaqiyatli! Yo‘naltirilmoqda...");
          router.push("/profile");
        } else {
          setMsg("Hisob yaratildi! Emailingizga tasdiqlash xabari yuborildi (agar talab etilsa).");
          setTimeout(() => router.push("/profile"), 1500);
        }
      }
    } catch (err) {
      setMsg("Xatolik yuz berdi: " + (err.message || "Tizimga ulanib bo‘lmadi"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-blue-600 mb-6 inline-block">
          ← Bosh sahifaga qaytish
        </Link>

        <form onSubmit={submit} className="card p-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Teacher<span className="text-blue-600">Jobs</span> UZ
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {mode === "login" ? "O‘qituvchi hisobingizga kiring" : "Yangi o‘qituvchi hisobini oching"}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                className="border rounded-xl w-full px-4 py-3 focus:outline-blue-500 text-sm"
                placeholder="ustoz@maktab.uz"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Parol
              </label>
              <input
                className="border rounded-xl w-full px-4 py-3 focus:outline-blue-500 text-sm"
                placeholder="Kamida 6 ta belgi"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full py-3 mt-6 font-bold text-sm disabled:opacity-50 transition"
          >
            {loading ? "Kutilmoqda..." : mode === "login" ? "Kirish" : "Ro‘yxatdan o‘tish"}
          </button>

          {msg && (
            <p className={`text-xs mt-4 p-3 rounded-xl ${msg.includes("muvaffaqiyatli") || msg.includes("yaratildi") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {msg}
            </p>
          )}

          <div className="mt-6 pt-4 border-t text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMsg("");
              }}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              {mode === "login" ? "Hisobingiz yo‘qmi? Ro‘yxatdan o‘ting" : "Hisobingiz bormi? Kirishga qaytish"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
