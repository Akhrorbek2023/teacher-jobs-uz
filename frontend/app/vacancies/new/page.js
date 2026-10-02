"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";

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
  "Boshlang‘ich ta'lim",
  "Musiqa va san'at",
  "Jismoniy tarbiya"
];

export default function NewVacancy() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    subject: "",
    employment_type: "full_time",
    city: "",
    district: "",
    salary_min: "",
    salary_max: "",
    salary_text: "",
    description: "",
    requirements: "",
    responsibilities: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject || undefined,
        employment_type: form.employment_type,
        city: form.city || undefined,
        district: form.district.trim() || undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        salary_text: form.salary_text.trim() || undefined,
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        responsibilities: form.responsibilities.trim() || undefined
      };

      const res = await fetch(`${API_URL}/api/vacancies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Vakansiyani saqlashda xatolik yuz berdi");
      }

      const json = await res.json();
      setSuccess(true);
      setTimeout(() => {
        router.push(`/vacancies/${json.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container-x py-10 max-w-2xl">
        <Link href="/vacancies" className="text-sm font-semibold text-gray-500 hover:text-blue-600 mb-6 inline-block">
          ← Vakansiyalarga qaytish
        </Link>

        <div className="card p-8">
          <h1 className="text-3xl font-black text-gray-900">Yangi vakansiya joylash</h1>
          <p className="text-sm text-gray-500 mt-1">
            Maktab, litsey yoki o‘quv markazingiz uchun malakali o‘qituvchi toping.
          </p>

          {success && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
              ✓ Vakansiya muvaffaqiyatli chop etildi! Sahifaga yo‘naltirilmoqda...
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Lavozim / Vakansiya nomi *
              </label>
              <input
                type="text"
                required
                minLength={3}
                placeholder="Masalan: Boshlang‘ich sinf o‘qituvchisi"
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={form.title}
                onChange={e => handleChange("title", e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Fan</label>
                <select
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500 bg-white"
                  value={form.subject}
                  onChange={e => handleChange("subject", e.target.value)}
                >
                  <option value="">Fan tanlang...</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Bandlik turi</label>
                <select
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500 bg-white"
                  value={form.employment_type}
                  onChange={e => handleChange("employment_type", e.target.value)}
                >
                  <option value="full_time">To‘liq stavka</option>
                  <option value="part_time">Yarim stavka</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Shahar / Viloyat</label>
                <select
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500 bg-white"
                  value={form.city}
                  onChange={e => handleChange("city", e.target.value)}
                >
                  <option value="">Hududni tanlang...</option>
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Tuman / Manzil</label>
                <input
                  type="text"
                  placeholder="Masalan: Chilonzor tumani"
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                  value={form.district}
                  onChange={e => handleChange("district", e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700">Minimal maosh (so‘m)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="4000000"
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                  value={form.salary_min}
                  onChange={e => handleChange("salary_min", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Maksimal maosh (so‘m)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="8000000"
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                  value={form.salary_max}
                  onChange={e => handleChange("salary_max", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Maosh matni</label>
                <input
                  type="text"
                  placeholder="4 - 8 mln so‘m"
                  className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                  value={form.salary_text}
                  onChange={e => handleChange("salary_text", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Batafsil tavsif * (kamida 10 belgi)
              </label>
              <textarea
                required
                minLength={10}
                rows={4}
                placeholder="Maktabimiz haqida qisqacha, o‘quv muhiti va umumiy shartlar..."
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Nomzodga talablar
              </label>
              <textarea
                rows={3}
                placeholder="Oliy ma'lumot, pedagogik tajriba, toifa, til bilish sertifikatlari..."
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={form.requirements}
                onChange={e => handleChange("requirements", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Asosiy vazifalar
              </label>
              <textarea
                rows={3}
                placeholder="Darslarni zamonaviy metodikada o'tish, o'quvchilar bilan ishlash..."
                className="border rounded-xl w-full px-4 py-3 mt-1.5 focus:outline-blue-500"
                value={form.responsibilities}
                onChange={e => handleChange("responsibilities", e.target.value)}
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link href="/vacancies" className="text-sm font-bold text-gray-500 hover:underline">
                Bekor qilish
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 text-white px-8 py-3 font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Chop etilmoqda..." : "Vakansiyani chop etish"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
