"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const s = createClient();
      s.auth.getUser()
        .then(res => setUser(res?.data?.user ?? null))
        .catch(() => setUser(null));

      const { data: { subscription } } = s.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription?.unsubscribe();
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-20">
      <div className="container-x h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-black text-xl tracking-tight">
          Teacher<span className="text-blue-600">Jobs</span> UZ
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/vacancies" className="text-gray-700 hover:text-blue-600">Vakansiyalar</Link>
          <Link href="/vacancies/new" className="hidden sm:inline-block text-blue-600 hover:underline">+ E'lon berish</Link>
          <Link href="/profile" className="text-gray-700 hover:text-blue-600">Profil</Link>
          {user ? (
            <button
              onClick={async () => {
                await createClient().auth.signOut();
                location.href = "/";
              }}
              className="rounded-xl border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              Chiqish
            </button>
          ) : (
            <Link href="/login" className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
              Kirish
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
