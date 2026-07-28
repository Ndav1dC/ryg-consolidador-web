import { Topbar } from "@/components/dashboard/topbar"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { getDashboardStats } from "@/lib/data/dashboard"

export default async function DashboardResumenPage() {
  const stats = await getDashboardStats()

  return (
    <main>
      <Topbar
        title="Vista general"
        subtitle="Resumen del estado actual del proceso de acompañamiento."
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900">
              Resumen del ministerio
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Aquí puedes ver cuántas personas están en proceso, cuántos
              seguimientos se hicieron hoy y cuántas gestiones quedaron
              programadas.
            </p>
          </div>

          <StatsGrid stats={stats} />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">
                Lectura rápida
              </h3>

              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <p>
                  Personas nuevas en proceso:{" "}
                  <span className="font-semibold text-stone-900">
                    {stats.nuevos}
                  </span>
                </p>
                <p>
                  Personas activas actualmente:{" "}
                  <span className="font-semibold text-stone-900">
                    {stats.activos}
                  </span>
                </p>
                <p>
                  Personas pendientes de mover:{" "}
                  <span className="font-semibold text-stone-900">
                    {stats.pendientes}
                  </span>
                </p>
                <p>
                  Personas consolidadas:{" "}
                  <span className="font-semibold text-stone-900">
                    {stats.consolidados}
                  </span>
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">
                Actividad de hoy
              </h3>

              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <p>
                  Seguimientos registrados hoy:{" "}
                  <span className="font-semibold text-stone-900">
                    {stats.seguimientosHoy}
                  </span>
                </p>
                <p>
                  Seguimientos programados para hoy:{" "}
                  <span className="font-semibold text-stone-900">
                    {stats.programados}
                  </span>
                </p>
                <p className="text-stone-500">
                  Este panel te ayuda a revisar carga de trabajo y avance del
                  proceso sin entrar persona por persona.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}