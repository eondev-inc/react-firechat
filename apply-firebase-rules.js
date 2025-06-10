#!/usr/bin/env node

/**
 * Script de utilidad para aplicar las reglas de Firebase
 * Este script ayuda a copiar las reglas al portapapeles para facilitar su aplicación
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Rules Aplicación Automática\n');

// Leer el archivo de reglas
const rulesPath = path.join(__dirname, 'firebase-rules.json');

try {
  const rules = fs.readFileSync(rulesPath, 'utf8');
  
  console.log('📋 Reglas de Firebase cargadas:');
  console.log('===============================');
  console.log(rules);
  console.log('===============================\n');
  
  console.log('📝 PASOS PARA APLICAR LAS REGLAS:');
  console.log('1. Ve a https://console.firebase.google.com');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a Realtime Database > Reglas');
  console.log('4. Copia y pega el contenido mostrado arriba');
  console.log('5. Haz clic en "Publicar"\n');
  
  console.log('✅ ¡Las reglas están listas para aplicar!');
  console.log('⚠️  IMPORTANTE: Sin aplicar estas reglas, tendrás errores de permisos.');
  
} catch (error) {
  console.error('❌ Error al leer las reglas de Firebase:', error.message);
  process.exit(1);
}
