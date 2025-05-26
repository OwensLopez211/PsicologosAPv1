# E-mind Frontend

> Plataforma de psicoterapia online que conecta pacientes con psicólogos certificados

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC.svg)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.6-764ABC.svg)](https://redux-toolkit.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Guía de Desarrollo](#-guía-de-desarrollo)
- [Patrones y Convenciones](#-patrones-y-convenciones)
- [Manejo de Estado](#-manejo-de-estado)
- [Autenticación y Autorización](#-autenticación-y-autorización)
- [Componentes Principales](#-componentes-principales)
- [Rutas y Navegación](#-rutas-y-navegación)
- [API y Servicios](#-api-y-servicios)
- [Estilos y Tema](#-estilos-y-tema)
- [Testing](#-testing)
- [Performance](#-performance)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Troubleshooting](#-troubleshooting)

## 🎯 Descripción del Proyecto

E-mind es una aplicación web moderna de psicoterapia online que facilita la conexión entre pacientes y psicólogos certificados. La plataforma proporciona una experiencia completa de gestión de citas, sesiones virtuales y administración de perfiles profesionales.

### Objetivos Principales

- **Accesibilidad**: Democratizar el acceso a servicios de salud mental
- **Calidad**: Garantizar atención profesional con psicólogos certificados
- **Facilidad de uso**: Interfaz intuitiva y experiencia de usuario optimizada
- **Seguridad**: Protección de datos sensibles y comunicaciones seguras

## ✨ Características Principales

### Para Pacientes (Clientes)
- ✅ Registro y gestión de perfil personal
- ✅ Búsqueda y filtrado de psicólogos
- ✅ Visualización de perfiles profesionales detallados
- ✅ Sistema de citas y pagos
- ✅ Gestión de sesiones virtuales
- ✅ Sistema de valoraciones y reseñas
- ✅ Dashboard personalizado

### Para Psicólogos
- ✅ Registro y verificación profesional
- ✅ Gestión completa de perfil profesional
- ✅ Configuración de horarios y tarifas
- ✅ Gestión de citas y pagos
- ✅ Herramientas de comunicación con pacientes
- ✅ Dashboard con métricas y estadísticas
- ✅ Gestión de documentos profesionales

### Para Administradores
- ✅ Panel de administración completo
- ✅ Verificación de psicólogos y documentos
- ✅ Gestión de usuarios y permisos
- ✅ Moderación de contenido y reseñas
- ✅ Análisis y reportes del sistema
- ✅ Configuración de plataforma

## 🏗️ Arquitectura

La aplicación sigue una arquitectura modular basada en componentes con separación clara de responsabilidades:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │    Business     │    │      Data       │
│     Layer       │◄──►│     Logic       │◄──►│     Layer       │
│                 │    │     Layer       │    │                 │
│ • Components    │    │ • Services      │    │ • API Client    │
│ • Pages         │    │ • Hooks         │    │ • State Mgmt    │
│ • UI Elements   │    │ • Utils         │    │ • Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Principios Arquitectónicos

1. **Separación de Responsabilidades**: Cada módulo tiene una responsabilidad específica
2. **Reutilización**: Componentes modulares y reutilizables
3. **Mantenibilidad**: Código limpio y bien documentado
4. **Escalabilidad**: Estructura preparada para crecimiento
5. **Performance**: Optimizaciones y lazy loading implementadas

## 🛠️ Tecnologías

### Core
- **React 18.2.0** - Biblioteca principal de UI con Concurrent Features
- **TypeScript 5.3** - Tipado estático y mejor experiencia de desarrollo
- **Vite 6.3** - Build tool ultra-rápido y dev server optimizado
- **React Router 7.4** - Enrutamiento moderno del lado del cliente

### Estado y Datos
- **Redux Toolkit 2.6** - Manejo de estado global simplificado
- **React Redux 9.2** - Bindings oficiales de Redux para React
- **Axios 1.8** - Cliente HTTP con interceptores y TypeScript

### Styling y UI
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Framer Motion 12.5** - Biblioteca de animaciones avanzadas
- **Headless UI 2.2** - Componentes accesibles sin estilos
- **Heroicons 2.2** - Iconografía oficial de Tailwind
- **Phosphor Icons 2.1** - Biblioteca de iconos adicional
- **Lucide React 0.509** - Iconos modernos y personalizables

### Utilities y Experiencia
- **Date-fns 4.1** - Manipulación moderna de fechas
- **JWT Decode 4.0** - Decodificación de tokens JWT
- **React Hot Toast 2.5** - Sistema de notificaciones elegante
- **React Toastify 11.0** - Notificaciones adicionales
- **Lottie React 2.4** - Animaciones Lottie/After Effects

### Mobile y PWA
- **Capacitor 7.2** - Framework para aplicaciones móviles híbridas
- **Vite PWA Plugin** - Soporte para Progressive Web App

### Development Tools
- **ESLint 8.56** - Linting de código con reglas personalizadas
- **TypeScript ESLint 6.15** - Reglas específicas para TypeScript
- **Cross-env 7.0** - Variables de entorno multiplataforma
- **Concurrently 9.1** - Ejecución de scripts paralelos

### Build y Optimización
- **Rollup Plugin Visualizer** - Análisis del bundle
- **Vite Compression Plugin** - Compresión de assets
- **PostCSS 8.4** - Procesamiento de CSS
- **Autoprefixer 10.4** - Prefijos CSS automáticos

## 📁 Estructura del Proyecto

```
src/
├── components/                 # Componentes reutilizables organizados por feature
│   ├── appointments/          # Componentes de gestión de citas
│   ├── auth/                  # Componentes de autenticación
│   ├── common/                # Componentes comunes y reutilizables
│   ├── dashboard/             # Componentes específicos del dashboard
│   ├── patients/              # Componentes de gestión de pacientes
│   ├── profile/               # Componentes de gestión de perfiles
│   ├── public-components/     # Componentes para páginas públicas
│   ├── reviews/               # Sistema de valoraciones y reseñas
│   ├── routing/               # Componentes de enrutamiento
│   ├── shared/                # Componentes compartidos entre features
│   ├── specialist-list/       # Componentes para listado de especialistas
│   ├── specialist-profile/    # Componentes del perfil de especialista
│   ├── toast/                 # Sistema de notificaciones
│   ├── transitions/           # Componentes de animaciones y transiciones
│   ├── ErrorBoundary.tsx      # Boundary para manejo de errores
│   ├── Layout.tsx             # Componente de layout principal
│   ├── LoadingSpinner.tsx     # Spinner de carga
│   ├── PublicRoute.tsx        # Rutas públicas
│   └── TokenRefreshManager.tsx # Gestión de refresh de tokens
├── pages/                     # Páginas de la aplicación
│   ├── admin/                 # Páginas del panel administrativo
│   ├── dashboard/             # Páginas del dashboard por tipo de usuario
│   └── public-pages/          # Páginas públicas (home, login, registro, etc.)
├── config/                    # Configuraciones de la aplicación
├── context/                   # Contextos de React (AuthContext, etc.)
├── hooks/                     # Custom hooks reutilizables
├── services/                  # Servicios y llamadas a APIs
├── types/                     # Definiciones de TypeScript
├── utils/                     # Utilidades y funciones helper
├── App.css                    # Estilos principales de la aplicación
├── App.tsx                    # Componente raíz de la aplicación
├── index.css                  # Estilos globales
├── main.tsx                   # Punto de entrada de la aplicación
└── vite-env.d.ts             # Definiciones de tipos para Vite
```

### Descripción Detallada de la Estructura

#### `/src/components/`
Componentes organizados por funcionalidad específica:

- **`appointments/`** - Gestión completa de citas (creación, listado, filtros, detalles)
- **`auth/`** - Formularios de login, registro, recuperación de contraseña
- **`common/`** - Componentes base reutilizables (botones, inputs, modales)
- **`dashboard/`** - Componentes específicos para dashboards de diferentes usuarios
- **`patients/`** - Gestión de pacientes (listado, filtros, información)
- **`profile/`** - Componentes para gestión de perfiles de usuario
- **`public-components/`** - Componentes para páginas públicas (hero, footer, header)
- **`reviews/`** - Sistema de valoraciones y reseñas
- **`routing/`** - Componentes relacionados con navegación y rutas
- **`shared/`** - Componentes compartidos entre múltiples features
- **`specialist-list/`** - Listado y filtrado de especialistas
- **`specialist-profile/`** - Perfil detallado de especialistas
- **`toast/`** - Sistema de notificaciones y mensajes
- **`transitions/`** - Animaciones y transiciones de páginas

#### Componentes Utilitarios
- **`ErrorBoundary.tsx`** - Manejo centralizado de errores de React
- **`Layout.tsx`** - Layout principal de la aplicación
- **`LoadingSpinner.tsx`** - Componente de loading reutilizable
- **`PublicRoute.tsx`** - Wrapper para rutas públicas
- **`TokenRefreshManager.tsx`** - Gestión automática de refresh de tokens

#### `/src/pages/`
Páginas organizadas por tipo de acceso:

- **`admin/`** - Panel administrativo completo
- **`dashboard/`** - Dashboards específicos por rol de usuario
- **`public-pages/`** - Páginas accesibles sin autenticación

#### Archivos de Configuración
- **`config/`** - Configuraciones de la aplicación y constantes
- **`context/`** - Contextos de React para estado global
- **`hooks/`** - Custom hooks para lógica reutilizable
- **`services/`** - Servicios para comunicación con APIs
- **`types/`** - Definiciones de TypeScript
- **`utils/`** - Funciones utilitarias y helpers

## 🚀 Instalación y Configuración

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git** para control de versiones

### Configuración del Entorno

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/OwensLopez211/PsicologosAPv1
   cd PsicologosAPv1
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

4. **Variables de entorno requeridas**
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_TIMEOUT=30000
   
   # Environment
   VITE_NODE_ENV=development
   
   # Feature Flags
   VITE_USE_MOCKS=false
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_PWA=true
   
   # External Services
   VITE_GOOGLE_MEET_API_KEY=your_api_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_key
   
   # Mobile Development
   VITE_CAPACITOR_ENABLED=false
   
   # Development Tools
   VITE_EXPOSE_SUBDOMAIN=E-mind
   ```

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Para desarrollo móvil o testing remoto**
   ```bash
   npm run expose
   ```

### Configuración de IDE

**VSCode Extensiones Recomendadas:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 📜 Scripts Disponibles

```json
{
  "dev": "vite",                    // Servidor de desarrollo local
  "build": "cross-env NODE_ENV=production tsc -b && vite build", // Build optimizado
  "lint": "eslint .",               // Análisis de código con ESLint
  "preview": "vite preview",        // Preview del build de producción
  "expose:dev": "vite --host",      // Servidor accesible en red local
  "expose:tunnel": "lt --port 5173 --subdomain mentaliza", // Túnel público
  "expose": "concurrently \"npm run expose:dev\" \"npm run expose:tunnel\"" // Exposición completa
}
```

### Scripts de Desarrollo

```bash
# Desarrollo local estándar
npm run dev

# Desarrollo accesible desde otros dispositivos en la red
npm run expose:dev

# Desarrollo con túnel público (para testing remoto)
npm run expose

# Build de producción con optimizaciones
npm run build

# Preview del build de producción
npm run preview

# Análisis de código
npm run lint
```

### Scripts Especializados

**Exposición de Desarrollo:**
- `expose:dev` - Permite acceso desde dispositivos en la misma red (útil para testing móvil)
- `expose:tunnel` - Crea un túnel público usando localtunnel con subdominio personalizado
- `expose` - Combina ambos para desarrollo remoto completo

**Build Optimizado:**
- Utiliza `cross-env` para garantizar compatibilidad multiplataforma
- Ejecuta verificación de tipos TypeScript antes del build
- Optimizaciones de Vite para producción

## 👨‍💻 Guía de Desarrollo

### Flujo de Desarrollo

1. **Crear rama de feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollo siguiendo convenciones**
3. **Testing local**
4. **Commit con mensaje descriptivo**
5. **Push y Pull Request**

### Estructura de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo, espacios en blanco
- `refactor`: Refactoring de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplo de Commits

```bash
feat(auth): implement password reset functionality
fix(dashboard): resolve loading state issue in patient list
docs(readme): update installation instructions
style(components): fix linting issues in ProfileHeader
```

## 📐 Patrones y Convenciones

### Nomenclatura

**Archivos y Carpetas:**
```
PascalCase     → Componentes React (UserProfile.tsx)
camelCase      → Hooks, utils, servicios (useAuth.ts)
kebab-case     → Páginas y rutas (user-profile.tsx)
SCREAMING_CASE → Constantes (API_ENDPOINTS.ts)
```

**Componentes:**
```typescript
// ✅ Correcto
interface UserProfileProps {
  userId: string;
  isEditable?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  isEditable = false 
}) => {
  // Implementación
};

export default UserProfile;
```

**Hooks Personalizados:**
```typescript
// ✅ Correcto
const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lógica del hook
  
  return { user, loading, error, refetch };
};
```

### Estructura de Componentes

```typescript
// 1. Imports externos
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Imports internos
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

// 3. Tipos e interfaces
interface ComponentProps {
  title: string;
  isVisible?: boolean;
}

// 4. Constantes
const ANIMATION_DURATION = 0.3;

// 5. Componente principal
const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  isVisible = true 
}) => {
  // 6. Estados
  const [isLoading, setIsLoading] = useState(false);
  
  // 7. Hooks personalizados
  const { user } = useAuth();
  
  // 8. Effects
  useEffect(() => {
    // Lógica de efecto
  }, []);
  
  // 9. Handlers
  const handleSubmit = () => {
    // Lógica del handler
  };
  
  // 10. Render helpers
  const renderContent = () => {
    // JSX helper
  };
  
  // 11. Render condicional temprano
  if (!isVisible) return null;
  
  // 12. JSX principal
  return (
    <motion.div>
      {/* Contenido */}
    </motion.div>
  );
};

export default MyComponent;
```

### TypeScript Best Practices

**Tipado Estricto:**
```typescript
// ✅ Interfaces bien definidas
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'psychologist' | 'admin';
}

// ✅ Props opcionales claramente marcadas
interface ComponentProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

// ✅ Tipos de retorno explícitos para funciones complejas
const processUserData = (users: User[]): ProcessedUser[] => {
  return users.map(user => ({
    ...user,
    fullName: `${user.first_name} ${user.last_name}`
  }));
};
```

## 🏪 Manejo de Estado

### Redux Toolkit para Estado Global

La aplicación utiliza Redux Toolkit para el manejo de estado global, proporcionando una experiencia de desarrollo moderna y optimizada:

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import appointmentsSlice from './slices/appointmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    appointments: appointmentsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slices de Estado

**Auth Slice:**
```typescript
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
```

### Hooks Tipados para Redux

```typescript
// hooks/redux.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Custom Hooks para Lógica Reutilizable

```typescript
// hooks/useAuth.ts
import { useAppSelector, useAppDispatch } from './redux';
import { logout, setCredentials } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  const setUserCredentials = (credentials: UserCredentials) => {
    dispatch(setCredentials(credentials));
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    logout: handleLogout,
    setCredentials: setUserCredentials,
  };
};
```

## 🔐 Autenticación y Autorización

### Sistema de Autenticación

**JWT Token Management:**
```typescript
// authService.ts
export const login = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login/', {
      email,
      password
    });
    
    const { access, refresh, user } = response.data;
    
    // Guardar tokens
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    
    return { success: true, user, access, refresh };
  } catch (error) {
    return { error: 'INVALID_CREDENTIALS' };
  }
};
```

**Protección de Rutas:**
```typescript
// ProtectedRoute.tsx
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.user_type !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### Interceptores de API

```typescript
// api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireccionar a login
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);
```

## 🧩 Componentes Principales

### Componentes Base (UI)

**Button Component:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-[#2A6877] text-white hover:bg-[#235A67]',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant])}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

### Componentes de Features

**SpecialistCard:**
```typescript
interface SpecialistCardProps {
  specialist: Specialist;
  onSelect?: (specialist: Specialist) => void;
}

const SpecialistCard: React.FC<SpecialistCardProps> = ({ 
  specialist, 
  onSelect 
}) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center mb-4">
        <img
          src={specialist.profile_image}
          alt={specialist.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="ml-4">
          <h3 className="text-lg font-semibold">{specialist.name}</h3>
          <p className="text-gray-600">{specialist.title}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">Especialidades</h4>
        <div className="flex flex-wrap gap-2">
          {specialist.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>
      
      <Button
        onClick={() => onSelect?.(specialist)}
        className="w-full"
      >
        Ver Perfil
      </Button>
    </motion.div>
  );
};
```

## 🗺️ Rutas y Navegación

### Configuración de Rutas

La aplicación utiliza React Router 7.4 con un sistema de rutas anidadas y protección basada en roles:

```typescript
// App.tsx
function App() {
  return (
    <>
      <ToastProvider />
      <Router>
        <AuthProvider>
          <TokenInitializer />
          <TokenRefreshManager />
          <Routes>
            {/* Rutas Públicas con Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/registro" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              <Route path="/especialistas" element={<SpecialistPage />} />
              <Route path="/especialistas/:id" element={<SpecialistProfilePage />} />
              <Route path="/quienes-somos" element={<AboutPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/terminos-y-condiciones" element={<TermsPage />} />
              <Route path="/preguntas-frecuentes" element={<FAQPage />} />
              <Route path="/recuperar-password" element={
                <PublicRoute>
                  <RecuperarPasswordPage />
                </PublicRoute>
              } />
              <Route path="/reset-password/:token" element={
                <PublicRoute>
                  <EstablecerPasswordPage />
                </PublicRoute>
              } />
            </Route>

            {/* Dashboard de Cliente */}
            <Route path="/dashboard/*" element={
              <PrivateRoute allowedRoles={['client']}>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="" element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="appointments" element={<ClientAppointments />} />
              <Route path="reviews" element={<ClientReviewsPage />} />
            </Route>

            {/* Dashboard de Psicólogo */}
            <Route path="/psicologo/dashboard/*" element={
              <PrivateRoute allowedRoles={['psychologist']}>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="" element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="payments" element={<VerificationsPage />} />
              <Route path="patients" element={<UnifiedPatientsPage />} />
              <Route path="reviews" element={<PsychologistReviewsPage />} />
            </Route>

            {/* Dashboard de Administrador */}
            <Route path="/admin/dashboard/*" element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="" element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="pacients" element={<UnifiedPatientsPage />} />
              <Route path="psychologists" element={<PsychologistListPage />} />
              <Route path="psychologists/:id" element={<PsychologistDetailPage />} />
              <Route path="payments" element={<VerificationsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>

            {/* Ruta catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
```

### Arquitectura de Rutas

#### **Layout Público** (`<Layout />`)
Todas las rutas públicas utilizan el mismo layout base que incluye:
- Header de navegación público
- Footer
- Contenido principal responsivo

#### **Dashboard Layout** (`<DashboardLayout />`)
Las rutas protegidas utilizan un layout especializado que incluye:
- Sidebar de navegación por rol
- Header de usuario autenticado
- Breadcrumbs de navegación
- Área de contenido principal

### Protección de Rutas

#### **PublicRoute Component**
```typescript
// components/routing/PublicRoute.tsx
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    // Redireccionar según el tipo de usuario
    switch (user.user_type) {
      case 'client':
        return <Navigate to="/dashboard" replace />;
      case 'psychologist':
        return <Navigate to="/psicologo/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};
```

#### **PrivateRoute Component**
```typescript
// components/routing/PrivateRoute.tsx
interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### Rutas por Tipo de Usuario

#### **Cliente (`/dashboard/*`)**
```typescript
// Rutas disponibles para clientes
{
  '/dashboard': 'Dashboard principal',
  '/dashboard/profile': 'Gestión de perfil',
  '/dashboard/appointments': 'Mis citas',
  '/dashboard/reviews': 'Mis valoraciones'
}
```

#### **Psicólogo (`/psicologo/dashboard/*`)**
```typescript
// Rutas disponibles para psicólogos
{
  '/psicologo/dashboard': 'Dashboard principal',
  '/psicologo/dashboard/profile': 'Gestión de perfil profesional',
  '/psicologo/dashboard/schedule': 'Agenda y citas',
  '/psicologo/dashboard/payments': 'Verificación de pagos',
  '/psicologo/dashboard/patients': 'Gestión de pacientes',
  '/psicologo/dashboard/reviews': 'Valoraciones recibidas'
}
```

#### **Administrador (`/admin/dashboard/*`)**
```typescript
// Rutas disponibles para administradores
{
  '/admin/dashboard': 'Dashboard principal',
  '/admin/dashboard/profile': 'Perfil de administrador',
  '/admin/dashboard/pacients': 'Gestión de pacientes',
  '/admin/dashboard/psychologists': 'Lista de psicólogos',
  '/admin/dashboard/psychologists/:id': 'Detalle de psicólogo',
  '/admin/dashboard/payments': 'Verificación de pagos',
  '/admin/dashboard/reviews': 'Moderación de reseñas'
}
```

### Componentes de Inicialización

#### **TokenInitializer**
```typescript
// Componente para inicializar el token en localStorage
function TokenInitializer() {
  useEffect(() => {
    console.log('Inicializando sincronización de token en App.tsx');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token encontrado en localStorage durante inicialización');
    }
  }, []);

  return null;
}
```

#### **TokenRefreshManager**
- Gestión automática de refresh de tokens JWT
- Renovación silenciosa antes del vencimiento
- Redirección automática en caso de tokens inválidos

### Navegación Programática

```typescript
// Ejemplos de navegación programática
const navigate = useNavigate();

// Navegación simple
navigate('/dashboard');

// Navegación con reemplazo de historial
navigate('/login', { replace: true });

// Navegación con estado
navigate('/especialistas/123', { 
  state: { from: location.pathname } 
});

// Navegación condicional basada en rol
const redirectToDashboard = (userType: string) => {
  switch (userType) {
    case 'client':
      navigate('/dashboard');
      break;
    case 'psychologist':
      navigate('/psicologo/dashboard');
      break;
    case 'admin':
      navigate('/admin/dashboard');
      break;
  }
};
```

## 🌐 API y Servicios

### Cliente HTTP Base

```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Servicios Específicos

```typescript
// PsychologistService.ts
class PsychologistService {
  static async getAllPsychologists(): Promise<Psychologist[]> {
    try {
      const response = await api.get('/psychologists/');
      return response.data.results || response.data;
    } catch (error) {
      throw new Error('Error fetching psychologists');
    }
  }

  static async getPsychologistById(id: number): Promise<Psychologist> {
    try {
      const response = await api.get(`/psychologists/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error fetching psychologist details');
    }
  }

  static async updatePsychologistStatus(
    id: number, 
    status: string
  ): Promise<void> {
    try {
      await api.patch(`/psychologists/${id}/`, { 
        verification_status: status 
      });
    } catch (error) {
      throw new Error('Error updating psychologist status');
    }
  }
}

export default PsychologistService;
```

### Manejo de Errores

```typescript
// errorHandler.ts
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.detail || 
                     error.response.data?.message;
      
      switch (status) {
        case 400:
          return message || 'Datos inválidos';
        case 401:
          return 'No autorizado';
        case 403:
          return 'Acceso denegado';
        case 404:
          return 'Recurso no encontrado';
        case 500:
          return 'Error interno del servidor';
        default:
          return message || 'Error desconocido';
      }
    } else if (error.request) {
      // Network error
      return 'Error de conexión';
    }
  }
  
  return 'Error inesperado';
};
```

## 🎨 Estilos y Tema

### Configuración de Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          500: '#2A6877',
          600: '#235A67',
          700: '#1d4e5a',
        },
        secondary: {
          100: '#B4E4D3',
          200: '#9dd9c7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Sistema de Diseño

**Colores:**
```css
/* Paleta Principal */
--color-primary: #2A6877;      /* Verde azulado principal */
--color-secondary: #B4E4D3;    /* Verde claro secundario */
--color-accent: #235A67;       /* Verde azulado oscuro */

/* Estados */
--color-success: #10B981;      /* Verde éxito */
--color-warning: #F59E0B;      /* Amarillo advertencia */
--color-error: #EF4444;        /* Rojo error */
--color-info: #3B82F6;         /* Azul información */
```

**Tipografía:**
```css
/* Escalas de Fuente */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
```

### Componentes de Estilo

```typescript
// Button variants using clsx
const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  variants: {
    variant: {
      default: 'bg-primary-500 text-white hover:bg-primary-600',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',


╔═══════════════════════════════════════════════════════════╗
║                      E-Mind Backend                       ║
║                                                           ║
║   Author: Owens López                                     ║
║   Email: owenslopez211@gmail.com                          ║
║   GitHub: @OwensLopez211                                  ║
║                                                           ║
║   "Building the future with the power of IA"              ║
╚═══════════════════════════════════════════════════════════╝  