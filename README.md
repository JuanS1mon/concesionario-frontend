# Concesionario Frontend

Interfaz de usuario para el sistema de concesionario de autos.

## Tecnologías
- Next.js 16
- TypeScript
- Tailwind CSS
- Axios

## Instalación Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
npm run start
```

## Despliegue en Railway

1. Conectar repositorio a Railway
2. Configurar variable de entorno:
   - `NEXT_PUBLIC_API_URL` - URL del backend

## Características

- Dashboard administrativo
- Gestión de marcas y autos
- Subida de imágenes
- Interfaz responsive
- Autenticación JWT

## Estructura del Proyecto

- `app/` - Páginas de Next.js
- `components/` - Componentes reutilizables
- `lib/` - Utilidades y configuraciones
- `types/` - Definiciones TypeScript
