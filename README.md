# BienestarAPP

Una plataforma web que conecta pacientes con psicólogos profesionales, facilitando la búsqueda, programación y gestión de sesiones de terapia en línea.

## Descripción

BienestarAPP es una aplicación web desarrollada con Django (backend) y React (frontend) que permite a los usuarios:

- **Pacientes**: Buscar psicólogos, ver perfiles, agendar citas y gestionar su historial de sesiones.
- **Psicólogos**: Crear perfiles profesionales, gestionar disponibilidad, atender pacientes y administrar citas.
- **Administración**: Supervisión de la plataforma, gestión de usuarios y citas.

## Características Principales

- Registro y autenticación de usuarios (pacientes y psicólogos)
- Perfiles detallados para psicólogos con especialidades, formación y experiencia
- Sistema de búsqueda y filtrado de profesionales
- Gestión de citas y disponibilidad
- Panel de administración para supervisión de la plataforma

## Tecnologías Utilizadas

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT para autenticación

## Resumen de la Estructura del Backend ( Hasta ahora :) )

### ⚙️ Configuración Central

- **Settings**: Configuración del proyecto con PostgreSQL, JWT y apps registradas.
- **URLs**: Enrutamiento principal con endpoints para autenticación y gestión de perfiles.

---

## 🔐 App de Autenticación

- **Modelo de Usuario**: Modelo personalizado con tipos:
  - `client` (paciente)
  - `psychologist` (psicólogo)
  - `admin` (administrador)
  
- **Autenticación**:
  - Basada en JWT (JSON Web Token)
  - Vistas personalizadas para login, registro y renovación de tokens
  
- **Permisos**:
  - Clases de permisos personalizadas para restringir el acceso según el tipo de usuario

- **Registro**:
  - Registro de nuevos usuarios con creación automática de perfil correspondiente

---

## 👤 App de Perfiles

### 📦 Modelos

- `BaseProfile`: Clase abstracta base
- `ClientProfile`: Perfil de pacientes
- `PsychologistProfile`: Perfil de psicólogos con estado de verificación
- `AdminProfile`: Perfil de administradores
- `ProfessionalDocument`: Documentos para verificar psicólogos (título, cédula, video)
- `Schedule`: Modelo de disponibilidad de psicólogos

### 🔍 Vistas

- Módulos separados para:
  - Clientes
  - Psicólogos
  - Administradores
- Flujo de verificación documental (subida, revisión, aprobación/rechazo)
- Endpoints CRUD para gestionar perfiles

### 🔐 Permisos

- Control de acceso detallado por tipo de usuario

---

## 📦 Apps Planeadas

- **Appointments**: Gestión de citas entre pacientes y psicólogos
- **Payments**: Manejo de pagos dentro de la plataforma
- **Settlements**: Liquidaciones financieras para psicólogos (Funcion extra no para etapa Inicial)

---

## ✅ Funcionalidades Clave

1. **Autenticación de Usuarios**
   - Registro, login y renovación de tokens JWT

2. **Gestión de Perfiles**
   - Información detallada por tipo de usuario
   - Edición y consulta de perfil

3. **Verificación de Psicólogos**
   - Subida de documentos: título, cédula, video presentación
   - Revisión por parte del administrador
   - Psicólogos aprobados se listan públicamente

---

## 🚧 En Desarrollo

- Agendamiento de citas
- Pagos en línea
---


### Frontend
- React
- Tailwind CSS
- Framer Motion para animaciones
- React Router para navegación

## Resumen de la Estructura del Frontend

More Soon! :*
