"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Tasdiqlanmoqda...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        const s = createClient();

        // Check if there is a code param for PKCE exchange
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await s.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Check current session
        const { data: { session }, error: sessionError } = await s.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          setStatus("Email muvaffaqiyatli tasdiqlandi! Profilingizga yo‘naltirilmoqda...");
          setTimeout(() => {
            router.push("/profile");
          }, 1200);
        } else {
          // If no session yet, wait for onAuthStateChange
          const { data: { subscription } } = s.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || session?.user) {
              setStatus("Email muvaffaqiyatli tasdiqlandi! Yo‘naltirilmoqda...");
              setTimeout(() => router.push("/profile"), 1000);
            }
          });
          return () => subscription?.unsubscribe();
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err.message || "Email tasdiqlashda xatolik yuz berdi");
        setStatus("");
      }
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="card p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Teacher<span className="text-blue-600">Jobs</span> UZ
        </h1>

        {error ? (
          <div>
            <p className="text-red-600 text-sm mt-4 font-semibold">{error}</p>
            <Link
              href="/login"
              className="mt-6 inline-block bg-blue-600 text-white rounded-xl px-6 py-2.5 font-bold text-sm hover:bg-blue-700"
            >
              Kirish sahifasiga o‘tish
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto my-6" />
            <p className="text-gray-600 text-sm font-medium">{status}</p>
          </div>
        )}
      </div>
    </main>
  );
}
