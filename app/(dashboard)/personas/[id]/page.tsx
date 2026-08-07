import Link from "next/link"
import { notFound } from "next/navigation"
import { Topbar } from "@/components/dashboard/topbar"
import { PersonDetailHeader } from "@/components/personas/person-detail-header"
import {
  getNotasByPersonaId,
  getPersonaById,
  getSeguimientosByPersonaId,
} from "@/lib/data/personas"

type Props = {
  params: Promise<{
    id: string
  }>
}

function formatDate(value?: string | null) {
  if (!value) return "No registrado"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function PersonaDetailPage({ params }: Props) {
  const { id } = await params

  if (!id || id === "undefined") {
    notFound()
  }

  const [persona, seguimientos, notas] = await Promise.all([
    getPersonaById(id),
    getSeguimientosByPersonaId(id),
    getNotasByPersonaId(id),
  ])

  return (
    <main>
      <Topbar
        title="Detalle de persona"
        subtitle="Consulta el historial y el estado del proceso."
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PersonDetailHeader persona={persona} />

          {persona?.id ? (
            <div className="flex justify-end">
              <Link
                href={`/seguimientos/nuevo?personaId=${persona.id}`}
                className="inline-flex items-center rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700"
              >
                + Nuevo seguimiento
              </Link>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900">Seguimientos</h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {seguimientos.length}
                </span>
              </div>

              <div className="space-y-3">
                {seguimientos.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-stone-200 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                        Etapa {item.paso ?? "-"}
                      </span>
                      {item.tipo ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {item.tipo}
                        </span>
                      ) : null}
                      {item.estado ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {item.estado}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-stone-700">
                      <p>
                        <span className="font-medium text-stone-900">Fecha:</span>{" "}
                        {formatDate(item.fecha)}
                      </p>

                      {item.resultado ? (
                        <p>
                          <span className="font-medium text-stone-900">Resultado:</span>{" "}
                          {item.resultado}
                        </p>
                      ) : null}

                      {item.casa ? (
                        <p>
                          <span className="font-medium text-stone-900">Casa:</span>{" "}
                          {item.casa}
                        </p>
                      ) : null}

                      {item.lider ? (
                        <p>
                          <span className="font-medium text-stone-900">Líder:</span>{" "}
                          {item.lider}
                        </p>
                      ) : null}

                      {item.ministerio ? (
                        <p>
                          <span className="font-medium text-stone-900">Ministerio:</span>{" "}
                          {item.ministerio}
                        </p>
                      ) : null}

                      {item.nivel_discipulado ? (
                        <p>
                          <span className="font-medium text-stone-900">
                            Nivel discipulado:
                          </span>{" "}
                          {item.nivel_discipulado}
                        </p>
                      ) : null}

                      {item.fecha_programada ? (
                        <p>
                          <span className="font-medium text-stone-900">
                            Fecha programada:
                          </span>{" "}
                          {formatDate(item.fecha_programada)}
                        </p>
                      ) : null}

                      {item.observaciones ? (
                        <p className="pt-1 text-stone-600">{item.observaciones}</p>
                      ) : null}
                    </div>
                  </article>
                ))}

                {seguimientos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
                    No hay seguimientos registrados para esta persona.
                  </div>
                ) : null}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-900">Información</h3>

                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  <p>
                    <span className="font-medium text-stone-900">Conoció por:</span>{" "}
                    {persona.como_conocio || "No registrado"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-900">Invitado por:</span>{" "}
                    {persona.invitado_por || "No registrado"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-900">Aceptó a Jesús:</span>{" "}
                    {persona.acepto_jesus ? "Sí" : "No"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-900">
                      Petición de oración:
                    </span>{" "}
                    {persona.peticion_oracion || "No registrada"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-900">Próximo paso:</span>{" "}
                    {persona.proximo_paso || "No definido"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-900">
                      Última gestión:
                    </span>{" "}
                    {formatDate(persona.ultima_gestion_fecha)}
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-stone-900">Notas</h3>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    {notas.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {notas.map((nota) => (
                    <article
                      key={nota.id}
                      className="rounded-2xl border border-stone-200 p-4 text-sm text-stone-700"
                    >
                      <p>{nota.nota}</p>
                      <p className="mt-2 text-xs text-stone-400">
                        {formatDate(nota.created_at)}
                      </p>
                    </article>
                  ))}

                  {notas.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
                      No hay notas registradas.
                    </div>
                  ) : null}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}