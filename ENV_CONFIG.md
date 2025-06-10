# Configuración de Variables de Entorno - Chat App React

## Resumen

Este proyecto utiliza variables de entorno para gestionar la configuración de Firebase de manera segura y flexible.

## Archivos de Variables de Entorno

### `.env`
Contiene las variables de entorno reales para desarrollo local. **Este archivo NO debe subirse al repositorio**.

### `.env.example`
Plantilla que muestra qué variables son necesarias. Este archivo SÍ se incluye en el repositorio como referencia.

## Variables Disponibles

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Clave API de Firebase | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación | `mi-app.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | URL de Realtime Database | `https://mi-app-default-rtdb.firebaseio.com/` |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `mi-app-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Cloud Storage | `mi-app.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID del remitente para FCM | `123456789` |
| `VITE_FIREBASE_APP_ID` | ID de la aplicación | `1:123456789:web:abc123` |

### Variables Opcionales

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_FIREBASE_MEASUREMENT_ID` | ID para Analytics | `G-XXXXXXXXXX` |

## Configuración Paso a Paso

### 1. Obtener Configuración de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. En la pestaña **General**, busca la sección **Tus apps**
5. Si no tienes una app web, haz clic en **Agregar app** y selecciona **Web**
6. Copia los valores de configuración

### 2. Configurar Variables Localmente

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores reales
nano .env  # o usa tu editor preferido
```

### 3. Verificar Configuración

El archivo `src/config/firebase.ts` incluye validación automática. Si alguna variable requerida falta, la aplicación mostrará un error claro en la consola.

## Seguridad

### ✅ Buenas Prácticas Implementadas

- Variables de entorno en `.gitignore`
- Prefijo `VITE_` para exposición controlada
- Validación de variables requeridas
- Archivo `.env.example` como documentación

### ⚠️ Consideraciones de Seguridad

- Las variables con prefijo `VITE_` son **públicas** en el cliente
- Firebase API Key es segura para uso público (con reglas de seguridad correctas)
- Nunca pongas secretos de servidor en variables `VITE_`

## Entornos de Desarrollo

### Desarrollo Local
```bash
# Usa .env para desarrollo
npm run dev
```

### Producción
Las variables deben configurarse en tu plataforma de hosting:

#### Vercel
```bash
vercel env add VITE_FIREBASE_API_KEY
```

#### Netlify
```bash
netlify env:set VITE_FIREBASE_API_KEY "tu-valor"
```

#### Railway/Render/etc
Configura las variables en el dashboard de tu plataforma.

## Troubleshooting

### Error: "Missing required environment variable"
- Verifica que todas las variables requeridas estén en tu archivo `.env`
- Asegúrate de que tengan el prefijo `VITE_`
- Reinicia el servidor de desarrollo después de cambiar variables

### Error: "Firebase configuration invalid"
- Verifica que los valores sean correctos
- Comprueba que no haya espacios extra o caracteres especiales
- Confirma que el proyecto Firebase existe y está activo

### Variables no se actualizan
- Reinicia el servidor de desarrollo (`npm run dev`)
- Limpia la caché (`rm -rf node_modules/.vite`)

## Tipos TypeScript

El archivo `src/env.d.ts` define los tipos para las variables de entorno, proporcionando autocompletado y verificación de tipos en el desarrollo.

## Scripts Útiles

```bash
# Verificar que las variables estén cargadas
npm run dev -- --debug

# Build con verificación de variables
npm run build

# Mostrar variables disponibles (sin valores)
env | grep VITE_
```
