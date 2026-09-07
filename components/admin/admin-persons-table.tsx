import Link from "next/link"
import type { PersonaListItem } from "@/lib/data/personas"

type AdminPersonsTableProps = {
  personas: PersonaListItem[]
}

function getEstadoClasses(estado: string | null) {
  if (estado === "consolidado") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (estado === "activo") {
    return "bg-sky-100 text-sky-700"
  }

  if (estado === "pendiente") {
    return "bg-amber-100 text-amber-700"
  }

  if (estado === "nuevo") {
    return "bg-violet-100 text-violet-700"
  }

  return "bg-stone-100 text-stone-600"
}

function getEstadoLabel(estado: string | null) {
  if (estado === "consolidado") return "Consolidado"
  if (estado === "activo") return "Activo"
  if (estado === "pendiente") return "Pendiente"
  if (estado === "nuevo") return "Nuevo"

  return "Sin estado"
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin gestión"

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${fecha}T12:00:00`))
}

function getEtapaLabel(etapa: number | null) {
  if (!etapa || etapa <= 1) return "Etapa 1"
  if (etapa === 2) return "Etapa 2"
  if (etapa === 3) return "Etapa 3"
  if (etapa === 4) return "Etapa 4"
  if (etapa >= 5) return "Etapa 5"

  return "Sin etapa"
}

export function AdminPersonsTable({
  personas,
}: AdminPersonsTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-base font-semibold text-stone-900">
            Personas en consolidación
          </p>

          <p className="mt-1 text-sm text-stone-500">
            Vista global de todos los registros del proceso.
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          {personas.length}{" "}
          {personas.length === 1 ? "persona" : "personas"}
        </span>
      </div>

      {personas.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-stone-900">
            No hay personas para mostrar
          </p>

          <p className="mt-1 text-sm text-stone-500">
            Los registros de personas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Persona</th>
                <th className="px-5 py-3.5 font-semibold">Celular</th>
                <th className="px-5 py-3.5 font-semibold">Barrio</th>
                <th className="px-5 py-3.5 font-semibold">Estado</th>
                <th className="px-5 py-3.5 font-semibold">Etapa</th>
                <th className="px-5 py-3.5 font-semibold">
                  Última gestión
                </th>
                <th className="px-5 py-3.5 font-semibold">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {personas.map((persona) => (
                <tr
                  key={persona.id}
                  className="transition hover:bg-stone-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
                        {persona.nombre_completo
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-stone-900">
                          {persona.nombre_completo}
                        </p>

                        <p className="mt-0.5 text-xs text-stone-500">
                          {persona.numero_invalido
                            ? "Número inválido"
                            : persona.proximo_paso || "Sin próximo paso"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-stone-600">
                    {persona.celular || "—"}
                  </td>

                  <td className="px-5 py-4 text-stone-600">
                    {persona.barrio || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                        persona.estado_consolidacion
                      )}`}
                    >
                      {getEstadoLabel(persona.estado_consolidacion)}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-medium text-stone-700">
                    {getEtapaLabel(persona.etapa_actual)}
                  </td>

                  <td className="px-5 py-4 text-stone-600">
                    {formatearFecha(persona.ultima_gestion_fecha)}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/personas/${persona.id}`}
                      className="inline-flex rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-700"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}