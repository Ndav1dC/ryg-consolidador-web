# R&G · Consolidador Web

Aplicación web para gestionar el acompañamiento de personas en el proceso de consolidación de Reino y Gloria. Reúne asignaciones, seguimiento por etapas, discipulado, Casas de Avivamiento y reportes administrativos en una interfaz adaptable a escritorio y móvil.

> **Acceso:** sistema de uso interno. Los datos de personas requieren una cuenta autorizada; no publiques exportaciones ni credenciales de Supabase en el repositorio.

## Funcionalidades

- **Gestión de personas:** registros nuevos, asignación de responsables, consulta de detalles, estados y trazabilidad de seguimientos.
- **Seguimiento por etapas:** primera llamada, confirmación de regreso al culto, asignación a Casa de Avivamiento, discipulado y cierre del proceso.
- **Visitas y números inválidos:** programación y confirmación de visitas, revisión de teléfonos marcados como inválidos, corrección y reactivación.
- **Discipulado:** Nivel 1 y Nivel 2; al completar ambos se habilita la Etapa 5.
- **Casas de Avivamiento:** relación entre persona, casa y líder responsable.
- **Administración:** vistas de personas, equipo, casas y seguimientos; indicadores y gráficas del proceso.
- **Reportes anuales:** datos mensuales, resumen por año desde 2026 y exportación de cifras agregadas a PDF.

## Roles y flujo

| Rol | Responsabilidad principal |
| --- | --- |
| Consolidador | Atiende las etapas 1 a 3: llamada, asistencia y asignación a una Casa de Avivamiento. |
| Líder de Casa | Registra el discipulado de dos niveles y la Etapa 5. |
| Administrador | Supervisa personas, responsables, casas, actividad y reportes. |

El proceso avanza así:

```text
Persona nueva → Etapa 1: llamada → Etapa 2: asistencia
→ Etapa 3: Casa de Avivamiento → Etapa 4: discipulado (Niveles 1 y 2)
→ Etapa 5: departamento y cierre → Consolidado
```

El cierre de la Etapa 5 puede registrar que la persona sirve en un departamento o que aún no tiene uno; en ambos casos el proceso termina como **consolidado**. La asignación a casa y líder se conserva como relación de la persona. Los textos `casa` y `lider` en un seguimiento corresponden al dato registrado en esa gestión y no tienen que repetirse en cada seguimiento posterior.

## Tecnologías

- Next.js (App Router), React y TypeScript.
- Tailwind CSS para la interfaz.
- Supabase Auth y PostgreSQL para autenticación y datos.
- Vercel para despliegue y Web Analytics.

Las gráficas y la generación de PDF están implementadas en los módulos de reportes del proyecto.

## Requisitos y configuración

Necesitas Node.js y npm, un proyecto de Supabase configurado con las tablas y políticas de acceso requeridas, y credenciales de ese proyecto. Los usuarios y sus roles deben existir en la base de datos; instalar las dependencias no crea por sí solo el esquema de Supabase.

1. Clona el repositorio e instala dependencias:

   ```bash
   git clone https://github.com/Ndav1dC/ryg-consolidador-web.git
   cd ryg-consolidador-web
   npm ci
   ```

2. Crea `.env.local` en la raíz y configura las variables públicas usadas por el cliente de Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publicable
   ```

   Si la configuración de tu entorno utiliza otras variables de servidor, configúralas según `lib/supabase/` y mantenlas exclusivamente del lado del servidor. Nunca subas `.env.local`, contraseñas ni la clave `service_role`.

3. Inicia el entorno local:

   ```bash
   npm run dev
   ```

4. Antes de publicar cambios, comprueba TypeScript y la compilación:

   ```bash
   npx tsc --noEmit
   npm run build
   ```

## Estructura principal

```text
app/
  (auth)/login/                  Inicio de sesión
  (dashboard)/personas/          Listas y detalle de personas
  (dashboard)/seguimientos/      Historial y registro de gestiones
  (dashboard)/admin/             Resumen, equipo, casas y reportes
components/                      Interfaz reutilizable
lib/auth/                         Perfil y controles de acceso
lib/data/                         Consultas de negocio
lib/supabase/                     Clientes y configuración de Supabase
public/                           Recursos estáticos
types/                            Tipos compartidos
```

Las carpetas entre paréntesis son grupos de rutas de Next.js y no forman parte de la URL. Algunas rutas importantes son `/login`, `/personas`, `/personas/nuevos`, `/personas/numeros-invalidos`, `/seguimientos/nuevo`, `/admin` y `/admin/reportes`.

## Datos y seguridad

Las tablas principales son `personas`, `usuarios`, `casas_avivamiento`, `seguimientos`, `discipulado` y `notificaciones`. `personas.asignado_a_id` identifica al responsable y `personas.casa_avivamiento_id` identifica la casa; las filas de seguimiento registran las acciones realizadas. Las pantallas y las acciones del servidor aplican reglas por rol; las políticas de Row Level Security (RLS) de Supabase deben complementarlas.

**Importante para nuevos entornos:** la política RLS que permite a consolidadores consultar `casas_avivamiento` al registrar la Etapa 3 fue aplicada manualmente en Supabase. Comprueba que esté presente también en cualquier otra base de datos antes de desplegar allí. El estado de la base de datos y las correcciones puntuales de registros no se transfieren al hacer merge en GitHub.

Los reportes muestran cifras agregadas. Evita incluir datos personales en capturas, repositorios públicos o archivos exportados sin autorización. No uses datos reales para pruebas destructivas.

## Despliegue

Conecta el repositorio a Vercel, establece las variables de entorno de Supabase en la configuración del proyecto y verifica que el entorno de destino tenga el esquema y las políticas RLS necesarios. Después del despliegue, prueba inicio de sesión, cambio de rol, asignación de casa, avance por las cinco etapas, números inválidos y exportación PDF.

## Estado del proyecto

Proyecto de uso interno en evolución. Los cambios en el flujo de negocio y en la base de datos deben probarse con personas de prueba identificadas antes de aplicarlos a registros operativos.
