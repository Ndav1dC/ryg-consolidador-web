import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/components/dashboard/topbar"
import { PersonDetailHeader } from "@/components/personas/person-detail-header"
import {
  getNotasByPersonaId,
  getPersonaById,
  getSeguimientosByPersonaId,
} from "@/lib/data/personas"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Props = {
  params: Promise<{
    id: string
  }>
}

const ETAPAS_CONSOLIDADOR = 3
const ETAPAS_LIDER_CASA = [4, 5]

const ETAPAS: Record<
  number,
  {
    titulo: string
    descripcion: string
  }
> = {
  1: {
    titulo: "Primera llamada",
    descripcion: "Contactar a la persona y registrar el resultado.",
  },
  2: {
    titulo: "Volvió a asistir a otro servicio",
    descripcion: "Confirmar si la persona volvió a asistir a otro servicio.",
  },
  3: {
    titulo: "Casa de Avivamiento",
    descripcion: "Asignar la persona a una Casa de Avivamiento y líder.",
  },
  4: {
    titulo: "Discipulado",
    descripcion: "Registrar el siguiente nivel de discipulado.",
  },
  5: {
    titulo: "Ministerio",
    descripcion: "Registrar el ministerio y finalizar el proceso.",
  },
}

function formatDate(value?: string | null) {
  if (!value) return "No registrado"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getTipoLabel(tipo?: string | null) {
  const tipos: Record<string, string> = {
    llamada: "Llamada",
    visita: "Visita",
    culto: "Servicio",
    casa_avivamiento: "Casa de Avivamiento",
    discipulado: "Discipulado",
    ministerio: "Ministerio",
  }

  return tipos[tipo || ""] || tipo || "Seguimiento"
}

function getEstadoClasses(estado?: string | null) {
  const value = estado?.toLowerCase()

  if (value === "completado" || value === "consolidado") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (value === "activo") {
    return "bg-blue-100 text-blue-700"
  }

  if (value === "pendiente") {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-stone-100 text-stone-700"
}

function getRolActivo(
  roles: string[],
  cookieRole?: string
): "consolidador" | "lider_casa" | "admin" {
  if (
    cookieRole === "lider_casa" ||
    cookieRole === "consolidador" ||
    cookieRole === "admin"
  ) {
    return cookieRole
  }

  if (roles.includes("lider_casa")) {
    return "lider_casa"
  }

  if (roles.includes("admin")) {
    return "admin"
  }

  return "consolidador"
}

export default async function PersonaDetailPage({ params }: Props) {
  const { id } = await params

  if (!id || id === "undefined") {
    notFound()
  }

  const [persona, seguimientos, notas, userData] = await Promise.all([
    getPersonaById(id),
    getSeguimientosByPersonaId(id),
    getNotasByPersonaId(id),
    getCurrentUserProfile(),
  ])

  if (!persona) {
    notFound()
  }

  const cookieStore = await cookies()
  const cookieRole = cookieStore.get("rol_activo")?.value

  const roles = userData?.profile?.roles || []
  const rolActivo = getRolActivo(roles, cookieRole)

  const esLiderCasa = rolActivo === "lider_casa"
  const esConsolidador = rolActivo === "consolidador"

  const etapaRegistrada = Number(persona.etapa_actual) || 1

  const visitaPendiente = seguimientos.find(
    (item) =>
      item.tipo?.toLowerCase() === "visita" &&
      item.estado?.toLowerCase() === "pendiente"
  )

  const visitaConfirmada = seguimientos.some(
    (item) =>
      item.tipo?.toLowerCase() === "visita" &&
      item.estado?.toLowerCase() === "completado" &&
      item.resultado?.toLowerCase() === "sí"
  )

  const ministerioCompletado = seguimientos.some(
    (item) =>
      item.paso === 5 &&
      item.tipo?.toLowerCase() === "ministerio" &&
      item.estado?.toLowerCase() === "consolidado"
  )

  const procesoLiderCompletado =
    esLiderCasa &&
    (ministerioCompletado ||
      persona.estado_consolidacion?.toLowerCase() === "consolidado")

  const procesoConsolidadorCompletado =
    esConsolidador && etapaRegistrada > ETAPAS_CONSOLIDADOR

  const procesoCompletado = esLiderCasa
    ? procesoLiderCompletado
    : procesoConsolidadorCompletado

  const etapasVisibles = esLiderCasa ? ETAPAS_LIDER_CASA : [1, 2, 3]

  const etapaActual = esLiderCasa
    ? procesoLiderCompletado
      ? 5
      : Math.min(Math.max(etapaRegistrada, 4), 5)
    : Math.min(Math.max(etapaRegistrada, 1), 3)

  const etapa = ETAPAS[etapaActual] || ETAPAS[esLiderCasa ? 4 : 1]

  const tituloProceso = esLiderCasa
    ? "Proceso del Líder de Casa"
    : "Proceso del consolidador"

  const textoBoton = visitaPendiente
    ? "Confirmar visita"
    : `Registrar Etapa ${etapaActual}`

  return (
    <main>
      <Topbar
        title="Detalle de persona"
        subtitle="Consulta el estado y registra la siguiente gestión."
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PersonDetailHeader persona={persona} />

          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {tituloProceso}
                  </p>

                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                    {esLiderCasa ? "2 etapas" : "3 etapas"}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-stone-900">
                    {procesoCompletado
                      ? `${tituloProceso} completado`
                      : `Etapa ${etapaActual}: ${etapa.titulo}`}
                  </h3>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      procesoCompletado
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {procesoCompletado ? "Completado" : "En proceso"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-stone-600">
                  {procesoCompletado
                    ? esLiderCasa
                      ? "La persona completó discipulado y ministerio."
                      : "La persona completó las etapas correspondientes al consolidador."
                    : etapa.descripcion}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                  {etapasVisibles.map((paso, index) => {
                    const pasoCompletado =
                      procesoCompletado || paso < etapaActual

                    const pasoActual =
                      !procesoCompletado && paso === etapaActual

                    return (
                      <div key={paso} className="flex items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            pasoCompletado
                              ? "bg-emerald-600 text-white"
                              : pasoActual
                                ? "bg-amber-600 text-white"
                                : "bg-stone-200 text-stone-500"
                          }`}
                        >
                          {pasoCompletado ? "✓" : paso}
                        </span>

                        {index < etapasVisibles.length - 1 ? (
                          <span
                            className={`h-px w-8 ${
                              pasoCompletado
                                ? "bg-emerald-300"
                                : "bg-stone-200"
                            }`}
                          />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              {procesoCompletado ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {esLiderCasa
                    ? "Proceso finalizado."
                    : "El proceso continúa con el siguiente equipo."}
                </div>
              ) : (
                <Link
                  href={`/seguimientos/nuevo?personaId=${persona.id}&paso=${etapaActual}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700"
                >
                  {textoBoton}
                </Link>
              )}
            </div>
          </section>

          {visitaPendiente && esConsolidador ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Acción pendiente
              </p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-amber-950">
                    Confirmar visita
                  </h3>

                  <p className="mt-1 text-sm text-amber-900">
                    Programada para{" "}
                    {formatDate(visitaPendiente.fecha_programada)}.
                  </p>
                </div>

                <Link
                  href={`/seguimientos/nuevo?personaId=${persona.id}&paso=${etapaActual}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Gestionar visita
                </Link>
              </div>
            </section>
          ) : null}

          {esConsolidador ? (
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-900">
                  Estado de la gestión
                </h3>

                <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                  {visitaPendiente ? (
                    <>
                      <p className="font-semibold text-amber-800">
                        Hay una visita pendiente.
                      </p>

                      <p className="mt-1">
                        Confirma la visita antes de continuar a la Etapa 2.
                      </p>
                    </>
                  ) : visitaConfirmada && etapaActual === 2 ? (
                    <>
                      <p className="font-semibold text-emerald-700">
                        Visita confirmada.
                      </p>

                      <p className="mt-1">
                        Ahora confirma si la persona volvió a asistir a otro
                        servicio.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-stone-900">
                        Siguiente acción
                      </p>

                      <p className="mt-1">
                        Continúa con la Etapa {etapaActual}.
                      </p>
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-900">
                  Información
                </h3>

                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  <p>
                    <span className="font-medium text-stone-900">
                      Conoció por:
                    </span>{" "}
                    {persona.como_conocio || "No registrado"}
                  </p>

                  <p>
                    <span className="font-medium text-stone-900">
                      Invitado por:
                    </span>{" "}
                    {persona.invitado_por || "No registrado"}
                  </p>

                  <p>
                    <span className="font-medium text-stone-900">
                      Aceptó a Jesús:
                    </span>{" "}
                    {persona.acepto_jesus ? "Sí" : "No"}
                  </p>

                  <p>
                    <span className="font-medium text-stone-900">
                      Próximo paso:
                    </span>{" "}
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
            </section>
          ) : (
            <section className="space-y-6">
              <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-800">
                  Sigue las etapas asignadas a tu rol.
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  Registra los niveles de discipulado y, cuando estén
                  completos, registra el ministerio de la persona.
                </p>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-900">
                  Información
                </h3>

                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  <p>
                    <span className="font-medium text-stone-900">
                      Conoció por:
                    </span>{" "}
                    {persona.como_conocio || "No registrado"}
                  </p>

                  <p>
                    <span className="font-medium text-stone-900">
                      Invitado por:
                    </span>{" "}
                    {persona.invitado_por || "No registrado"}
                  </p>

                  <p>
                    <span className="font-medium text-stone-900">
                      Aceptó a Jesús:
                    </span>{" "}
                    {persona.acepto_jesus ? "Sí" : "No"}
                  </p>

                  <p>
                    <span className="font-medium text-stone-900">
                      Próximo paso:
                    </span>{" "}
                    {persona.proximo_paso || "No definido"}
                  </p>
                </div>
              </section>
            </section>
          )}

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
        </div>
      </section>
    </main>
  )
}