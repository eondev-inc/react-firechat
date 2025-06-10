import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Chat from './components/Chat';
import ChatLayout from './components/ChatLayout';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { initAuthListener } from './services/authService';
import './utils/firebaseDebug'; // Import debug utilities

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    
    // Enable debug utilities in development
    if (import.meta.env.DEV) {
      console.log('🐛 Firebase debug utilities available:');
      console.log('   - debugFirebase(): Run complete Firebase test');
      console.log('   - testFirebaseConnection(): Test connection');
      console.log('   - testIndexes(): Test database indexes');
    }
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="h-[calc(100vh-64px)]">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/chat/general" replace /> : 
              <Login />
            } 
          />
          
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          >
            <Route path="general" element={<Chat />} />
            <Route path=":chatId" element={<Chat />} />
          </Route>
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes */}
          <Route 
            path="*" 
            element={
              <Navigate 
                to={isAuthenticated ? "/chat/general" : "/"} 
                replace 
              />
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
