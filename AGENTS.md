# AGENTS.md

Guía para agentes de IA trabajando en React Firechat

## Descripción del Proyecto

**React Firechat** es una aplicación de chat en tiempo real construida con React, Firebase y TailwindCSS. Permite a los usuarios comunicarse a través de un chat público general y chats privados uno a uno con otros usuarios autenticados.

### Características Principales

- **Autenticación**: Integración con Firebase Auth usando Google OAuth
- **Chat en tiempo real**: Mensajería instantánea usando Firebase Realtime Database
- **Chat general público**: Sala de chat accesible para todos los usuarios autenticados
- **Chats privados**: Comunicación directa entre dos usuarios
- **Indicador de "escribiendo"**: Notificación en tiempo real cuando un usuario está escribiendo
- **Gestión de contactos**: Sistema de contactos con restricción a dominios @gmail.com
- **Estado de presencia**: Indicadores de usuario en línea/fuera de línea
- **UI responsiva**: Diseño adaptable a diferentes dispositivos
- **Persistencia de estado**: Uso de sessionStorage para mantener el estado de la sesión

## Arquitectura y Stack Tecnológico

### Frontend
- **React 19.1.0**: Biblioteca principal de UI
- **TypeScript**: Tipado estático para mayor seguridad
- **Vite 6.3.5**: Build tool y dev server ultrarrápido
- **React Router DOM 6.30.1**: Enrutamiento del lado del cliente
- **TailwindCSS 3.4.17**: Framework CSS utility-first
- **React Icons**: Biblioteca de iconos

### Estado y Gestión de Datos
- **Zustand 5.0.5**: Gestión de estado global minimalista
  - `authStore`: Estado de autenticación del usuario
  - `chatStore`: Estado de mensajes, contactos y chats
- **Middleware de persistencia**: sessionStorage para mantener estado entre recargas

### Backend/Servicios
- **Firebase 11.9.0**:
  - **Authentication**: Google OAuth
  - **Realtime Database**: Almacenamiento y sincronización en tiempo real
  - **Cloud Messaging**: Notificaciones push (opcional)

### Estructura de Datos en Firebase

```
/users/{userId}
  - email: string
  - displayName: string
  - photoURL: string
  - isOnline: boolean
  - lastSeen: timestamp

/chats/{chatId}
  /messages/{messageId}
    - senderId: string
    - senderName: string
    - text: string
    - timestamp: serverTimestamp
  /participants/{userId}: true
  /typing/{userId}: timestamp

/contacts/{userId}
  /{contactId}
    - email: string
    - displayName: string
    - photoURL: string
    - addedAt: timestamp
```

## Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables de UI
│   ├── Avatar.tsx            # Avatar de usuario
│   ├── Chat.tsx              # Componente principal de chat
│   ├── ChatLayout.tsx        # Layout con sidebar y área de chat
│   ├── Header.tsx            # Barra de navegación superior
│   ├── LoadingScreen.tsx     # Pantalla de carga
│   ├── Login.tsx             # Pantalla de inicio de sesión
│   ├── Navigation.tsx        # Navegación de la aplicación
│   ├── PersistGate.tsx       # Gate para persistencia de estado
│   ├── ProtectedRoute.tsx    # HOC para rutas protegidas
│   └── Sidebar.tsx           # Barra lateral con lista de chats
│
├── config/           # Configuración de servicios externos
│   └── firebase.ts           # Inicialización y exportación de Firebase
│
├── hooks/            # Custom hooks reutilizables
│   └── useSessionStorageCleanup.ts  # Hook para limpieza de sessionStorage
│
├── pages/            # Páginas/vistas principales
│   ├── About.tsx             # Página de información
│   ├── Contact.tsx           # Página de contacto
│   ├── Home.tsx              # Página de inicio
│   └── Profile.tsx           # Perfil del usuario
│
├── services/         # Lógica de negocio y APIs
│   ├── authService.ts        # Servicios de autenticación
│   └── chatService.ts        # Servicios de chat y mensajería
│
├── store/            # Estado global con Zustand
│   ├── authStore.ts          # Estado de autenticación
│   └── chatStore.ts          # Estado de chat y mensajes
│
├── utils/            # Funciones de utilidad
│   ├── firebaseContactsDebug.ts    # Herramientas de debug
│   └── sessionStoragePersist.ts    # Helpers de persistencia
│
├── App.tsx           # Componente raíz con rutas
└── main.tsx          # Punto de entrada de la aplicación
```

## Patrones y Convenciones

### Nomenclatura
- **Componentes**: PascalCase (`ChatLayout.tsx`, `Avatar.tsx`)
- **Funciones/Servicios**: camelCase (`sendMessage`, `initAuthListener`)
- **Stores**: camelCase con sufijo `Store` (`authStore`, `chatStore`)
- **Tipos/Interfaces**: PascalCase (`Message`, `Contact`, `Chat`)

### Patrones de Diseño Utilizados

1. **HOC (Higher-Order Components)**: `ProtectedRoute` para rutas autenticadas
2. **Custom Hooks**: `useSessionStorageCleanup` para lógica reutilizable
3. **Service Pattern**: Separación de lógica de negocio en `services/`
4. **Store Pattern**: Estado centralizado con Zustand
5. **Layout Components**: `ChatLayout` para estructura consistente

### Gestión de Estado

```typescript
// authStore: Manejo de autenticación
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// chatStore: Manejo de chats y mensajes
interface ChatState {
  contacts: Contact[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  currentChatId: string | null;
  typingUsers: { [chatId: string]: string[] };
  // ... acciones
}
```

### Rutas Principales

- `/` - Landing/Login (redirección a `/chat/general` si está autenticado)
- `/chat/general` - Chat público general
- `/chat/:chatId` - Chat privado específico
- `/profile` - Perfil del usuario
- `/about` - Información de la aplicación
- `/contact` - Página de contacto

## Comandos Importantes

### Desarrollo
```bash
npm run dev          # Inicia servidor de desarrollo (puerto 5173)
npm run build        # Construye para producción
npm run preview      # Preview de la build de producción
npm run lint         # Ejecuta ESLint
```

### Firebase
```bash
npm run firebase-rules   # Aplica reglas de Firebase desde firebase-rules.json
node test-firebase-rules.js  # Verifica reglas de Firebase
```

## Configuración de Variables de Entorno

El proyecto requiere un archivo `.env` en la raíz con las siguientes variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=  # Opcional
```

**Importante**: Todas las variables de entorno deben tener el prefijo `VITE_` para ser accesibles en el cliente.

## Flujos de Trabajo Comunes

### 1. Agregar un Nuevo Componente de Chat

```typescript
// 1. Crear componente en src/components/
// 2. Importar desde App.tsx o ChatLayout.tsx
// 3. Si necesita estado global, usar useAuthStore o useChatStore
// 4. Aplicar estilos con clases de TailwindCSS

import { useChatStore } from '../store/chatStore';

const NewComponent = () => {
  const { messages, currentChatId } = useChatStore();
  // ... lógica del componente
};
```

### 2. Agregar un Nuevo Servicio Firebase

```typescript
// src/services/newService.ts
import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';

export const newFirebaseFunction = async (param: string) => {
  const dataRef = ref(database, `path/${param}`);
  const snapshot = await get(dataRef);
  return snapshot.val();
};
```

### 3. Extender el Store de Zustand

```typescript
// En src/store/chatStore.ts
interface ChatState {
  // ... estado existente
  newProperty: NewType;
  newAction: (param: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // ... estado inicial
      newProperty: defaultValue,
      newAction: (param) => set((state) => ({
        newProperty: /* nueva lógica */
      })),
    }),
    { name: 'chat-storage', storage: createJSONStorage(() => sessionStorage) }
  )
);
```

### 4. Agregar una Nueva Ruta

```typescript
// En src/App.tsx
<Route 
  path="/nueva-ruta" 
  element={
    <ProtectedRoute>  {/* Si requiere autenticación */}
      <NuevoComponente />
    </ProtectedRoute>
  } 
/>
```

## Reglas de Seguridad Firebase

Las reglas de seguridad están definidas en `firebase-rules.json` e incluyen:

- **Validación de dominio**: Solo correos @gmail.com
- **Autenticación requerida**: Todos los accesos requieren auth
- **Índices optimizados**: Para consultas por email, displayName y timestamp
- **Validación de datos**: Estructura de datos validada en escrituras

Para aplicar las reglas:
```bash
npm run firebase-rules
```

## Consideraciones para Agentes de IA

### 1. TypeScript y Tipado
- Todos los archivos `.tsx` y `.ts` usan TypeScript estricto
- Los tipos están definidos cerca de su uso (interfaces en stores y services)
- Siempre tipar props, parámetros de función y retornos

### 2. Firebase Realtime Database
- **Listeners en tiempo real**: Usar `onValue` y siempre limpiar con `off()` en cleanup
- **ServerTimestamp**: Usar `serverTimestamp()` para timestamps consistentes
- **Referencias**: Usar `ref(database, path)` para acceder a nodos
- **Queries**: Los índices están configurados en Firebase, usar `orderByChild`, `equalTo`, etc.

### 3. Estado y Persistencia
- **Zustand**: Los stores NO son componentes React, sino hooks
- **sessionStorage**: Se usa para persistencia de sesión (no localStorage)
- **Cleanup**: Implementar limpieza de listeners en useEffect returns

### 4. Estilos y UI
- **TailwindCSS**: Preferir clases utility sobre CSS custom
- **Responsivo**: Usar breakpoints de Tailwind (`sm:`, `md:`, `lg:`)
- **Tema oscuro**: No implementado actualmente, considerar para futuro
- **Iconos**: Usar `react-icons` (ya instalado)

### 5. Autenticación
- La autenticación está gestionada por Firebase Auth
- El estado se sincroniza con `onAuthStateChanged` en `authService.ts`
- Las rutas protegidas usan el componente `ProtectedRoute`

### 6. Manejo de Errores
- Los servicios lanzan errores que deben ser capturados en componentes
- Usar try-catch en operaciones asíncronas
- Mostrar mensajes de error amigables al usuario

### 7. Testing
- Actualmente no hay tests configurados
- Al agregar tests, considerar:
  - `vitest` para unit tests
  - `@testing-library/react` para component tests
  - Mocks de Firebase en tests

### 8. Performance
- **Lazy loading**: Considerar React.lazy() para rutas
- **Memoización**: Usar React.memo() para componentes costosos
- **Listeners**: Siempre limpiar listeners de Firebase en unmount
- **Optimistic updates**: Considerar para mejor UX

### 9. Restricciones Importantes
- Solo usuarios con correo @gmail.com pueden registrarse (validación en Firebase rules)
- Los chats privados usan IDs determinísticos: `private_${userId1}_${userId2}` (ordenados alfabéticamente)
- El chat "general" es un chat especial con ID fijo
- sessionStorage se limpia automáticamente con `useSessionStorageCleanup`

### 10. Debugging
- Herramientas de debug en `src/utils/firebaseContactsDebug.ts`
- Firebase Emulator Suite recomendado para desarrollo local
- React DevTools para inspeccionar estado de componentes
- Redux DevTools compatible con Zustand (configurar middleware)

## Próximos Pasos y Mejoras Sugeridas

1. **Testing**: Implementar suite de pruebas unitarias e integración
2. **Optimización**: Implementar lazy loading y code splitting
3. **Accesibilidad**: Mejorar ARIA labels y navegación por teclado
4. **PWA**: Convertir en Progressive Web App con service workers
5. **Notificaciones**: Completar integración de Firebase Cloud Messaging
6. **Tema oscuro**: Implementar modo oscuro con TailwindCSS
7. **Imágenes**: Permitir envío de imágenes en chat (Firebase Storage)
8. **Emojis**: Agregar selector de emojis en el input de mensajes
9. **Búsqueda**: Implementar búsqueda de mensajes y contactos
10. **Internacionalización**: Agregar soporte multiidioma (i18n)

## Referencias y Documentación

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de React](https://react.dev)
- [Documentación de Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)
- [Documentación de Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com)

---

**Última actualización**: 15 de enero de 2026
**Versión del proyecto**: 0.0.0
**Mantenedores**: [Tu nombre/equipo]
