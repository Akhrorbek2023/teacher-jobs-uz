import Link from "next/link";

export default function VacancyCard({ v }) {
  const isExternal = Boolean(v.source_url);
  const detailHref = v.source_url || `/vacancies/${v.id}`;
  const companyName = v.companies?.name || v.source_name;

  return (
    <article className="card p-5 hover:-translate-y-0.5 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-snug">{v.title}</h3>
            {companyName && (
              <p className="text-sm font-medium text-blue-600 mt-0.5">{companyName}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {v.subject || "Fan ko‘rsatilmagan"} · {v.city || "O‘zbekiston"}
              {v.district ? `, ${v.district}` : ""}
            </p>
          </div>
          {(v.verified || v.companies?.verified) && (
            <span className="shrink-0 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
              ✓ Verified
            </span>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 font-medium">
            {v.employment_type === "part_time" ? "Yarim stavka" : "To‘liq stavka"}
          </span>
          <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 font-medium">
            {v.salary_text || (v.salary_min ? `${Number(v.salary_min).toLocaleString()} so‘m+` : "Kelishiladi")}
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{v.description}</p>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        {isExternal ? (
          <a
            href={detailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 text-sm hover:underline"
          >
            Manbada ko‘rish ↗
          </a>
        ) : (
          <Link
            href={detailHref}
            className="font-bold text-blue-600 text-sm hover:underline"
          >
            Vakansiyani ko‘rish →
          </Link>
        )}
      </div>
    </article>
  );
}

