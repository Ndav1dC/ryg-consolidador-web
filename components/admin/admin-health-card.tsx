type AdminHealthItem = {
  label: string
  valor: number
  color: "green" | "yellow" | "red" | "gray"
}

type AdminHealthCardProps = {
  items: AdminHealthItem[]
}

const estilosPorColor = {
  green: {
    punto: "bg-emerald-500",
    barra: "bg-emerald-500",
    texto: "text-emerald-700",
  },
  yellow: {
    punto: "bg-amber-500",
    barra: "bg-amber-500",
    texto: "text-amber-700",
  },
  red: {
    punto: "bg-red-500",
    barra: "bg-red-500",
    texto: "text-red-700",
  },
  gray: {
    punto: "bg-stone-400",
    barra: "bg-stone-400",
    texto: "text-stone-600",
  },
}

export function AdminHealthCard({ items }: AdminHealthCardProps) {
  const promedio =
    items.length > 0
      ? Math.round(
          items.reduce((total, item) => total + item.valor, 0) /
            items.length
        )
      : 0

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">
            Salud de la consolidación
          </p>

          <p className="mt-1 text-sm text-stone-500">
            Indicadores generales del proceso.
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50">
          <span className="text-lg font-bold text-stone-900">
            {promedio}%
          </span>

          <span className="text-[9px] font-medium uppercase tracking-wide text-stone-500">
            Salud
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const estilos = estilosPorColor[item.color]
          const valorSeguro = Math.min(Math.max(item.valor, 0), 100)

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${estilos.punto}`}
                  />

                  <span className="truncate text-sm text-stone-700">
                    {item.label}
                  </span>
                </div>

                <span className={`text-sm font-bold ${estilos.texto}`}>
                  {valorSeguro}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${estilos.barra}`}
                  style={{ width: `${valorSeguro}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}