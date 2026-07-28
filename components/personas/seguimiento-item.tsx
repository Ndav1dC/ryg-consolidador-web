import type { SeguimientoItem } from "@/lib/data/personas"

type Props = {
  seguimiento: SeguimientoItem
  index: number
  isLast?: boolean
}

function formatDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getTitle(seguimiento: SeguimientoItem) {
  switch (seguimiento.tipo) {
    case "llamada":
      return "Primera llamada"
    case "culto":
      return "Asistencia al culto"
    case "casa_avivamiento":
      return "Ubicación en Casa de Avivamiento"
    case "discipulado":
      return "Proceso de discipulado"
    case "ministerio":
      return "Servicio en ministerio"
    default:
      return seguimiento.tipo || `Seguimiento ${seguimiento.paso ?? ""}`.trim()
  }
}

function getMeta(seguimiento: SeguimientoItem) {
  switch (seguimiento.tipo) {
    case "casa_avivamiento":
      return seguimiento.casa || "Sin casa asignada"
    case "discipulado":
      return seguimiento.nivel_discipulado || "Sin nivel registrado"
    case "ministerio":
      return seguimiento.ministerio || "Sin ministerio registrado"
    default:
      return seguimiento.resultado || "Sin resultado registrado"
  }
}

function getStatusClasses(status?: string | null) {
  const value = status?.toLowerCase()

  if (value === "consolidado") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (value === "activo" || value === "completado") {
    return "bg-blue-100 text-blue-700"
  }

  if (value === "pendiente") {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-stone-100 text-stone-700"
}

export function SeguimientoItemCard({
  seguimiento,
  index,
  isLast = false,
}: Props) {
  const title = getTitle(seguimiento)
  const meta = getMeta(seguimiento)
  const fecha = formatDate(seguimiento.fecha)
  const programada = formatDate(seguimiento.fecha_programada)

  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
            {seguimiento.paso ?? index + 1}
          </div>

          {!isLast ? <div className="mt-2 h-full min-h-10 w-px bg-amber-200" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-stone-900">{title}</h3>

                {seguimiento.estado ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      seguimiento.estado
                    )}`}
                  >
                    {seguimiento.estado}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-stone-500">
                {meta}
              </p>
            </div>

            {fecha ? (
              <p className="text-sm font-medium text-stone-500">{fecha}</p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {seguimiento.resultado ? (
              <div className="rounded-2xl bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Resultado
                </p>
                <p className="mt-1 text-sm text-stone-800">{seguimiento.resultado}</p>
              </div>
            ) : null}

            {seguimiento.casa ? (
              <div className="rounded-2xl bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Casa
                </p>
                <p className="mt-1 text-sm text-stone-800">{seguimiento.casa}</p>
              </div>
            ) : null}

            {seguimiento.lider ? (
              <div className="rounded-2xl bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Líder
                </p>
                <p className="mt-1 text-sm text-stone-800">{seguimiento.lider}</p>
              </div>
            ) : null}

            {seguimiento.nivel_discipulado ? (
              <div className="rounded-2xl bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Nivel discipulado
                </p>
                <p className="mt-1 text-sm text-stone-800">
                  {seguimiento.nivel_discipulado}
                </p>
              </div>
            ) : null}

            {seguimiento.ministerio ? (
              <div className="rounded-2xl bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Ministerio
                </p>
                <p className="mt-1 text-sm text-stone-800">{seguimiento.ministerio}</p>
              </div>
            ) : null}

            {programada ? (
              <div className="rounded-2xl bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Fecha programada
                </p>
                <p className="mt-1 text-sm text-stone-800">{programada}</p>
              </div>
            ) : null}
          </div>

          {seguimiento.observaciones ? (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Observaciones
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {seguimiento.observaciones}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}