import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import { LogOut, Layout } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-bottom border-slate-200 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">RoomSync</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm hidden sm:block">
            Привіт, <strong>{user?.displayName || user?.email}</strong>
          </span>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Вийти</span>
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Вітаємо у RoomSync!</h2>
          <p className="text-slate-600">
            Ви успішно авторизувалися. Наступним кроком ми реалізуємо функціонал переговорних кімнат.
          </p>
        </div>
      </main>
    </div>
  );
}

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
