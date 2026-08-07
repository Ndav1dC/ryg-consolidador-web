"use client"

import { useMemo, useState, useEffect } from "react"
import { createSeguimientoAction } from "@/app/(dashboard)/seguimientos/nuevo/actions"
import type { PersonaListItem } from "@/lib/data/personas"
import { SubmitButton } from "./submit-button"

type Props = {
  personas: PersonaListItem[]
  selectedPersonaId?: string
  userRol?: string
  readonly?: boolean
}

// Mapeo de líderes y sus casas
const lideresCasas = {
  "Alcibiades Caballero Paz": "María Occidente",
  "Julián Valencia": "Camilo Torres",
  "Marinela Noguera": "La Pradera",
  "Lucía Maca": "La Sombrilla",
  "Lady Nieves Rojas": "María Occidente",
  "María Lidda Rivera": "Retiro Alto",
  "Oscar Montenegro": "Los Robles Timbío",
  "Liliana Hurtado": "El Berlín",
  "Ximena Piamba": "Las Chozas",
  "Enrique Quira Carrillo": "El Tambo",
}

// Opciones de etapas según el rol
const getEtapaOptions = (rol: string = "") => {
  const opciones = [
    { value: "1", label: "Etapa 1 - Primera llamada" },
    { value: "2", label: "Etapa 2 - Asistió nuevamente al culto" },
    { value: "3", label: "Etapa 3 - Asignar a Casa de Avivamiento" },
    { value: "4", label: "Etapa 4 - Discipulado" },
    { value: "5", label: "Etapa 5 - Ministerio y Consolidación" },
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
    titulo: "Etapa 4",
    descripcion: "Registra el nivel de discipulado actual.",
  },
  "5": {
    tipo: "ministerio",
    titulo: "Etapa 5",
    descripcion: "Registra el ministerio y consolida a la persona.",
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
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-stone-800">
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

function BaseTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
    />
  )
}

function StepOneFields() {
  return (
    <div>
      <FieldLabel htmlFor="resultado">Resultado de la llamada</FieldLabel>
      <BaseSelect id="resultado" name="resultado" defaultValue="contestó" required>
        <option value="contestó">Contestó</option>
        <option value="no_contestó">No contestó</option>
        <option value="se_agendó_visita">Se agendó visita</option>
      </BaseSelect>
    </div>
  )
}

