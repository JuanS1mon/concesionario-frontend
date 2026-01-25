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

### Conectar Frontend con Backend

En el servicio del **frontend**, configura esta variable:

```
NEXT_PUBLIC_API_URL = ${{concesionario-backend.RAILWAY_PUBLIC_DOMAIN}}
```

Esto hace que el frontend automáticamente use la URL pública del backend, sin necesidad de actualizar manualmente cuando cambie.

### Variables Automáticas de Railway

Railway proporciona automáticamente estas variables en cada servicio:

- `RAILWAY_PUBLIC_DOMAIN`: URL pública del servicio (ej: `https://concesionario-backend-production.up.railway.app`)
- `RAILWAY_PRIVATE_DOMAIN`: URL privada para comunicación interna entre servicios
- `PORT`: Puerto en el que debe escuchar la aplicación

## Pasos para Configurar

1. **Despliega ambos servicios** (backend y frontend) en Railway
2. **Ve al servicio del frontend** → **Variables**
3. **Agrega la variable**:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `${{concesionario-backend.RAILWAY_PUBLIC_DOMAIN}}`
4. **Guarda y redeployea** el frontend

## Beneficios

- ✅ **Conexión automática**: El frontend siempre apunta al backend correcto
- ✅ **Sin configuración manual**: No hay que actualizar URLs cuando cambian
- ✅ **Consistencia**: Un solo lugar para gestionar URLs de servicios
- ✅ **Escalabilidad**: Fácil agregar más servicios conectados

## Verificación

Una vez configurado, el frontend debería poder hacer requests al backend sin problemas de CORS o URLs incorrectas.