# Variables Compartidas en Railway

## ¿Qué son las Variables Compartidas?

Las variables compartidas permiten compartir configuración entre múltiples servicios en el mismo proyecto de Railway, evitando duplicación y manteniendo consistencia.

## Tipos de Variables en Railway

### 1. Service Variables
- Específicas para cada servicio
- Definidas en la pestaña "Variables" de cada servicio

### 2. Shared Variables
- Compartidas entre múltiples servicios
- Definidas en "Project Settings" → "Shared Variables"
- Se referencian con la sintaxis: `${{ shared.VARIABLE_NAME }}`

### 3. Reference Variables
- Para referenciar variables de otros servicios
- Sintaxis: `${{ SERVICE_NAME.VARIABLE_NAME }}`

## Configuración para el Proyecto Concesionario

### Base de Datos PostgreSQL
Railway proporciona automáticamente la variable `DATABASE_URL` cuando agregas una base de datos PostgreSQL al proyecto.

### Conectar Frontend con Backend
En el servicio del **frontend**, configura esta variable:

```
NEXT_PUBLIC_API_URL = ${{concesionario-backend.RAILWAY_PUBLIC_DOMAIN}}
```

Esto hace que el frontend automáticamente use la URL pública del backend.

### Variables Automáticas de Railway

Railway proporciona automáticamente estas variables en cada servicio:

- `RAILWAY_PUBLIC_DOMAIN`: URL pública del servicio (ej: `https://concesionario-backend-production.up.railway.app`)
- `RAILWAY_PRIVATE_DOMAIN`: URL privada para comunicación interna entre servicios
- `PORT`: Puerto en el que debe escuchar la aplicación
- `DATABASE_URL`: URL de conexión a PostgreSQL (cuando hay una base de datos en el proyecto)

## Configuración de PostgreSQL en Railway

### Paso 1: Agregar Base de Datos
1. Ve a tu proyecto en Railway
2. Haz clic en "Add Service" → "Database" → "PostgreSQL"
3. Elige un nombre (ej: `concesionario-db`)
4. Railway crea automáticamente la base de datos

### Paso 2: Conectar al Backend
La variable `DATABASE_URL` se crea automáticamente y está disponible en todos los servicios del proyecto. El backend la usará automáticamente.

### Paso 3: Migraciones de Base de Datos
Ejecuta las migraciones Alembic en el backend:

```bash
# En Railway, ve al servicio del backend → "Shell"
alembic upgrade head
```

O configura un comando de build que ejecute las migraciones automáticamente.

## Pasos para Configurar

1. **Agrega PostgreSQL** al proyecto en Railway
2. **Despliega el backend** - automáticamente tendrá acceso a `DATABASE_URL`
3. **Ejecuta migraciones** para crear las tablas
4. **Configura el frontend** con la variable compartida para la API

## Beneficios

- ✅ **Conexión automática**: El backend siempre tiene la URL correcta de la BD
- ✅ **Sin configuración manual**: No hay que actualizar DATABASE_URL
- ✅ **Consistencia**: Un solo lugar para gestionar URLs de servicios
- ✅ **Escalabilidad**: Fácil agregar más servicios conectados

## Verificación

Una vez configurado:
1. El backend debería conectarse automáticamente a PostgreSQL
2. Las migraciones deberían crear las tablas necesarias
3. El frontend debería poder hacer requests al backend sin problemas de CORS o URLs incorrectas.