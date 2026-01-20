import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (user) {
    return <Dashboard />;
  }

  return showLogin ? (
    <Login onSwitch={() => setShowLogin(false)} />
  ) : (
    <Register onSwitch={() => setShowLogin(true)} />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
