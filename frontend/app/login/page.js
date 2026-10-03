"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(initialMode);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const s = createClient();
      const origin = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

      const emailRedirectTo = `${origin}/auth/callback`;

      if (mode === "login") {
        const r = await s.auth.signInWithPassword({ email, password });
        if (r.error) {
          setMsg(r.error.message);
        } else {
          setMsg("Kirish muvaffaqiyatli! Yo‘naltirilmoqda...");
          router.push("/profile");
        }
      } else {
        const r = await s.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || undefined
            },
            emailRedirectTo
          }
        });

        if (r.error) {
          setMsg(r.error.message);
        } else if (r.data?.session) {
          // If email confirmation is disabled, user is immediately logged in
          setMsg("Ro‘yxatdan o‘tish muvaffaqiyatli! Profilingizga yo‘naltirilmoqda...");
          router.push("/profile");
        } else {
          setMsg("Hisob yaratildi! Emailingizga tasdiqlash havolasi yuborildi. Iltimos, pochtangizni tekshiring.");
        }
      }
    } catch (err) {
      setMsg("Xatolik yuz berdi: " + (err.message || "Tizimga ulanib bo‘lmadi"));
    } finally {
      setLoading(false);
    }
  }

  return (
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
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Ism-familiyangiz *
              </label>
              <input
                className="border rounded-xl w-full px-4 py-3 focus:outline-blue-500 text-sm"
                placeholder="Aziz Karimov"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Email *
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
              Parol *
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
          <p className={`text-xs mt-4 p-3 rounded-xl ${msg.includes("muvaffaqiyatli") ? "bg-emerald-50 text-emerald-700 font-medium" : msg.includes("yaratildi") ? "bg-blue-50 text-blue-700 font-medium" : "bg-red-50 text-red-700 font-medium"}`}>
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
  );
}

export default function Login() {
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <Suspense fallback={<div className="text-gray-500">Yuklanmoqda...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
