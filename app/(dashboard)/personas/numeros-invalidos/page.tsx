import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { corregirYReactivarNumeroAction } from "./actions"
import { BotonEliminar } from "./boton-eliminar"

type PersonaNumeroInvalido = {
  id: string
  nombre_completo: string
  celular: string
  created_at: string | null
  ultima_gestion_fecha: string | null
}

type SeguimientoInvalido = {
  persona_id: string
  fecha: string | null
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha"

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${fecha}T12:00:00`))
}

export default async function NumerosInvalidosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, roles")
    .eq("auth_id", user.id)
    .single()

  const cookieStore = await cookies()
  const rolActivo = cookieStore.get("rol_activo")?.value

  const esConsolidadorActivo =
    rolActivo === "consolidador" &&
    usuario?.roles?.includes("consolidador")

  if (usuarioError || !usuario || !esConsolidadorActivo) {
    redirect("/personas")
  }

  const { data: seguimientos, error: seguimientosError } = await supabase
    .from("seguimientos")
    .select("persona_id, fecha")
    .eq("consolidador_id", usuario.id)
    .eq("resultado", "numero_invalido")
    .order("fecha", { ascending: false })

  if (seguimientosError) {
    throw new Error(
      `No se pudieron consultar los seguimientos inválidos: ${seguimientosError.message}`
    )
  }

  const seguimientosInvalidos =
    ((seguimientos ?? []) as unknown as SeguimientoInvalido[])

  const personaIds = [
    ...new Set(
      seguimientosInvalidos.map((seguimiento) => seguimiento.persona_id)
    ),
  ]

  let numerosInvalidos: PersonaNumeroInvalido[] = []

  if (personaIds.length > 0) {
    const { data: personas, error: personasError } = await supabase
      .from("personas")
      .select(
        "id, nombre_completo, celular, created_at, ultima_gestion_fecha"
      )
      .in("id", personaIds)
      .eq("numero_invalido", true)

    if (personasError) {
      throw new Error(
        `No se pudieron consultar las personas inválidas: ${personasError.message}`
      )
    }

    numerosInvalidos =
      ((personas ?? []) as unknown as PersonaNumeroInvalido[])
  }

  const fechaInvalidaPorPersona = new Map<string, string | null>()

  for (const seguimiento of seguimientosInvalidos) {
    if (!fechaInvalidaPorPersona.has(seguimiento.persona_id)) {
      fechaInvalidaPorPersona.set(
        seguimiento.persona_id,
        seguimiento.fecha
      )
    }
  }

  numerosInvalidos.sort((a, b) => {
    const fechaA = fechaInvalidaPorPersona.get(a.id) ?? ""
    const fechaB = fechaInvalidaPorPersona.get(b.id) ?? ""

    return fechaB.localeCompare(fechaA)
  })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/personas"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            ← Volver a mis personas
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-stone-900">
            Números inválidos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Aquí aparecen únicamente las personas que tú marcaste con número
            inválido. Corrige el celular para reactivarlas en la Etapa 1, o
            elimínalas si fueron registradas por error.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {numerosInvalidos.length}{" "}
          {numerosInvalidos.length === 1 ? "persona" : "personas"}
        </div>
      </div>

      {numerosInvalidos.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-stone-900">
            No tienes números inválidos
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Las personas que marques como “Número inválido” aparecerán aquí.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="divide-y divide-stone-100">
            {numerosInvalidos.map((persona) => {
              const fechaInvalida =
                fechaInvalidaPorPersona.get(persona.id) ??
                persona.ultima_gestion_fecha

              return (
                <article key={persona.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">
                        {persona.nombre_completo}
                      </h2>

                      <div className="mt-2 flex flex-col gap-1 text-sm text-stone-600">
                        <p>
                          Celular registrado:{" "}
                          <span className="font-medium text-stone-800">
                            {persona.celular || "Sin celular"}
                          </span>
                        </p>

                        <p>
                          Marcado como inválido:{" "}
                          {formatearFecha(fechaInvalida)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                      <form action={corregirYReactivarNumeroAction}>
                        <input
                          type="hidden"
                          name="persona_id"
                          value={persona.id}
                        />

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            name="celular"
                            type="tel"
                            defaultValue={persona.celular || ""}
                            placeholder="Nuevo celular"
                            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 sm:w-48"
                            required
                          />

                          <button
                            type="submit"
                            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                          >
                            Corregir y reactivar
                          </button>
                        </div>
                      </form>

                      <BotonEliminar
                        personaId={persona.id}
                        nombrePersona={persona.nombre_completo}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}