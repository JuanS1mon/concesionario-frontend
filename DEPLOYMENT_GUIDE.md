# Guía de Despliegue en Railway

## Paso 1: Preparar Repositorios
Ejecuta el script `init_repos.bat` para inicializar los repositorios Git.

## Paso 2: Crear Repositorios en GitHub
1. Ve a GitHub y crea dos repositorios:
   - `concesionario-backend`
   - `concesionario-frontend`

## Paso 3: Subir Código a GitHub
Para cada repositorio, ejecuta:
```bash
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
git push -u origin main
```

## Paso 4: Configurar Base de Datos PostgreSQL

### Agregar PostgreSQL a Railway:
1. Ve a tu proyecto en Railway
2. Haz clic en **"Add Service"** → **"Database"** → **"PostgreSQL"**
3. Elige un nombre (ej: `concesionario-db`)
4. Railway crea automáticamente la base de datos y la variable `DATABASE_URL`

### Ejecutar Migraciones:
Después de que el backend esté desplegado y tenga acceso a la base de datos:

1. Ve al servicio del backend → **"Shell"**
2. Ejecuta: `PYTHONPATH=/app python -m alembic upgrade head`
3. Esto crea todas las tablas necesarias

## Paso 5: Desplegar Servicios y Configurar Variables

### Variables Compartidas (Shared Variables)
Railway permite compartir variables entre servicios para mantener consistencia.

#### Configurar Variables Compartidas:
1. Ve a **Project Settings** → **Shared Variables**
2. Crea variables compartidas que serán usadas por múltiples servicios
3. Comparte estas variables con los servicios que las necesiten

#### Conectar Frontend con Backend:
En el servicio del **frontend**, configura:
- `NEXT_PUBLIC_API_URL`: `${{concesionario-backend.RAILWAY_PUBLIC_DOMAIN}}`

Esto hace que el frontend automáticamente use la URL pública del backend.

### Variables Específicas por Servicio:

### Backend:
- `DATABASE_URL`: **Automática** - Railway la crea cuando agregas PostgreSQL
- `SECRET_KEY`: Genera una clave secreta segura (ej: `openssl rand -hex 32`)
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
- `CLOUDINARY_URL`: Tu URL de Cloudinary

### Frontend:
- `NEXT_PUBLIC_API_URL`: `${{concesionario-backend.RAILWAY_PUBLIC_DOMAIN}}` (variable compartida)

## Paso 6: Verificar Despliegue
1. **Verifica PostgreSQL**: Asegúrate de que la base de datos esté conectada y las migraciones se ejecutaron
2. **Verifica el backend**: Debería conectarse automáticamente a PostgreSQL via `DATABASE_URL`
3. **Verifica el frontend**: Debería automáticamente usar la URL del backend gracias a las variables compartidas
4. **Prueba la aplicación**: Crea un auto, sube imágenes, verifica que todo funcione

## Variables Automáticas de Railway
Railway proporciona automáticamente estas variables:
- `RAILWAY_PUBLIC_DOMAIN`: URL pública de cada servicio
- `RAILWAY_PRIVATE_DOMAIN`: URL privada para comunicación interna
- `PORT`: Puerto en el que debe escuchar la aplicación
- `DATABASE_URL`: URL de conexión a PostgreSQL (cuando hay una base de datos en el proyecto)

¡Tu aplicación estará lista para producción con servicios conectados!