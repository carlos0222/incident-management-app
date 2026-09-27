# Incident Management App

Aplicación full-stack para gestionar incidencias mediante una interfaz web conectada a una API REST y una base de datos PostgreSQL.

El proyecto permite crear, consultar, editar y eliminar incidencias, además de filtrarlas, buscarlas y consultar un pequeño resumen del estado general.

## Características

- CRUD completo de incidencias.
- Dashboard con número total de incidencias, abiertas y cerradas.
- Buscador por título y descripción.
- Filtros por estado y prioridad.
- Prioridades: baja, media y alta.
- Estados: abierta y cerrada.
- Edición de incidencias desde la interfaz.
- Confirmación antes de eliminar una incidencia.
- Mensajes visuales de éxito y error.
- Indicador de carga mientras se obtienen los datos.
- Persistencia de datos con PostgreSQL.
- Diseño responsive para distintos tamaños de pantalla.

## Tecnologías utilizadas

### Frontend

- React
- JavaScript
- Vite
- CSS

### Backend

- Python
- Flask
- API REST
- Psycopg

### Base de datos

- PostgreSQL

### Herramientas de desarrollo

- Git
- GitHub
- Visual Studio Code
- Postman
- PowerShell
- Python `venv`
- npm

## Arquitectura

```text
React + Vite
     │
     │ HTTP / JSON
     ▼
Flask REST API
     │
     │ Psycopg
     ▼
PostgreSQL
```

El frontend realiza peticiones HTTP a la API Flask mediante `fetch()`. Flask procesa las operaciones y utiliza Psycopg para comunicarse con PostgreSQL.

## Estructura del proyecto

```text
incident-management-app/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── incidents.py
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   └── db.py
│   │
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

> `backend/.env`, `backend/venv/` y `frontend/node_modules/` no deben subirse al repositorio.

## Modelo de datos

La tabla `incidents` contiene los siguientes campos:

```text
id
title
description
priority
status
created_at
```

En la aplicación se utilizan actualmente estas prioridades:

```text
Baja
Media
Alta
```

Y estos estados:

```text
Abierta
Cerrada
```

## API REST

### Comprobar el backend

```http
GET /
```

### Comprobar el estado del servidor

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

### Obtener todas las incidencias

```http
GET /incidents
```

### Obtener una incidencia

```http
GET /incidents/<id>
```

Ejemplo:

```http
GET /incidents/1
```

### Crear una incidencia

```http
POST /incidents
```

Ejemplo de cuerpo JSON:

```json
{
  "title": "Error al iniciar sesión",
  "description": "El usuario no puede acceder a su cuenta",
  "priority": "Alta",
  "status": "Abierta"
}
```

Si no se envía `status`, el backend utiliza `Abierta` por defecto.

### Actualizar una incidencia

```http
PUT /incidents/<id>
```

Ejemplo:

```json
{
  "title": "Error al iniciar sesión",
  "description": "El problema continúa después de reiniciar la contraseña",
  "priority": "Alta",
  "status": "Cerrada"
}
```

### Eliminar una incidencia

```http
DELETE /incidents/<id>
```

## Instalación y ejecución

### Requisitos

Antes de empezar necesitas:

- Python
- Node.js y npm
- PostgreSQL
- Git

## Backend

### 1. Entrar en la carpeta del backend

```powershell
cd backend
```

### 2. Crear el entorno virtual

Solo es necesario la primera vez:

```powershell
python -m venv venv
```

### 3. Activar el entorno virtual

En PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Cuando esté activo aparecerá `(venv)` al principio de la terminal.

### 4. Instalar dependencias

```powershell
pip install -r requirements.txt
```

### 5. Configurar las variables de entorno

Crear el archivo:

```text
backend/.env
```

Ejemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=incidents_db
DB_USER=incidents_user
DB_PASSWORD=tu_contraseña
```

El archivo `.env` contiene información sensible y no debe subirse a GitHub.

### 6. Ejecutar Flask

```powershell
python app.py
```

Por defecto, durante el desarrollo, la API estará disponible en:

```text
http://127.0.0.1:5000
```

## Frontend

Abre una segunda terminal.

### 1. Entrar en la carpeta del frontend

```powershell
cd frontend
```

### 2. Instalar dependencias

Solo es necesario la primera vez o cuando cambien las dependencias:

```powershell
npm install
```

### 3. Ejecutar Vite

```powershell
npm run dev
```

El frontend estará normalmente disponible en:

```text
http://localhost:5173
```

## Flujo de la aplicación

```text
Usuario
  │
  ▼
React
  │
  │ fetch()
  │ HTTP + JSON
  ▼
Flask API
  │
  │ SQL mediante Psycopg
  ▼
PostgreSQL
```

Ejemplo al crear una incidencia:

```text
Formulario React
      │
      ▼
POST /incidents
      │
      ▼
Flask
      │
      ▼
PostgreSQL
      │
      ▼
La incidencia aparece en el dashboard
```

## Funcionalidades del frontend

La interfaz incluye:

- Formulario para crear incidencias.
- Edición de incidencias existentes.
- Eliminación con confirmación previa.
- Búsqueda por título y descripción.
- Filtro por estado.
- Filtro por prioridad.
- Estadísticas de incidencias abiertas, cerradas y totales.
- Badges visuales para prioridad y estado.
- Mensajes de éxito y error.
- Indicador de carga.
- Visualización de la fecha de creación.

## Seguridad y configuración

Las credenciales de PostgreSQL se almacenan mediante variables de entorno.

El repositorio no debe contener:

```text
backend/.env
backend/venv/
frontend/node_modules/
__pycache__/
*.pyc
```

Un `.gitignore` adecuado evita que estos archivos se suban accidentalmente.

## Posibles mejoras futuras

- Autenticación de usuarios.
- Roles y permisos.
- Más estados para las incidencias.
- Asignación de incidencias a usuarios.
- Paginación.
- Tests automáticos del frontend y backend.
- Dockerización de la aplicación.
- CI/CD con GitHub Actions.
- Despliegue público del frontend, backend y PostgreSQL.

## Autor

Proyecto desarrollado como aplicación full-stack de práctica y portfolio.
