import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
        } catch (err) {
            setError('Не вдалося увійти. Перевірте пошту та пароль.');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-4 glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                    <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <LogIn size={24} />
                    </div>
                    <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
                        Вхід
                    </h2>
                    <p className="mt-1 text-center text-slate-400 text-sm font-medium">
                        Meeting Room Booking App
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm border border-red-500/20 animate-shake relative z-10">
                        {error}
                    </div>
                )}

                <form className="mt-4 space-y-4 relative z-10" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="glass-input w-full px-5 py-3.5 rounded-2xl text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                                Пароль
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="glass-input w-full px-5 py-3.5 rounded-2xl text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
                            type="submit"
                            className="premium-button w-full flex justify-center py-4 px-4 text-white text-base font-bold rounded-2xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 text-xs text-slate-400 relative z-10">
                    Немає акаунту?{' '}
                    <Link
                        to="/register"
                        className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
                    >
                        Зареєструватися
                    </Link>
                </div>
            </div>
        </div>
    );
}
