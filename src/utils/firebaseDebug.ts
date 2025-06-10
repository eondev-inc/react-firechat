// src/utils/firebaseDebug.ts
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test basic read access
    const testRef = ref(database, '.info/connected');
    const snapshot = await get(testRef);
    
    if (snapshot.exists()) {
      console.log('✅ Firebase connection successful');
      return true;
    } else {
      console.log('❌ Firebase connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    return false;
  }
};

export const testIndexes = async () => {
  try {
    console.log('📊 Testing Firebase indexes...');
    
    // Test users index by email
    const usersRef = ref(database, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo('test@gmail.com'));
    
    await get(emailQuery);
    console.log('✅ Email index working correctly');
    
    return true;
  } catch (error) {
    if (error.message.includes('index')) {
      console.error('❌ Index error:', error.message);
      console.log('🔧 Please apply the Firebase rules from firebase-rules.json');
    } else {
      console.error('❌ Query error:', error);
    }
    return false;
  }
};

export const debugFirebase = async () => {
  console.log('🐛 Firebase Debug Mode');
  console.log('====================');
  
  const connectionOk = await testFirebaseConnection();
  const indexesOk = await testIndexes();
  
  if (connectionOk && indexesOk) {
    console.log('🎉 Firebase is configured correctly!');
  } else {
    console.log('🔧 Firebase needs configuration:');
    if (!connectionOk) {
      console.log('   - Check Firebase config in .env file');
    }
    if (!indexesOk) {
      console.log('   - Apply rules from firebase-rules.json');
    }
  }
  
  return { connectionOk, indexesOk };
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugFirebase = debugFirebase;
  (window as any).testFirebaseConnection = testFirebaseConnection;
  (window as any).testIndexes = testIndexes;
}
