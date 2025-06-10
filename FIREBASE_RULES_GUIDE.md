# Guía para Configurar Reglas de Firebase Realtime Database

## 🔥 Error: Index not defined

Este error ocurre cuando Firebase Realtime Database necesita índices para realizar consultas eficientes sobre campos específicos como `email`.

## 📋 Solución Paso a Paso

### 1. Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"Realtime Database"**
4. Ve a la pestaña **"Reglas"**

### 2. Aplicar las Nuevas Reglas

Copia y pega el contenido del archivo `firebase-rules.json` en el editor de reglas de Firebase:

```json
{
  "rules": {
    "chats": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["type", "lastActivity"],
      "$chatId": {
        "messages": {
          ".indexOn": ["timestamp", "senderId"],
          "$messageId": {
            ".validate": "newData.hasChildren(['text', 'senderId', 'timestamp']) && newData.child('senderId').val() == auth.uid"
          }
        },
        "participants": {
          ".read": "auth != null && (data.child(auth.uid).exists() || root.child('chats').child($chatId).child('type').val() == 'general')",
          ".write": "auth != null && (data.child(auth.uid).exists() || root.child('chats').child($chatId).child('type').val() == 'general')",
          ".indexOn": [".value"]
        },
        "typing": {
          "$userId": {
            ".write": "auth != null && auth.uid == $userId"
          }
        }
      }
    },
    "users": {
      ".read": "auth != null",
      ".indexOn": ["email", "displayName"],
      "$userId": {
        ".write": "auth != null && auth.uid == $userId",
        ".validate": "newData.hasChildren(['uid', 'email', 'displayName']) && newData.child('email').val().matches(/.*@gmail\\.com$/)"
      }
    },
    "contacts": {
      ".read": "auth != null",
      ".indexOn": ["email"],
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        ".indexOn": ["email", "displayName"],
        "$contactId": {
          ".validate": "newData.hasChildren(['uid', 'email', 'displayName']) && newData.child('email').val().matches(/.*@gmail\\.com$/)"
        }
      }
    }
  }
}
```

### 3. Publicar las Reglas

1. Haz clic en **"Publicar"** en Firebase Console
2. Confirma que las reglas se han aplicado correctamente

## 🔍 Índices Agregados

### Para `/users`:
- **email**: Para buscar usuarios por email
- **displayName**: Para buscar usuarios por nombre

### Para `/chats`:
- **type**: Para filtrar chats por tipo (general/private)
- **lastActivity**: Para ordenar chats por actividad reciente

### Para `/chats/$chatId/messages`:
- **timestamp**: Para ordenar mensajes cronológicamente
- **senderId**: Para filtrar mensajes por remitente

### Para `/contacts/$userId`:
- **email**: Para buscar contactos por email
- **displayName**: Para buscar contactos por nombre

## 🚀 Verificación

Después de aplicar las reglas:

1. **Reinicia tu aplicación** (detén y vuelve a ejecutar `npm run dev`)
2. **Prueba la funcionalidad** que generaba el error
3. **Verifica en la consola** que no aparezcan más warnings sobre índices

## ⚠️ Notas Importantes

- Los índices mejoran el rendimiento de las consultas
- Sin índices, Firebase puede rechazar consultas complejas
- Los índices se aplican automáticamente después de publicar las reglas
- No necesitas recrear la base de datos

## 📊 Monitoreo

Para verificar que todo funciona:

1. Ve a **Firebase Console > Realtime Database > Datos**
2. Realiza algunas operaciones en tu app
3. Verifica que los datos se escriben correctamente
4. Chequea que no aparezcan errores en la consola del navegador

## 🔧 Solución de Problemas

### Si el error persiste:

1. **Limpia la caché del navegador**
2. **Verifica que las reglas se aplicaron correctamente**
3. **Comprueba que no hay errores de sintaxis en las reglas**
4. **Revisa la consola de Firebase para errores adicionales**

### Para consultas personalizadas:

Si tu aplicación hace consultas específicas no cubiertas por estos índices, puedes agregar más según sea necesario:

```json
".indexOn": ["campoPersonalizado", "otroCampo"]
```