function StepTwoFields() {
  return (
    <div>
      <FieldLabel htmlFor="resultado">¿Asistió nuevamente al culto?</FieldLabel>
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
  
  // Obtener la casa automáticamente cuando se selecciona un líder
  const casaAutomatica = selectedLider ? lideresCasas[selectedLider as keyof typeof lideresCasas] : ""

  return (
    <>
      <div>
        <FieldLabel htmlFor="lider">Selecciona el Líder de Casa</FieldLabel>
        <BaseSelect
          id="lider"
          name="lider"
          value={selectedLider}
          onChange={(e) => setSelectedLider(e.target.value)}
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
        <FieldLabel htmlFor="casa">Casa de Avivamiento</FieldLabel>
        <BaseInput
          id="casa"
          name="casa"
          type="text"
          value={casaAutomatica}
          readOnly
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
          placeholder="Selecciona un líder para ver la casa"
        />
        {/* Campo oculto para asegurar que siempre se envíe el valor */}
        <input
          type="hidden"
          name="casa_hidden"
          value={casaAutomatica}
        />
      </div>

      <div className="lg:col-span-2">
        <FieldLabel htmlFor="resultado">Confirmar asignación</FieldLabel>
        <BaseSelect id="resultado" name="resultado" defaultValue="asignado" required>
          <option value="asignado">Asignado a Casa de Avivamiento</option>
          <option value="pendiente">Pendiente de confirmación</option>
        </BaseSelect>
      </div>
    </>
  )
}

function StepFourFields() {
  return (
    <div>
      <FieldLabel htmlFor="nivel_discipulado">Nivel de Discipulado</FieldLabel>
      <BaseSelect id="nivel_discipulado" name="nivel_discipulado" defaultValue="Nivel 1" required>
        <option value="Nivel 1">Nivel 1</option>
        <option value="Nivel 2">Nivel 2</option>
        <option value="Nivel 3">Nivel 3</option>
      </BaseSelect>
    </div>
  )
}

function StepFiveFields() {
  return (
    <>
      <div>
        <FieldLabel htmlFor="resultado">¿Está sirviendo en ministerio?</FieldLabel>
        <BaseSelect id="resultado" name="resultado" defaultValue="sí" required>
          <option value="sí">Sí</option>
          <option value="no">No</option>
        </BaseSelect>
      </div>

      <div>
        <FieldLabel htmlFor="ministerio">Ministerio</FieldLabel>
        <BaseInput id="ministerio" name="ministerio" type="text" placeholder="Ej. Alabanza, Intercesión, etc." />
      </div>

      <div className="lg:col-span-2">
        <FieldLabel htmlFor="estado">Estado de consolidación</FieldLabel>
        <BaseSelect id="estado" name="estado" defaultValue="consolidado" required>
          <option value="consolidado">Consolidado</option>
          <option value="pendiente">En proceso</option>
        </BaseSelect>
      </div>
    </>
  )
}

function StepSpecificFields({ etapa }: { etapa: string }) {
  if (etapa === "1") return <StepOneFields />
  if (etapa === "2") return <StepTwoFields />
  if (etapa === "3") return <StepThreeFields />
  if (etapa === "4") return <StepFourFields />
  return <StepFiveFields />
}

export function CreateSeguimientoForm({
  personas,
  selectedPersonaId,
  userRol = "",
  readonly = false,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)
  
  const etapasDisponibles = getEtapaOptions(userRol)
  const primeraEtapa = etapasDisponibles.length > 0 ? etapasDisponibles[0].value : "1"
  
  const [etapa, setEtapa] = useState(primeraEtapa)

  useEffect(() => {
    const disponibles = getEtapaOptions(userRol)
    if (disponibles.length > 0) {
      const primera = disponibles[0].value
      const etapaActualDisponible = disponibles.some(opt => opt.value === etapa)
      if (!etapaActualDisponible) {
        setEtapa(primera)
      }
    }
  }, [userRol, etapa])

  const etapaOptions = getEtapaOptions(userRol)
  const meta = useMemo(() => etapaMeta[etapa] ?? etapaMeta[primeraEtapa], [etapa, primeraEtapa])

  if (personas.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
        No hay personas disponibles para hacer seguimiento.
        {userRol === "lider_casa" && (
          <p className="mt-2 text-xs text-stone-400">
            Espera a que un consolidador te asigne personas.
          </p>
        )}
      </div>
    )
  }

  const getRolLabel = (rol: string) => {
    if (rol === 'consolidador') return 'Consolidador (Etapas 1-3)'
    if (rol === 'lider_casa') return 'Líder Casa (Etapas 4-5)'
    if (rol === 'admin') return 'Administrador'
    return rol
  }

  return (
    <form action={createSeguimientoAction} className="space-y-6">
      <input type="hidden" name="tipo" value={meta.tipo} />

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-stone-900">{meta.titulo}</p>
          <p className="mt-1 text-sm text-stone-600">{meta.descripcion}</p>
          <p className="mt-1 text-xs text-amber-700">
            Rol: {getRolLabel(userRol)}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="persona_id" className="mb-2 block text-sm font-medium text-stone-800">
              Persona
            </label>
            
            {readonly && selectedPersonaId ? (
              <>
                <div className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  {personas.find(p => p.id === selectedPersonaId)?.nombre_completo || "Persona seleccionada"}
                  <input
                    type="hidden"
                    name="persona_id"
                    value={selectedPersonaId}
                  />
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  * Esta persona está preseleccionada
                </p>
              </>
            ) : (
              <select
                id="persona_id"
                name="persona_id"
                defaultValue={selectedPersonaId ?? ""}
                required
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
              >
                <option value="">Selecciona una persona</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre_completo}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="etapa">Etapa</FieldLabel>
            <BaseSelect
              id="etapa"
              name="paso"
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
            >
              {etapaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </BaseSelect>
          </div>

          <div>
            <FieldLabel htmlFor="fecha">Fecha</FieldLabel>
            <BaseInput id="fecha" name="fecha" type="date" defaultValue={today} required />
          </div>

          <StepSpecificFields etapa={etapa} />

          <div className="lg:col-span-2">
            <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
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
          href={selectedPersonaId ? `/personas/${selectedPersonaId}` : "/personas"}
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