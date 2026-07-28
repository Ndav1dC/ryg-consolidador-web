import Link from "next/link"
import type { SeguimientoListItem } from "@/lib/data/seguimientos"

type Props = {
  items: SeguimientoListItem[]
}

function formatDate(value?: string | null) {
  if (!value) return "No registrada"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function badgeClass(value?: string | null) {
  const normalized = String(value ?? "").toLowerCase()

  if (normalized === "consolidado" || normalized === "completado") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (normalized === "pendiente") {
    return "bg-amber-100 text-amber-700"
  }

  if (normalized === "activo" || normalized === "en proceso") {
    return "bg-blue-100 text-blue-700"
  }

  if (normalized === "nuevo") {
    return "bg-stone-200 text-stone-700"
  }

  return "bg-stone-100 text-stone-700"
}

export function SeguimientosTable({ items }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Persona</th>
              <th className="px-4 py-3 font-semibold">Estado persona</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Paso</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Estado seguimiento</th>
              <th className="px-4 py-3 font-semibold">Resultado</th>
              <th className="px-4 py-3 font-semibold">Programada</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-stone-200">
                <td className="px-4 py-4 align-top">
                  <div className="min-w-[220px]">
                    <p className="font-semibold text-stone-900">
                      {item.persona?.nombre_completo ?? "Sin persona"}
                    </p>
                    <div className="mt-1 space-y-1 text-stone-500">
                      {item.persona?.celular ? <p>{item.persona.celular}</p> : null}
                      {item.persona?.barrio ? <p>{item.persona.barrio}</p> : null}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                      item.persona?.estado_consolidacion
                    )}`}
                  >
                    {item.persona?.estado_consolidacion ?? "Sin estado"}
                  </span>
                </td>

                <td className="px-4 py-4 align-top capitalize text-stone-700">
                  {item.tipo ?? "-"}
                </td>

                <td className="px-4 py-4 align-top text-stone-700">
                  {item.paso ?? "-"}
                </td>

                <td className="px-4 py-4 align-top text-stone-700">
                  {formatDate(item.fecha)}
                </td>

                <td className="px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                      item.estado
                    )}`}
                  >
                    {item.estado ?? "Sin estado"}
                  </span>
                </td>

                <td className="px-4 py-4 align-top text-stone-700">
                  <div className="max-w-[260px]">
                    {item.resultado || item.observaciones || "-"}
                  </div>
                </td>

                <td className="px-4 py-4 align-top text-stone-700">
                  {formatDate(item.fecha_programada)}
                </td>

                <td className="px-4 py-4 align-top">
                  {item.persona_id ? (
                    <Link
                      href={`/personas/${item.persona_id}`}
                      className="inline-flex rounded-xl border border-stone-200 px-3 py-2 font-medium text-stone-700 transition hover:bg-stone-100"
                    >
                      Ver persona
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 ? (
        <div className="border-t border-stone-200 px-6 py-10 text-center text-sm text-stone-500">
          No se encontraron seguimientos con los filtros actuales.
        </div>
      ) : null}
    </div>
  )
}