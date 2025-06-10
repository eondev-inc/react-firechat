# Chat App React

Una aplicación de chat en tiempo real construida con React, Vite, TailwindCSS, Zustand y Firebase.

## Características

- 🔐 Autenticación con Google usando Firebase Auth
- 💬 Chat general público
- 🔒 Chats privados entre contactos
- 👀 Indicador de "escribiendo" en tiempo real
- 📱 Diseño completamente responsivo
- 🎨 UI moderna con TailwindCSS
- 🔔 Notificaciones para nuevos usuarios (Firebase Messaging)
- ⚡ Estado global con Zustand
- 👥 Gestión de contactos (solo dominios @gmail.com)
- 🚀 Construido con Vite para desarrollo rápido

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication y selecciona Google como proveedor
4. Crea una Realtime Database
5. Habilita Cloud Messaging (opcional)
6. Copia la configuración de Firebase

### 3. Configurar Variables de Entorno

**Importante**: El proyecto utiliza variables de entorno para la configuración de Firebase.

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` y reemplaza los valores con tu configuración real de Firebase:

```env
VITE_FIREBASE_API_KEY=tu-api-key-real
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

⚠️ **Importante**: 
- Las variables deben tener el prefijo `VITE_` para estar disponibles en Vite
- Nunca subas el archivo `.env` al repositorio (ya está en `.gitignore`)
- Usa `.env.example` como referencia para otros desarrolladores

### 4. Configurar Firebase

**Importante**: Actualmente las variables de entorno están configuradas pero necesitas valores reales de Firebase.

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication y selecciona Google como proveedor
4. Crea una Realtime Database
5. Habilita Cloud Messaging (opcional)
6. Ve a Configuración del proyecto > General > Tus apps
7. Copia los valores de configuración y pégalos en tu archivo `.env`

### 5. Configurar reglas de Firebase Realtime Database

**Importante**: Debes aplicar las reglas de seguridad e índices para que la aplicación funcione correctamente.

1. En Firebase Console, ve a **Realtime Database > Reglas**
2. Copia y pega el contenido del archivo `firebase-rules.json`
3. Haz clic en **"Publicar"**

Las reglas incluyen:
- **Índices para consultas eficientes** (email, displayName, timestamp)
- **Seguridad de acceso** (solo usuarios autenticados)
- **Validación de datos** (estructura y dominios @gmail.com)

Para más detalles, consulta `FIREBASE_RULES_GUIDE.md`.

## Desarrollo

Ejecutar en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Construcción

Construir para producción:

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/        # Componentes React
│   ├── Chat.tsx      # Componente principal de chat
│   ├── ChatLayout.tsx # Layout con sidebar
│   ├── Header.tsx    # Barra de navegación
│   ├── Login.tsx     # Página de login
│   ├── ProtectedRoute.tsx # Rutas protegidas
│   └── Sidebar.tsx   # Barra lateral con contactos
├── config/
│   └── firebase.ts   # Configuración de Firebase
├── pages/
│   └── Profile.tsx   # Página de perfil
├── services/         # Servicios de Firebase
│   ├── authService.ts
│   └── chatService.ts
├── store/           # Estado global con Zustand
│   ├── authStore.ts
│   └── chatStore.ts
└── App.tsx          # Componente principal
```

## Tecnologías Utilizadas

- **React 19** - Framework frontend
- **Vite** - Build tool y servidor de desarrollo
- **TypeScript** - Tipado estático
- **TailwindCSS 3.4** - Framework CSS utilitario
- **React Router DOM** - Enrutamiento SPA
- **Zustand** - Gestión de estado global
- **Firebase** - Backend como servicio
  - Authentication (Google)
  - Realtime Database
  - Cloud Messaging
- **React Icons** - Iconografía

## Funcionalidades Implementadas

### Autenticación
- Login con Google
- Detección automática del estado de autenticación
- Rutas protegidas
- Restricción de contactos a dominios @gmail.com

### Chat
- Chat general público (/chat/general)
- Chats privados entre usuarios (/chat/:uuid)
- Mensajes en tiempo real
- Indicadores de "escribiendo"
- Historial de mensajes

### UI/UX
- Diseño completamente responsivo
- Interfaz moderna con TailwindCSS
- Transiciones y animaciones suaves
- Sidebar colapsible en móviles

### Gestión de Estado
- Estado global con Zustand
- Persistencia de autenticación
- Gestión de contactos y chats activos

## Próximos Pasos

Para completar la configuración:

1. **Configurar Firebase**: Reemplazar los valores placeholder en `src/config/firebase.ts`
2. **Configurar reglas de base de datos**: Establecer reglas de seguridad en Firebase
3. **Probar funcionalidades**: Verificar autenticación, mensajería y contactos
4. **Configurar notificaciones**: Implementar Firebase Cloud Messaging
5. **Optimizar rendimiento**: Implementar lazy loading y optimizaciones

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Autor

Desarrollado con ❤️ usando React y Firebase

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
