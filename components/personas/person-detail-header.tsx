import { StatusBadge } from "./status-badge"
import type { PersonaDetail } from "@/lib/data/personas"

type Props = {
  persona: PersonaDetail
}

function formatHeaderDate(value?: string | null) {
  if (!value) return "No registrado"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function PersonDetailHeader({ persona }: Props) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-amber-50 text-4xl text-amber-700">
            👤
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-stone-900">
                {persona.nombre_completo}
              </h2>
              <StatusBadge status={persona.estado_consolidacion} />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
              {persona.celular ? <span>{persona.celular}</span> : null}
              {persona.edad ? <span>{persona.edad} años</span> : null}
              {persona.fecha_nacimiento ? <span>{persona.fecha_nacimiento}</span> : null}
              {persona.barrio ? <span>{persona.barrio}</span> : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Etapa actual
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  Etapa {persona.etapa_actual ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Aceptó a Jesús
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {persona.acepto_jesus ? "Sí" : "No"}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Próximo paso
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {persona.proximo_paso || "No definido"}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Última gestión
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {formatHeaderDate(persona.ultima_gestion_fecha)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Fecha de registro
          </p>
          <p className="mt-1 font-medium text-stone-900">
            {formatHeaderDate(persona.created_at)}
          </p>

          <div className="mt-4 border-t border-stone-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Registro llenado por
            </p>
            <p className="mt-1 font-medium text-stone-900">
              Formulario de primer contacto
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}