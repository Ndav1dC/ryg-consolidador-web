"use client"

import { useEffect, useMemo, useState } from "react"
import { createSeguimientoAction } from "@/app/(dashboard)/seguimientos/nuevo/actions"
import type { PersonaListItem } from "@/lib/data/personas"
import { SubmitButton } from "./submit-button"

type VisitaPendiente = {
  id: string
  fecha_programada: string | null
}

type Props = {
  personas: PersonaListItem[]
  selectedPersonaId?: string
  userRol?: string
  readonly?: boolean
  visitaPendiente?: VisitaPendiente | null
  etapaActual?: number
  nivelesDiscipulado?: string[]
}

const lideresCasas = {
  "Alcibiades Caballero Paz": "María Occidente",
  "Julián Valencia": "Camilo Torres",
  "Marinela Noguera": "La Pradera",
  "Lucía Maca": "La Sombrilla",
  "Lady Nieves Rojas": "María Occidente",
  "María Lidda Rivera": "Retiro Alto",
  "Oscar Montenegro": "Los Robles Timbío",
  "Liliana Hurtado": "La Pradera",
  "Ximena Piamba": "Las Chozas",
  "Enrique Quira Carrillo": "El Tambo",
}

function getEtapaOptions(rol: string = "") {
  const opciones = [
    { value: "1", label: "Etapa 1 - Primera llamada" },
    { value: "2", label: "Etapa 2 - Asistió nuevamente al culto" },
    { value: "3", label: "Etapa 3 - Asignar a Casa de Avivamiento" },
    { value: "4", label: "Etapa 4 - Discipulado" },
    { value: "5", label: "Etapa 5 - Ministerio y consolidación" },
  ]

  if (rol === "consolidador") {
    return opciones.slice(0, 3)
  }

  if (rol === "lider_casa") {
    return opciones.slice(3)
  }

  return opciones
}

const etapaMeta: Record<
  string,
  {
    tipo: string
    titulo: string
    descripcion: string
  }
> = {
  "1": {
    tipo: "llamada",
    titulo: "Etapa 1",
    descripcion: "Registra la llamada realizada a la persona.",
  },
  "2": {
    tipo: "culto",
    titulo: "Etapa 2",
    descripcion: "Confirma si la persona asistió nuevamente al culto.",
  },
  "3": {
    tipo: "casa_avivamiento",
    titulo: "Etapa 3",
    descripcion: "Asigna la persona a una Casa de Avivamiento.",
  },
  "4": {
    tipo: "discipulado",
    titulo: "Etapa 4 - Discipulado",
    descripcion: "Registra el siguiente nivel de discipulado.",
  },
  "5": {
    tipo: "ministerio",
    titulo: "Etapa 5 - Ministerio",
    descripcion: "Registra el ministerio y finaliza la consolidación.",
  },
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-stone-800"
    >
      {children}
    </label>
  )
}

function BaseInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
    />
  )
}

function BaseSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
    />
  )
}

function BaseTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
    />
  )
}

function StepOneFields() {
  const [resultado, setResultado] = useState("contestó")
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <div>
        <FieldLabel htmlFor="resultado">
          Resultado de la llamada
        </FieldLabel>

        <BaseSelect
          id="resultado"
          name="resultado"
          value={resultado}
          onChange={(event) => setResultado(event.target.value)}
          required
        >
          <option value="contestó">Contestó</option>
          <option value="no_contestó">No contestó</option>
          <option value="numero_invalido">Número inválido</option>
          <option value="se_agendó_visita">Se agendó visita</option>
        </BaseSelect>
      </div>

      {resultado === "se_agendó_visita" ? (
        <div>
          <FieldLabel htmlFor="fecha_programada">
            Fecha de visita
          </FieldLabel>

          <BaseInput
            id="fecha_programada"
            name="fecha_programada"
            type="date"
            min={today}
            required
          />
        </div>
      ) : null}
    </>
  )
}

function StepTwoFields() {
  return (
    <div>
      <FieldLabel htmlFor="resultado">
        ¿Asistió nuevamente al culto?
      </FieldLabel>

      <BaseSelect id="resultado" name="resultado" defaultValue="sí" required>
        <option value="sí">Sí</option>
        <option value="no">No</option>
      </BaseSelect>
    </div>
  )
}

function StepThreeFields() {
  const [selectedLider, setSelectedLider] = useState("")
  const lideres = Object.keys(lideresCasas)

  const casaAutomatica = selectedLider
    ? lideresCasas[selectedLider as keyof typeof lideresCasas]
    : ""

  return (
    <>
      <div>
        <FieldLabel htmlFor="lider">
          Selecciona el Líder de Casa
        </FieldLabel>

        <BaseSelect
          id="lider"
          name="lider"
          value={selectedLider}
          onChange={(event) => setSelectedLider(event.target.value)}
          required
        >
          <option value="">Selecciona un líder</option>

          {lideres.map((lider) => (
            <option key={lider} value={lider}>
              {lider}
            </option>
          ))}
        </BaseSelect>
      </div>

      <div>
        <FieldLabel htmlFor="casa">
          Casa de Avivamiento
        </FieldLabel>

        <BaseInput
          id="casa"
          name="casa"
          type="text"
          value={casaAutomatica}
          readOnly
          placeholder="Selecciona un líder para ver la casa"
        />

        <input type="hidden" name="casa_hidden" value={casaAutomatica} />
      </div>
    </>
  )
}

