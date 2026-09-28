"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MesReporte } from "@/lib/data/reportes-anuales"

type Estado = {
  nombre: string
  cantidad: number
  color: string
}

type Props = {
  meses: MesReporte[]
  estados: Estado[]
  anio: number
}

export function ResumenAdminCharts({
  meses,
  estados,
  anio,
}: Props) {
  const datosMensuales = meses.map((mes) => ({
    ...mes,
    abreviatura: mes.nombre.slice(0, 3),
  }))

  const datosEstados = estados.filter(
    (estado) => estado.cantidad > 0
  )

  const hayActividad = meses.some(
    (mes) =>
      mes.personasRegistradas > 0 ||
      mes.seguimientosRegistrados > 0
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Actividad en {anio}
            </h2>

            <p className="mt-1 text-sm leading-5 text-stone-500">
              Personas registradas y seguimientos por mes.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-amber-700" />
            Personas registradas
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-slate-600" />
            Seguimientos
          </span>
        </div>

        {hayActividad ? (
          <div
            className="mt-5 h-64 w-full sm:h-72"
            role="img"
            aria-label={`Gráfica de actividad mensual de ${anio}`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={datosMensuales}
                margin={{
                  top: 8,
                  right: 0,
                  left: -22,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e7e5e4"
                />

                <XAxis
                  dataKey="abreviatura"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="personasRegistradas"
                  name="Personas registradas"
                  fill="#b45309"
                  radius={[3, 3, 0, 0]}
                />

                <Bar
                  dataKey="seguimientosRegistrados"
                  name="Seguimientos"
                  fill="#475569"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
            No hay actividad registrada en {anio}.
          </p>
        )}
      </section>

      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">
          Estado actual
        </h2>

        <p className="mt-1 text-sm leading-5 text-stone-500">
          Distribución de todas las personas del sistema.
        </p>

        {datosEstados.length > 0 ? (
          <>
            <div
              className="mt-3 h-48 w-full"
              role="img"
              aria-label="Gráfica de pastel de estados actuales"
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={datosEstados}
                    dataKey="cantidad"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={72}
                  >
                    {datosEstados.map((estado) => (
                      <Cell
                        key={estado.nombre}
                        fill={estado.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-2">
              {datosEstados.map((estado) => (
                <li
                  key={estado.nombre}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-stone-700">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{
                        backgroundColor: estado.color,
                      }}
                    />
                    {estado.nombre}
                  </span>

                  <span className="font-semibold tabular-nums text-stone-900">
                    {estado.cantidad}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-6 text-sm text-stone-500">
            Aún no hay personas registradas.
          </p>
        )}

        <p className="mt-4 text-xs leading-5 text-stone-500">
          «Otros estados» incluye estados distintos de nuevo,
          activo y consolidado; no equivale únicamente a
          pendientes.
        </p>
      </section>
    </div>
  )
}