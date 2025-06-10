# 📘 GitHub Copilot Instructions

## Objetivo
Desarrollar una aplicación **React** utilizando el stack **React + Vite + React Router + TailwindCSS + Flowbite React**, con **Firebase** como backend (autenticación, base de datos en tiempo real, notificaciones) y **Zustand** para el manejo de estado global.

---

## 📌 Requisitos funcionales

1. **Pantalla de Inicio / Login**:
   - Al acceder a `/`, el usuario verá una **pantalla de login inspirada en un diseño basado en imagen proporcionada**.
   - El login debe incluir autenticación con **Google Sign-In** a través de Firebase Authentication.

2. **Post Login: Interfaz de Chat**:
   - Después del login, redirigir al usuario a una interfaz tipo chat.
   - Implementar:
     - Un **canal general** de chat compartido.
     - Un **listado de contactos** para iniciar chats privados.
     - Ruta general de chat: `/chat/general`
     - Ruta privada: `/chat/{uuid}`

3. **Estado de Escritura**:
   - Mostrar si otros usuarios están escribiendo en tiempo real utilizando Firebase Realtime Database o Firestore + eventos.

4. **Layout Adaptativo (Mobile + Desktop)**:
   - Usar TailwindCSS y Flowbite React para construir un diseño **responsivo** y visualmente atractivo.
   - Componentes clave: `Header`, `Sidebar`, `ChatWindow`, `UserList`.

5. **Header Inteligente**:
   - Mostrar botón de login o logout dependiendo del estado del usuario.
   - Mostrar rutas condicionalmente si el usuario está autenticado.

6. **Ruta de Perfil `/profile`**:
   - Mostrar información básica del usuario autenticado (nombre, email, avatar de Google, etc.).

7. **Gestión de Contactos**:
   - Permitir agregar un contacto por correo electrónico.
   - **Validar que sea un correo @gmail.com**.
   - Si el contacto aún no ha iniciado sesión, **enviar notificación push o alert vía Firebase Messaging**.

---

## 🧠 Estado Global

- Usar **Zustand** para:
  - Estado del usuario autenticado.
  - Lista de contactos.
  - Estado del chat actual.
  - Estado de escritura (typing).

---

## 🔐 Firebase

- Firebase Authentication (con Google).
- Firestore o Realtime Database para chats y contactos.
- Firebase Cloud Messaging para notificaciones push a usuarios inactivos.

---

## 🛠️ Rutas esperadas

- `/` → Login
- `/chat/general` → Chat general
- `/chat/:uuid` → Chat privado
- `/profile` → Perfil del usuario

---

> Sugerencia: comienza generando el login con Google usando Firebase y diseñando el layout base con Tailwind/Flowbite antes de continuar con el chat y la lógica de mensajes.
