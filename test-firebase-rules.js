// Script de prueba para verificar reglas de Firebase
// Ejecutar en la consola del navegador después de autenticarse

async function testFirebaseRules() {
  console.log('🔥 Iniciando pruebas de reglas Firebase...');

  try {
    // Test 1: Leer usuarios
    console.log('📋 Test 1: Consultando usuarios...');
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    console.log('✅ Lectura de usuarios exitosa:', snapshot.exists());

    // Test 2: Buscar usuario por email
    console.log('📋 Test 2: Buscando usuario por email...');
    const userQuery = query(usersRef, orderByChild('email'), equalTo('test@gmail.com'));
    const userSnapshot = await get(userQuery);
    console.log('✅ Búsqueda por email exitosa:', userSnapshot.exists());

    // Test 3: Escribir en chats
    console.log('📋 Test 3: Enviando mensaje de prueba...');
    const testChatRef = ref(database, 'chats/test/messages');
    await push(testChatRef, {
      senderId: 'test-user',
      senderName: 'Test User',
      text: 'Mensaje de prueba',
      timestamp: serverTimestamp()
    });
    console.log('✅ Envío de mensaje exitoso');

    // Test 4: Leer mensajes
    console.log('📋 Test 4: Leyendo mensajes...');
    const messagesRef = ref(database, 'chats/test/messages');
    const messagesSnapshot = await get(messagesRef);
    console.log('✅ Lectura de mensajes exitosa:', messagesSnapshot.exists());

    console.log('🎉 Todas las pruebas completadas exitosamente');
    console.log('✅ Las reglas Firebase están funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.log('🔧 Verifica que:');
    console.log('   1. Las reglas estén aplicadas correctamente');
    console.log('   2. El usuario esté autenticado');
    console.log('   3. Los índices estén configurados');
  }
}

// Ejecutar pruebas
// testFirebaseRules();
