import { cookies } from "next/headers"
import Link from "next/link"

import { Topbar } from "@/components/dashboard/topbar"
import { SeguimientoItemCard } from "@/components/personas/seguimiento-item"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import {
  getPersonaById,
  getPersonas,
  getSeguimientosByPersonaId,
} from "@/lib/data/personas"

type Props = {
  searchParams: Promise<{
    personaId?: string
  }>
}

function normalizePersonaId(value?: string) {
  if (!value || value === "undefined" || value === "null") {
    return undefined
  }

  return value
}

function formatDate(value?: string | null) {
  if (!value) return "No registrada"

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

function getRolActivo(roles: string[], cookieRole?: string) {
  if (
    cookieRole === "lider_casa" &&
    roles.includes("lider_casa")
  ) {
    return "lider_casa"
  }

  if (
    cookieRole === "consolidador" &&
    roles.includes("consolidador")
  ) {
    return "consolidador"
  }

  if (cookieRole === "admin" && roles.includes("admin")) {
    return "admin"
  }

  if (roles.includes("lider_casa")) {
    return "lider_casa"
  }

  if (roles.includes("admin")) {
    return "admin"
  }

  return "consolidador"
}

function ordenarSeguimientos(
  items: Awaited<ReturnType<typeof getSeguimientosByPersonaId>>
) {
  return [...items].sort((a, b) => {
    const pasoA = Number(a.paso ?? 0)
    const pasoB = Number(b.paso ?? 0)

    if (pasoA !== pasoB) {
      return pasoA - pasoB
    }

    return (
      new Date(a.fecha ?? 0).getTime() -
      new Date(b.fecha ?? 0).getTime()
    )
  })
}

function getEtapaLabel(paso: number | null) {
  if (paso === 1) return "Etapa 1 · Primera llamada"
  if (paso === 2) return "Etapa 2 · Asistencia al culto"
  if (paso === 3) return "Etapa 3 · Casa de Avivamiento"
  if (paso === 4) return "Etapa 4 · Discipulado"
  if (paso === 5) return "Etapa 5 · Departamento y consolidación"

  return "Seguimiento"
}

export default async function SeguimientosPage({
  searchParams,
}: Props) {
  const params = await searchParams
  const selectedPersonaId = normalizePersonaId(params.personaId)

  const userData = await getCurrentUserProfile()

  if (!userData) {
    return null
  }

  const roles = userData.profile?.roles || []
  const cookieStore = await cookies()

  const rolActivo = getRolActivo(
    roles,
    cookieStore.get("rol_activo")?.value
  )

  const personas = await getPersonas()

  const personaSeleccionada = selectedPersonaId
    ? await getPersonaById(selectedPersonaId)
    : null

  const personaPermitida = personaSeleccionada
    ? personas.some((persona) => persona.id === personaSeleccionada.id)
    : false

  const seguimientos =
    personaPermitida && personaSeleccionada
      ? ordenarSeguimientos(
          await getSeguimientosByPersonaId(personaSeleccionada.id)
        )
      : []

  const tituloRol =
    rolActivo === "lider_casa"
      ? "Líder de Casa"
      : rolActivo === "admin"
        ? "Administrador"
        : "Consolidador"

  return (
    <main>
      <Topbar
        title="Seguimientos"
        subtitle="Selecciona una persona para consultar su historial."
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {tituloRol}
            </p>

            <h1 className="mt-1 text-xl font-bold text-stone-900">
              Selecciona una persona
            </h1>

            <p className="mt-1 text-sm text-stone-500">
              Consulta todo el proceso desde la primera etapa hasta la última
              gestión registrada.
            </p>

            <form
              method="get"
              action="/seguimientos"
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <select
                id="personaId"
                name="personaId"
                defaultValue={selectedPersonaId ?? ""}
                required
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              >
                <option value="">Selecciona una persona</option>

                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre_completo}
                    {persona.barrio ? ` - ${persona.barrio}` : ""}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Ver historial
              </button>
            </form>
          </section>

          {!selectedPersonaId ? (
            <section className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
              <h2 className="text-lg font-semibold text-stone-900">
                Selecciona una persona
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Después de seleccionar una persona aparecerá aquí todo su
                historial.
              </p>
            </section>
          ) : !personaSeleccionada || !personaPermitida ? (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <h2 className="text-lg font-semibold text-red-900">
                Persona no disponible
              </h2>

              <p className="mt-2 text-sm text-red-700">
                Esta persona no pertenece a tu proceso activo.
              </p>

              <Link
                href="/seguimientos"
                className="mt-5 inline-flex rounded-2xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Volver
              </Link>
            </section>
          ) : (
            <>
              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Historial de persona
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-stone-900">
                      {personaSeleccionada.nombre_completo}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-stone-500">
                      {personaSeleccionada.barrio ? (
                        <span>{personaSeleccionada.barrio}</span>
                      ) : null}

                      {personaSeleccionada.celular ? (
                        <span>· {personaSeleccionada.celular}</span>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    href={`/personas/${personaSeleccionada.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    Ver ficha
                  </Link>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900">
                      Historial del proceso
                    </h2>

                    <p className="mt-1 text-sm text-stone-500">
                      Desde la primera etapa hasta la última gestión.
                    </p>
                  </div>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    {seguimientos.length}{" "}
                    {seguimientos.length === 1
                      ? "gestión"
                      : "gestiones"}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {seguimientos.map((seguimiento, index) => (
                    <div key={seguimiento.id}>
                      <div className="mb-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {getEtapaLabel(seguimiento.paso)}
                        </span>
                      </div>

                      <SeguimientoItemCard
                        seguimiento={seguimiento}
                        index={index}
                        isLast={index === seguimientos.length - 1}
                      />
                    </div>
                  ))}

                  {seguimientos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                      <p className="text-sm font-semibold text-stone-900">
                        No hay seguimientos registrados
                      </p>

                      <p className="mt-1 text-sm text-stone-500">
                        Esta persona todavía no tiene gestiones en su historial.
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">
                  Resumen actual
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Estado
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {personaSeleccionada.estado_consolidacion ||
                        "Sin estado"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Etapa actual
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      Etapa{" "}
                      {personaSeleccionada.etapa_actual ??
                        "No registrada"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Última gestión
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatDate(
                        personaSeleccionada.ultima_gestion_fecha
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Próximo paso
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {personaSeleccionada.proximo_paso || "No definido"}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  )
}