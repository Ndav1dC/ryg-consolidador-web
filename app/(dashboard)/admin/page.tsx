import { getAdminDashboardData } from "@/lib/data/admin"
import { AdminStatCard } from "@/components/admin/admin-stat-card"
import { AdminAlerts } from "@/components/admin/admin-alerts"
import { AdminProcessFunnel } from "@/components/admin/admin-process-funnel"
import { AdminHealthCard } from "@/components/admin/admin-health-card"
import { AdminPersonsTable } from "@/components/admin/admin-persons-table"

function obtenerSaludo() {
  const hora = new Date().getHours()

  if (hora < 12) return "Buenos días"
  if (hora < 19) return "Buenas tardes"

  return "Buenas noches"
}

function formatearFechaActual() {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())
}

export default async function AdminPage() {
  const { personas, stats, funnel, alertas, salud } =
    await getAdminDashboardData()

  const saludo = obtenerSaludo()
  const fechaActual = formatearFechaActual()

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">
              Administración
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {saludo}, administrador
            </h1>

            <p className="mt-2 capitalize text-sm text-stone-600">
              {fechaActual}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Resumen general
            </p>

            <p className="mt-1 text-sm font-semibold text-stone-900">
              {stats.total}{" "}
              {stats.total === 1
                ? "persona registrada"
                : "personas registradas"}
            </p>
          </div>
        </header>

        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-stone-900">
              Resumen general
            </h2>

            <p className="mt-1 text-sm text-stone-600">
              Estado actual de las personas en el proceso de consolidación.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              titulo="Personas nuevas"
              valor={stats.nuevas}
              descripcion="Registros nuevos pendientes de asignación."
              color="amber"
            />

            <AdminStatCard
              titulo="Personas activas"
              valor={stats.activas}
              descripcion="Personas avanzando actualmente en el proceso."
              color="green"
            />

            <AdminStatCard
              titulo="Personas pendientes"
              valor={stats.pendientes}
              descripcion="Personas que requieren seguimiento."
              color="red"
            />

            <AdminStatCard
              titulo="Personas consolidadas"
              valor={stats.consolidadas}
              descripcion="Personas que completaron el proceso."
              color="blue"
            />
          </div>
        </section>

        <section className="mt-7 grid gap-5 xl:grid-cols-3">
          <AdminAlerts alertas={alertas} />

          <AdminProcessFunnel items={funnel} />

          <AdminHealthCard items={salud} />
        </section>

        <section className="mt-7">
          <AdminPersonsTable personas={personas} />
        </section>
      </div>
    </main>
  )
}