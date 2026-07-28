"use client"

import { useMemo, useState } from "react"
import { createSeguimientoAction } from "@/app/(dashboard)/seguimientos/nuevo/actions"
import type { PersonaListItem } from "@/lib/data/personas"
import { SubmitButton } from "./submit-button"

type Props = {
  personas: PersonaListItem[]
  selectedPersonaId?: string
}

const pasoOptions = [
  { value: "1", label: "1 - Primera llamada" },
  { value: "2", label: "2 - Asistió nuevamente al culto" },
  { value: "3", label: "3 - Casa de avivamiento" },
  { value: "4", label: "4 - Discipulado" },
  { value: "5", label: "5 - Ministerio" },
]

const pasoMeta: Record<
  string,
  {
    tipo: string
    titulo: string
    descripcion: string
  }
> = {
  "1": {
    tipo: "llamada",
    titulo: "Seguimiento 1",
    descripcion: "Registra la llamada realizada a la persona.",
  },
  "2": {
    tipo: "culto",
    titulo: "Seguimiento 2",
    descripcion: "Confirma si la persona asistió nuevamente al culto.",
  },
  "3": {
    tipo: "casa_avivamiento",
    titulo: "Seguimiento 3",
    descripcion: "Registra si ya fue ubicada en una Casa de Avivamiento.",
  },
  "4": {
    tipo: "discipulado",
    titulo: "Seguimiento 4",
    descripcion: "Registra el nivel de discipulado actual.",
  },
  "5": {
    tipo: "ministerio",
    titulo: "Seguimiento 5",
    descripcion: "Registra si ya está sirviendo y en qué ministerio.",
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
  return (
    <>
      <div>
        <FieldLabel htmlFor="resultado">¿Ya fue ubicada en una Casa de Avivamiento?</FieldLabel>
        <BaseSelect id="resultado" name="resultado" defaultValue="sí" required>
          <option value="sí">Sí</option>
          <option value="no">No</option>
        </BaseSelect>
      </div>

      <div>
        <FieldLabel htmlFor="casa">¿Cuál?</FieldLabel>
        <BaseInput id="casa" name="casa" type="text" placeholder="Ej. Casa 15 - La María" />
      </div>

      <div className="lg:col-span-2">
        <FieldLabel htmlFor="lider">Líder responsable</FieldLabel>
        <BaseInput id="lider" name="lider" type="text" placeholder="Nombre del líder" />
      </div>
    </>
  )
}

function StepFourFields() {
  return (
    <div>
      <FieldLabel htmlFor="nivel_discipulado">Está haciendo discipulado</FieldLabel>
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
        <FieldLabel htmlFor="resultado">¿Está sirviendo?</FieldLabel>
        <BaseSelect id="resultado" name="resultado" defaultValue="sí" required>
          <option value="sí">Sí</option>
          <option value="no">No</option>
        </BaseSelect>
      </div>

      <div>
        <FieldLabel htmlFor="ministerio">¿En qué ministerio?</FieldLabel>
        <BaseInput id="ministerio" name="ministerio" type="text" placeholder="Ej. Alabanza" />
      </div>
    </>
  )
}

function StepSpecificFields({ paso }: { paso: string }) {
  if (paso === "1") return <StepOneFields />
  if (paso === "2") return <StepTwoFields />
  if (paso === "3") return <StepThreeFields />
  if (paso === "4") return <StepFourFields />
  return <StepFiveFields />
}

export function CreateSeguimientoForm({
  personas,
  selectedPersonaId,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [paso, setPaso] = useState("1")

  const meta = useMemo(() => pasoMeta[paso] ?? pasoMeta["1"], [paso])

  return (
    <form action={createSeguimientoAction} className="space-y-6">
      <input type="hidden" name="tipo" value={meta.tipo} />

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-stone-900">{meta.titulo}</p>
          <p className="mt-1 text-sm text-stone-600">{meta.descripcion}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="persona_id" className="mb-2 block text-sm font-medium text-stone-800">
              Persona
            </label>
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
          </div>

          <div>
            <FieldLabel htmlFor="paso">Paso</FieldLabel>
            <BaseSelect
              id="paso"
              name="paso"
              value={paso}
              onChange={(e) => setPaso(e.target.value)}
            >
              {pasoOptions.map((option) => (
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

          <StepSpecificFields paso={paso} />

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