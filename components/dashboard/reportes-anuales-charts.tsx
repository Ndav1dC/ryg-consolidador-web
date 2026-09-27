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

type EstadoGrafica = {
  label: string
  cantidad: number
}

type Props = {
  meses: MesReporte[]
  estados: EstadoGrafica[]
}

const coloresEstados: Record<string, string> = {
  Nuevo: "#a78bfa",
  Activo: "#60a5fa",
  Pendiente: "#fbbf24",
  Consolidado: "#34d399",
  "Sin estado": "#a8a29e",
}

const coloresBarras = {
  personas: "#b45309",
  seguimientos: "#475569",
}

export function ReportesAnualesCharts({
  meses,
  estados,
}: Props) {
  const datosMensuales = meses.map((mes) => ({
    ...mes,
    abreviatura: mes.nombre.slice(0, 3),
  }))

  const datosPastel = estados.filter(
    (estado) => estado.cantidad > 0
  )

  const hayActividad = meses.some(
    (mes) =>
      mes.personasRegistradas > 0 ||
      mes.seguimientosRegistrados > 0
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          Evolución mensual
        </h2>

        <p className="mt-1 text-sm leading-5 text-stone-500">
          Registros de personas y gestiones, de enero a diciembre.
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600">
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor: coloresBarras.personas,
              }}
            />
            Personas registradas
          </span>

          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor: coloresBarras.seguimientos,
              }}
            />
            Seguimientos registrados
          </span>
        </div>

        {hayActividad ? (
          <div
            className="mt-5 h-72 w-full sm:h-80"
            role="img"
            aria-label="Gráfica mensual de personas y seguimientos registrados"
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={datosMensuales}
                margin={{
                  top: 8,
                  right: 4,
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
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="personasRegistradas"
                  name="Personas registradas"
                  fill={coloresBarras.personas}
                  radius={[3, 3, 0, 0]}
                />

                <Bar
                  dataKey="seguimientosRegistrados"
                  name="Seguimientos registrados"
                  fill={coloresBarras.seguimientos}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-8 rounded-xl bg-stone-50 p-5 text-sm text-stone-600">
            No hay actividad registrada para este año.
          </p>
        )}
      </section>

      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          Estado de las personas
        </h2>

        <p className="mt-1 text-sm leading-5 text-stone-500">
          Estado actual de quienes se registraron en el año
          seleccionado; no representa cambios históricos por mes.
        </p>

        {datosPastel.length > 0 ? (
          <>
            <div
              className="mt-4 h-56 w-full"
              role="img"
              aria-label="Gráfica de pastel del estado actual de las personas"
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={datosPastel}
                    dataKey="cantidad"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={82}
                  >
                    {datosPastel.map((estado) => (
                      <Cell
                        key={estado.label}
                        fill={
                          coloresEstados[estado.label] ??
                          "#78716c"
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="mt-2 space-y-2">
              {datosPastel.map((estado) => (
                <li
                  key={estado.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-stone-700">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{
                        backgroundColor:
                          coloresEstados[estado.label] ??
                          "#78716c",
                      }}
                    />
                    {estado.label}
                  </span>

                  <span className="font-semibold tabular-nums text-stone-900">
                    {estado.cantidad}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-8 rounded-xl bg-stone-50 p-5 text-sm text-stone-600">
            No hay personas registradas en este año.
          </p>
        )}
      </section>
    </div>
  )
}