type AdminTeamMember = {
  id: string
  nombre: string
  rol: "consolidador" | "lider_casa"
  asignadas: number
  activas: number
  pendientes: number
  consolidadas: number
}

type AdminTeamCardProps = {
  titulo: string
  descripcion: string
  miembros: AdminTeamMember[]
  tipo: "consolidador" | "lider_casa"
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("")
}

export function AdminTeamCard({
  titulo,
  descripcion,
  miembros,
  tipo,
}: AdminTeamCardProps) {
  const colorPrincipal =
    tipo === "lider_casa"
      ? {
          fondo: "bg-violet-100",
          texto: "text-violet-700",
          borde: "border-violet-200",
        }
      : {
          fondo: "bg-amber-100",
          texto: "text-amber-700",
          borde: "border-amber-200",
        }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">{titulo}</p>

          <p className="mt-1 text-sm text-stone-500">{descripcion}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${colorPrincipal.fondo} ${colorPrincipal.texto}`}
        >
          {miembros.length}
        </span>
      </div>

      {miembros.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-200 px-4 py-10 text-center">
          <p className="text-sm font-medium text-stone-700">
            No hay miembros registrados
          </p>

          <p className="mt-1 text-xs text-stone-500">
            Los miembros del equipo aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {miembros.map((miembro) => (
            <article
              key={miembro.id}
              className={`rounded-2xl border p-4 transition hover:shadow-sm ${colorPrincipal.borde}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorPrincipal.fondo} ${colorPrincipal.texto}`}
                >
                  {iniciales(miembro.nombre)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {miembro.nombre}
                      </p>

                      <p className="mt-0.5 text-xs capitalize text-stone-500">
                        {miembro.rol === "lider_casa"
                          ? "Líder de Casa"
                          : "Consolidador"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-stone-900">
                        {miembro.asignadas}
                      </p>

                      <p className="text-[10px] uppercase tracking-wide text-stone-500">
                        Asignadas
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-emerald-700">
                        {miembro.activas}
                      </p>

                      <p className="mt-0.5 text-[10px] text-stone-500">
                        Activas
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-amber-700">
                        {miembro.pendientes}
                      </p>

                      <p className="mt-0.5 text-[10px] text-stone-500">
                        Pendientes
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-sky-700">
                        {miembro.consolidadas}
                      </p>

                      <p className="mt-0.5 text-[10px] text-stone-500">
                        Consolidadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}