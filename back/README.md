# E-Mind Backend API

[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![Django Version](https://img.shields.io/badge/django-4.2.7-green.svg)](https://djangoproject.com)
[![PostgreSQL](https://img.shields.io/badge/database-postgresql-blue.svg)](https://postgresql.org)
[![API](https://img.shields.io/badge/api-rest-orange.svg)](https://djangorestframework.org)

> **E-Mind** es una plataforma integral para la gestión de servicios de salud mental que conecta psicólogos con pacientes, facilitando la programación de citas, gestión de pagos y seguimiento de sesiones terapéuticas.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Documentación API](#-documentación-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Datos](#-modelos-de-datos)
- [Autenticación y Autorización](#-autenticación-y-autorización)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contribución](#-contribución)

## 🚀 Características

### Funcionalidades Principales

- **Gestión de Usuarios Multi-rol**: Clientes, Psicólogos y Administradores
- **Sistema de Citas**: Programación, confirmación y seguimiento
- **Gestión de Pagos**: Procesamiento y verificación de comprobantes
- **Perfiles Profesionales**: Verificación de credenciales y documentación
- **Sistema de Valoraciones**: Reviews y comentarios de sesiones
- **Notificaciones por Email**: Automatización con plantillas HTML
- **API RESTful**: Endpoints bien documentados y versionados

### Tecnologías Utilizadas

- **Framework**: Django 4.2.7 + Django REST Framework
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (Simple JWT)
- **Email**: Mailgun API
- **Storage**: Sistema de archivos local con soporte para media files
- **CORS**: Configurado para frontend React/Vite

## 🏗 Arquitectura

### Patrón de Diseño

El proyecto sigue una **arquitectura modular** basada en aplicaciones Django bien definidas:

```
backend/
├── authentication/     # Gestión de usuarios y autenticación
├── profiles/          # Perfiles de usuarios (Cliente/Psicólogo/Admin)
├── appointments/      # Sistema de citas médicas
├── payments/          # Procesamiento de pagos
├── schedules/         # Horarios de disponibilidad
├── pricing/           # Gestión de precios y tarifas
├── comments/          # Sistema de valoraciones
└── backend/           # Configuración principal y utilities
```

### Principios Aplicados

- **Separation of Concerns**: Cada app tiene responsabilidades específicas
- **DRY (Don't Repeat Yourself)**: Reutilización de código mediante herencia y mixins
- **SOLID Principles**: Especialmente Single Responsibility y Open/Closed
- **RESTful Design**: APIs consistentes siguiendo convenciones REST

## 🛠 Instalación

### Prerrequisitos

- Python 3.9+
- PostgreSQL 12+
- pip (Python package manager)
- Virtualenv (recomendado)

### Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/your-repo/emind-backend.git
   cd emind-backend/back
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar base de datos**
   ```bash
   # Crear base de datos PostgreSQL
   createdb emind_db
   ```

5. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

6. **Ejecutar migraciones**
   ```bash
   python manage.py migrate
   ```

7. **Crear superusuario**
   ```bash
   python manage.py createsuperuser
   ```

8. **Ejecutar servidor de desarrollo**
   ```bash
   python manage.py runserver
   ```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en el directorio raíz:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=emind_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Email Configuration (Mailgun)
MAILGUN_API_KEY=key-your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
DEFAULT_FROM_EMAIL=no-reply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Configuración de CORS

El proyecto está configurado para trabajar con un frontend React/Vite:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "https://yourdomain.com", # Production
]
```

## 📚 Documentación API

### Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación:

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "user_type": "client"
  }
}
```

### Endpoints Principales

#### Usuarios y Autenticación
```
POST   /api/auth/register/           # Registro de usuarios
POST   /api/auth/login/              # Inicio de sesión
POST   /api/auth/refresh/            # Renovar token
GET    /api/auth/profile/            # Perfil del usuario actual
```

#### Perfiles
```
GET    /api/profiles/client-profiles/me/         # Perfil del cliente
PATCH  /api/profiles/client-profiles/me/         # Actualizar perfil cliente
GET    /api/profiles/psychologist-profiles/me/   # Perfil del psicólogo
PATCH  /api/profiles/psychologist-profiles/me/   # Actualizar perfil psicólogo
```

#### Citas
```
GET    /api/appointments/                        # Listar citas
POST   /api/appointments/create/                 # Crear cita
GET    /api/appointments/available-slots/        # Horarios disponibles
POST   /api/appointments/{id}/upload-payment/    # Subir comprobante
```

#### Horarios
```
GET    /api/schedules/psychologist-schedule/     # Obtener horarios
PATCH  /api/schedules/psychologist-schedule/update/ # Actualizar horarios
```

### Códigos de Respuesta

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error en los datos enviados
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos suficientes
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## 📁 Estructura del Proyecto

```
back/
├── authentication/
│   ├── models.py          # Modelo User personalizado
│   ├── serializers.py     # Serializers para auth
│   ├── views.py           # ViewSets de autenticación
│   ├── permissions.py     # Permisos personalizados
│   └── urls.py            # Rutas de autenticación
├── profiles/
│   ├── models.py          # Perfiles de usuarios
│   ├── serializers.py     # Serializers de perfiles
│   ├── views/             # Views organizadas por funcionalidad
│   │   ├── client_views.py
│   │   ├── psychologist_views.py
│   │   └── admin_views.py
│   ├── permissions.py     # Permisos específicos
│   └── signals.py         # Señales Django
├── appointments/
│   ├── models.py          # Modelo de citas
│   ├── serializers.py     # Serializers de citas
│   ├── views.py           # ViewSet de citas
│   └── urls.py            # Rutas de citas
├── backend/
│   ├── settings.py        # Configuración Django
│   ├── urls.py            # URLs principales
│   ├── email_utils.py     # Utilidades de email
│   └── contact.py         # Formulario de contacto
├── templates/
│   └── emails/            # Plantillas HTML para emails
├── media/                 # Archivos subidos por usuarios
├── static/                # Archivos estáticos
├── requirements.txt       # Dependencias Python
└── manage.py             # Script de gestión Django
```

## 🗄 Modelos de Datos

### Modelo User (Personalizado)

```python
class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('client', 'Cliente'),
        ('psychologist', 'Psicólogo'),
        ('admin', 'Administrador')
    ]
    
    user_type = CharField(max_length=20, choices=USER_TYPE_CHOICES)
    email = EmailField(unique=True)
    phone_number = CharField(max_length=15, blank=True)
    is_email_verified = BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
```

### Relaciones Principales

```mermaid
erDiagram
    User ||--o| ClientProfile : has
    User ||--o| PsychologistProfile : has
    User ||--o| AdminProfile : has
    
    PsychologistProfile ||--o{ Schedule : has
    PsychologistProfile ||--o{ Appointment : attends
    ClientProfile ||--o{ Appointment : books
    
    Appointment ||--o| PaymentDetail : has
    Appointment ||--o| Comment : has
    
    PsychologistProfile ||--o{ ProfessionalDocument : uploads
    PsychologistProfile ||--o{ ProfessionalExperience : has
```

### Gestión de Estados

El sistema maneja estados críticos para diferentes entidades:

**Estados de Citas:**
- `PENDING_PAYMENT` - Pendiente de pago
- `PAYMENT_UPLOADED` - Comprobante subido
- `PAYMENT_VERIFIED` - Pago verificado
- `CONFIRMED` - Confirmada
- `COMPLETED` - Completada
- `CANCELLED` - Cancelada
- `NO_SHOW` - No asistió

**Estados de Verificación (Psicólogos):**
- `PENDING` - Pendiente
- `DOCUMENTS_SUBMITTED` - Documentos enviados
- `VERIFICATION_IN_PROGRESS` - En verificación
- `VERIFIED` - Verificado
- `REJECTED` - Rechazado

## 🔐 Autenticación y Autorización

### Sistema de Permisos

El proyecto implementa un sistema de permisos granular:

```python
class IsProfileOwner(BasePermission):
    """Solo el propietario del perfil puede acceder"""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsAdminUser(BasePermission):
    """Solo administradores pueden acceder"""
    def has_permission(self, request, view):
        return request.user.user_type == 'admin'
```

### Decoradores de Permisos

```python
@action(detail=False, permission_classes=[IsAuthenticated, IsPsychologist])
def my_appointments(self, request):
    """Solo psicólogos autenticados pueden ver sus citas"""
    pass
```

### JWT Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'ALGORITHM': 'HS256',
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
python manage.py test

# Ejecutar tests de una app específica
python manage.py test authentication

# Ejecutar con cobertura
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Estructura de Tests

```python
class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'user_type': 'client'
        }
    
    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', self.user_data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue('access' in response.data)
```

### Herramientas de Desarrollo

```bash
# Comprobar configuración de email
python test_email.py

# Probar conexión Mailgun
python test_mailgun.py

# Generar datos de prueba
python manage.py loaddata fixtures/sample_data.json
```

## 🚀 Deployment

### Configuración de Producción

1. **Variables de Entorno de Producción**
   ```env
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   SECRET_KEY=your-production-secret-key
   
   # Database
   DB_HOST=your-db-host
   DB_NAME=emind_production
   DB_USER=emind_user
   DB_PASSWORD=secure-password
   ```

2. **Collectstatic**
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Migraciones en Producción**
   ```bash
   python manage.py migrate --settings=backend.settings.production
   ```

### Docker (Opcional)

```dockerfile
FROM python:3.9

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /media/ {
        alias /path/to/your/media/;
    }
    
    location /static/ {
        alias /path/to/your/static/;
    }
}
```

## 🤝 Contribución

### Estándares de Código

- **PEP 8**: Seguir las convenciones de estilo de Python
- **Type Hints**: Utilizar cuando sea apropiado
- **Docstrings**: Documentar clases y métodos complejos
- **Tests**: Incluir tests para nuevas funcionalidades

### Git Workflow

```bash
# Crear rama feature
git checkout -b feature/nueva-funcionalidad

# Hacer commits descriptivos
git commit -m "feat: agregar endpoint para gestión de horarios"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### Convenciones de Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Actualización de documentación
- `style:` Cambios de formato/estilo
- `refactor:` Refactorización de código
- `test:` Agregar o actualizar tests

## 📞 Soporte

### Contacto

- **Email**: soporte@emindapp.cl
- **Documentación**: [Wiki del Proyecto]
- **Issues**: [GitHub Issues]

### Debugging

```bash
# Logs detallados
python manage.py runserver --verbosity=2

# Shell interactivo
python manage.py shell

# Verificar configuración
python manage.py check
```

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la [Licencia MIT](LICENSE).

---

E-Mind Backend                       
                                                           
Author: Owens López                                     
Email: owenslopez211@gmail.com                          
GitHub: @OwensLopez211                                  
                                                           
"Building the future with the power of IA"  