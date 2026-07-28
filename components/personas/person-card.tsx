import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { PersonaListItem } from "@/lib/data/personas"

type PersonCardProps = {
  persona: PersonaListItem
}

export function PersonCard({ persona }: PersonCardProps) {
  if (!persona?.id) return null

  return (
    <Link
      href={`/personas/${persona.id}`}
      className="block rounded-3xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl text-amber-700">
          👤
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-stone-900">
              {persona.nombre_completo}
            </h3>
            <StatusBadge status={persona.estado_consolidacion} />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
            {persona.edad ? <span>{persona.edad} años</span> : null}
            {persona.barrio ? <span>{persona.barrio}</span> : null}
            {persona.celular ? <span>{persona.celular}</span> : null}
            {persona.etapa_actual ? <span>Etapa {persona.etapa_actual}</span> : null}
          </div>
        </div>

        <div className="pt-1 text-stone-400">›</div>
      </div>
    </Link>
  )
}