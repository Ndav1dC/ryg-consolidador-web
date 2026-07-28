import type { DashboardStats } from "@/lib/data/dashboard"

type Props = {
  stats: DashboardStats
}

const items = (stats: DashboardStats) => [
  { label: "Total personas", value: stats.totalPersonas },
  { label: "Nuevos", value: stats.nuevos },
  { label: "Activos", value: stats.activos },
  { label: "Pendientes", value: stats.pendientes },
  { label: "Consolidados", value: stats.consolidados },
  { label: "Seguimientos hoy", value: stats.seguimientosHoy },
  { label: "Programados hoy", value: stats.programados },
]

export function StatsGrid({ stats }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items(stats).map((item) => (
        <article
          key={item.label}
          className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-stone-500">{item.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            {item.value}
          </p>
        </article>
      ))}
    </div>
  )
}