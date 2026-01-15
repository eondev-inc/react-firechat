import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Chat from './components/Chat';
import ChatLayout from './components/ChatLayout';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import PersistGate from './components/PersistGate';
import LoadingScreen from './components/LoadingScreen';
import { useAuthStore } from './store/authStore';
import { initAuthListener } from './services/authService';
import { useSessionStorageCleanup } from './hooks/useSessionStorageCleanup';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ToastContainer';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Hook para limpiar sessionStorage cuando sea necesario
  useSessionStorageCleanup();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <PersistGate loading={<LoadingScreen />}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <main className="pt-16 h-screen">
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
      </PersistGate>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
