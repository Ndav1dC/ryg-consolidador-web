import { requireAuth } from "@/lib/auth/guards"
import { Topbar } from "@/components/dashboard/topbar"

export default async function DashboardPage() {
  const current = await requireAuth()

  return (
    <main>
      <Topbar
        title="Panel consolidador"
        subtitle={`Acompaña, ora y sigue cada alma. Bienvenido, ${current.profile.nombre}.`}
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">
                Inicio del panel
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Aquí construiremos el dashboard principal con tus accesos rápidos, agenda y resumen del proceso.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-stone-500">Mis personas</p>
                <p className="mt-2 text-3xl font-bold text-stone-900">28</p>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-stone-500">Pendientes hoy</p>
                <p className="mt-2 text-3xl font-bold text-stone-900">3</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-stone-900">
                Usuario actual
              </h3>
              <p className="mt-3 text-sm text-stone-600">
                {current.profile.nombre}
              </p>
              <p className="text-sm text-stone-500">
                Rol: {current.profile.rol}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-stone-900">
                Próximamente
              </h3>
              <p className="mt-3 text-sm text-stone-600">
                Aquí irán seguimientos de hoy, notas recientes y actividad.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}