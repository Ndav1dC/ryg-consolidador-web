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
    .select("roles")
    .eq("auth_id", user.id)
    .single()

  const cookieStore = await cookies()
  const rolActivo = cookieStore.get("rol_activo")?.value

  const esConsolidadorActivo =
    rolActivo === "consolidador" &&
    usuario?.roles?.includes("consolidador")

  if (usuarioError || !esConsolidadorActivo) {
    redirect("/personas")
  }

  const { data: personas, error: personasError } = await supabase
    .from("personas")
    .select(
      "id, nombre_completo, celular, created_at, ultima_gestion_fecha"
    )
    .eq("numero_invalido", true)
    .order("ultima_gestion_fecha", { ascending: false })

  if (personasError) {
    throw new Error(
      `No se pudieron consultar los números inválidos: ${personasError.message}`
    )
  }

  const numerosInvalidos =
    (personas as PersonaNumeroInvalido[] | null) ?? []

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
            Corrige el celular para reactivar a la persona en la Etapa 1, o
            elimínala definitivamente si fue registrada por error.
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
            No hay números inválidos
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Cuando una llamada se marque como “Número inválido”, aparecerá
            aquí.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="divide-y divide-stone-100">
            {numerosInvalidos.map((persona) => (
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
                        {formatearFecha(persona.ultima_gestion_fecha)}
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
            ))}
          </div>
        </section>
      )}
    </main>
  )
}