function StepFourFields({
  nivelSiguiente,
  nivelesCompletados,
}: {
  nivelSiguiente: string
  nivelesCompletados: string[]
}) {
  return (
    <div className="lg:col-span-2">
      <FieldLabel htmlFor="nivel_discipulado">
        Nivel de discipulado
      </FieldLabel>

      <div className="mb-3 flex flex-wrap gap-2">
        {["Nivel 1", "Nivel 2", "Nivel 3"].map((nivel) => {
          const completado = nivelesCompletados.includes(nivel)

          return (
            <span
              key={nivel}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                completado
                  ? "bg-emerald-100 text-emerald-700"
                  : nivel === nivelSiguiente
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-500"
              }`}
            >
              {completado ? "✓ " : ""}
              {nivel}
            </span>
          )
        })}
      </div>

      <BaseSelect
        id="nivel_discipulado"
        name="nivel_discipulado"
        value={nivelSiguiente}
        disabled
        required
      >
        <option value={nivelSiguiente}>{nivelSiguiente}</option>
      </BaseSelect>

      <input
        type="hidden"
        name="nivel_discipulado"
        value={nivelSiguiente}
      />

      <p className="mt-2 text-xs text-stone-500">
        Los niveles se registran en orden. Al completar el Nivel 3 se
        habilitará la Etapa 5: Ministerio.
      </p>
    </div>
  )
}

function StepFiveFields() {
  return (
    <>
      <div>
        <FieldLabel htmlFor="resultado">
          ¿Está sirviendo en ministerio?
        </FieldLabel>

        <BaseSelect id="resultado" name="resultado" defaultValue="sí" required>
          <option value="sí">Sí</option>
          <option value="no">No</option>
        </BaseSelect>
      </div>

      <div>
        <FieldLabel htmlFor="ministerio">Ministerio</FieldLabel>

        <BaseInput
          id="ministerio"
          name="ministerio"
          type="text"
          placeholder="Ej. Alabanza, Intercesión, etc."
          required
        />
      </div>

      <div className="lg:col-span-2">
        <FieldLabel htmlFor="estado">
          Estado de consolidación
        </FieldLabel>

        <BaseSelect
          id="estado"
          name="estado"
          defaultValue="consolidado"
          required
        >
          <option value="consolidado">Consolidado</option>
          <option value="pendiente">En proceso</option>
        </BaseSelect>
      </div>
    </>
  )
}

function StepSpecificFields({
  etapa,
  nivelSiguiente,
  nivelesCompletados,
}: {
  etapa: string
  nivelSiguiente: string
  nivelesCompletados: string[]
}) {
  if (etapa === "1") return <StepOneFields />
  if (etapa === "2") return <StepTwoFields />
  if (etapa === "3") return <StepThreeFields />

  if (etapa === "4") {
    return (
      <StepFourFields
        nivelSiguiente={nivelSiguiente}
        nivelesCompletados={nivelesCompletados}
      />
    )
  }

  return <StepFiveFields />
}

function formatDate(date: string | null) {
  if (!date) return "sin fecha"

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`))
}

export function CreateSeguimientoForm({
  personas,
  selectedPersonaId,
  userRol = "",
  readonly = false,
  visitaPendiente = null,
  etapaActual,
  nivelesDiscipulado = [],
}: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const etapasDisponibles = getEtapaOptions(userRol)
  const etapaOptions = etapasDisponibles

  const primeraEtapa =
    etapasDisponibles.length > 0 ? etapasDisponibles[0].value : "1"

  const etapaInicial = String(etapaActual ?? Number(primeraEtapa))

  const [etapa, setEtapa] = useState(etapaInicial)

  const etapaBloqueada = Boolean(selectedPersonaId && etapaActual)

  const nivelesCompletados = Array.from(
    new Set(
      nivelesDiscipulado
        .map((nivel) => nivel.trim())
        .filter(
          (nivel): nivel is "Nivel 1" | "Nivel 2" | "Nivel 3" =>
            nivel === "Nivel 1" ||
            nivel === "Nivel 2" ||
            nivel === "Nivel 3"
        )
    )
  )

  const nivelSiguiente = !nivelesCompletados.includes("Nivel 1")
    ? "Nivel 1"
    : !nivelesCompletados.includes("Nivel 2")
      ? "Nivel 2"
      : !nivelesCompletados.includes("Nivel 3")
        ? "Nivel 3"
        : "Nivel 3"

  useEffect(() => {
    if (etapaBloqueada) {
      setEtapa(etapaInicial)
      return
    }

    const opcionesDisponibles = getEtapaOptions(userRol)

    if (opcionesDisponibles.length === 0) {
      return
    }

    const etapaDisponible = opcionesDisponibles.some(
      (option) => option.value === etapa
    )

    if (!etapaDisponible) {
      setEtapa(opcionesDisponibles[0].value)
    }
  }, [etapaBloqueada, etapaInicial, etapa, userRol])

  const meta = useMemo(
    () => etapaMeta[etapa] ?? etapaMeta[primeraEtapa],
    [etapa, primeraEtapa]
  )

  function getRolLabel(rol: string) {
    if (rol === "consolidador") return "Consolidador (Etapas 1-3)"
    if (rol === "lider_casa") return "Líder de Casa (Etapas 4-5)"
    if (rol === "admin") return "Administrador"
    return rol
  }

  if (personas.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
        No hay personas disponibles para hacer seguimiento.

        {userRol === "lider_casa" ? (
          <p className="mt-2 text-xs text-stone-400">
            Espera a que un consolidador te asigne personas.
          </p>
        ) : null}
      </div>
    )
  }

  if (visitaPendiente && selectedPersonaId) {
    return (
      <form action={createSeguimientoAction} className="space-y-6">
        <input type="hidden" name="accion" value="confirmar_visita" />
        <input type="hidden" name="persona_id" value={selectedPersonaId} />
        <input type="hidden" name="visita_id" value={visitaPendiente.id} />

        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-stone-900">
              Visita pendiente
            </p>

            <p className="mt-1 text-sm text-stone-600">
              Esta persona tiene una visita programada para{" "}
              {formatDate(visitaPendiente.fecha_programada)}.
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <FieldLabel htmlFor="resultado_visita">
                ¿Se visitó?
              </FieldLabel>

              <BaseSelect
                id="resultado_visita"
                name="resultado_visita"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecciona una respuesta
                </option>
                <option value="sí">Sí, se visitó</option>
                <option value="no">No se visitó</option>
              </BaseSelect>
            </div>

            <div className="lg:col-span-2">
              <FieldLabel htmlFor="observaciones">
                Observaciones
              </FieldLabel>

              <BaseTextarea
                id="observaciones"
                name="observaciones"
                rows={5}
                maxLength={300}
                placeholder="Escribe las observaciones de la visita..."
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <a
            href={`/personas/${selectedPersonaId}`}
            className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-4 py-3 font-medium text-stone-700 hover:bg-stone-100"
          >
            Cancelar
          </a>

          <div className="sm:w-56">
            <SubmitButton label="Guardar visita" />
          </div>
        </div>
      </form>
    )
  }

  return (
    <form action={createSeguimientoAction} className="space-y-6">
      <input type="hidden" name="accion" value="crear_seguimiento" />
      <input type="hidden" name="tipo" value={meta.tipo} />

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-stone-900">
            {meta.titulo}
          </p>

          <p className="mt-1 text-sm text-stone-600">
            {meta.descripcion}
          </p>

          <p className="mt-1 text-xs text-amber-700">
            Rol: {getRolLabel(userRol)}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <FieldLabel htmlFor="persona_id">Persona</FieldLabel>

            {readonly && selectedPersonaId ? (
              <>
                <div className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  {personas.find((person) => person.id === selectedPersonaId)
                    ?.nombre_completo || "Persona seleccionada"}

                  <input
                    type="hidden"
                    name="persona_id"
                    value={selectedPersonaId}
                  />
                </div>

                <p className="mt-1 text-xs text-stone-500">
                  Esta persona está preseleccionada.
                </p>
              </>
            ) : (
              <BaseSelect
                id="persona_id"
                name="persona_id"
                defaultValue={selectedPersonaId ?? ""}
                required
              >
                <option value="">Selecciona una persona</option>

                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre_completo}
                  </option>
                ))}
              </BaseSelect>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="etapa">Etapa</FieldLabel>

            {etapaBloqueada ? (
              <>
                <div className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                  {etapaOptions.find((option) => option.value === etapa)
                    ?.label || `Etapa ${etapa}`}
                </div>

                <input type="hidden" name="paso" value={etapa} />

                <p className="mt-1 text-xs text-stone-500">
                  La etapa se asigna automáticamente según el avance de la
                  persona.
                </p>
              </>
            ) : (
              <BaseSelect
                id="etapa"
                name="paso"
                value={etapa}
                onChange={(event) => setEtapa(event.target.value)}
              >
                {etapaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </BaseSelect>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="fecha">Fecha</FieldLabel>

            <BaseInput
              id="fecha"
              name="fecha"
              type="date"
              defaultValue={today}
              required
            />
          </div>

          <StepSpecificFields
            etapa={etapa}
            nivelSiguiente={nivelSiguiente}
            nivelesCompletados={nivelesCompletados}
          />

          <div className="lg:col-span-2">
            <FieldLabel htmlFor="observaciones">
              Observaciones
            </FieldLabel>

            <BaseTextarea
              id="observaciones"
              name="observaciones"
              rows={5}
              maxLength={300}
              placeholder="Escribe observaciones del seguimiento..."
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <a
          href={
            selectedPersonaId
              ? `/personas/${selectedPersonaId}`
              : "/personas"
          }
          className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-4 py-3 font-medium text-stone-700 hover:bg-stone-100"
        >
          Cancelar
        </a>

        <div className="sm:w-56">
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}