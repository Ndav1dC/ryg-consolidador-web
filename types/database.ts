export type RolUsuario = "admin" | "consolidador"

export type Usuario = {
  id: string
  auth_id: string
  nombre: string
  rol: RolUsuario
  created_at: string
}

export type Persona = {
  id: string
  nombre_completo: string
  celular: string | null
  edad: number | null
  barrio: string | null
  fecha_nacimiento: string | null
  como_conocio: string | null
  invitado_por: string | null
  acepto_jesus: boolean | null
  peticion_oracion: string | null
  autorizacion_datos: boolean
  created_at: string
  estado_consolidacion: string | null
  etapa_actual: number | null
  ultima_gestion_fecha: string | null
  proximo_paso: string | null
}

export type Seguimiento = {
  id: string
  persona_id: string
  consolidador_id: string | null
  fecha: string
  tipo: string | null
  resultado: string | null
  observaciones: string | null
  paso: number | null
  casa: string | null
  lider: string | null
  ministerio: string | null
  nivel_discipulado: string | null
  estado: string | null
  fecha_programada: string | null
}

export type PersonaNota = {
  id: string
  persona_id: string
  nota: string
  created_at: string
}

export type Discipulado = {
  id: string
  persona_id: string
  nivel_actual: number | null
  fecha_inicio: string | null
  fecha_completado: string | null
}

export type CasaAvivamiento = {
  id: string
  nombre: string
  lider_responsable_id: string | null
}

export type Casita = {
  id: string
  nombre: string
  direccion: string | null
  lider_nombre: string | null
  activa: boolean
  created_at: string
}