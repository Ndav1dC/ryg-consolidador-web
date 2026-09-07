type AdminFunnelItem = {
  etapa: number
  label: string
  cantidad: number
  porcentaje: number
}

type AdminProcessFunnelProps = {
  items: AdminFunnelItem[]
}

const estilosEtapa = [
  {
    barra: "bg-amber-500",
    texto: "text-amber-950",
    fondo: "bg-amber-50",
  },
  {
    barra: "bg-amber-400",
    texto: "text-amber-950",
    fondo: "bg-amber-50",
  },
  {
    barra: "bg-yellow-400",
    texto: "text-yellow-950",
    fondo: "bg-yellow-50",
  },
  {
    barra: "bg-lime-500",
    texto: "text-lime-950",
    fondo: "bg-lime-50",
  },
  {
    barra: "bg-emerald-500",
    texto: "text-emerald-950",
    fondo: "bg-emerald-50",
  },
]

export function AdminProcessFunnel({
  items,
}: AdminProcessFunnelProps) {
  const cantidadMaxima = Math.max(
    ...items.map((item) => item.cantidad),
    1
  )

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">
            Estado del proceso
          </p>

          <p className="mt-1 text-sm text-stone-500">
            Personas distribuidas según la etapa actual.
          </p>
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          5 etapas
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item, index) => {
          const estilo =
            estilosEtapa[index] ?? estilosEtapa[estilosEtapa.length - 1]

          const ancho = Math.max(
            18,
            Math.round((item.cantidad / cantidadMaxima) * 100)
          )

          return (
            <div key={item.etapa}>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${estilo.barra}`}
                  >
                    {item.etapa}
                  </span>

                  <span className="truncate text-sm font-medium text-stone-700">
                    {item.label}
                  </span>
                </div>

                <span className="shrink-0 text-sm font-bold text-stone-900">
                  {item.cantidad}
                </span>
              </div>

              <div
                className={`h-3 overflow-hidden rounded-full ${estilo.fondo}`}
              >
                <div
                  className={`h-full rounded-full transition-all ${estilo.barra}`}
                  style={{ width: `${ancho}%` }}
                />
              </div>

              <p className={`mt-1 text-right text-xs font-medium ${estilo.texto}`}>
                {item.porcentaje}% del total
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}