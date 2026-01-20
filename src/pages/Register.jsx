import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Паролі не співпадають');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, name);
        } catch (err) {
            setError('Не вдалося створити акаунт. Можливо, пошта вже зайнята.');
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
                        <UserPlus size={24} />
                    </div>
                    <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
                        Реєстрація
                    </h2>
                    <p className="mt-1 text-center text-slate-400 text-sm font-medium">
                        Створіть свій профіль
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm border border-red-500/20 animate-shake relative z-10">
                        {error}
                    </div>
                )}

                <form className="mt-4 space-y-4 relative z-10" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                                Ім'я
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="glass-input w-full px-5 py-3 rounded-2xl text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="Олександр"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-reg" className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                                Email
                            </label>
                            <input
                                id="email-reg"
                                type="email"
                                required
                                className="glass-input w-full px-5 py-3 rounded-2xl text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-reg" className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                                Пароль
                            </label>
                            <input
                                id="password-reg"
                                type="password"
                                required
                                className="glass-input w-full px-5 py-3 rounded-2xl text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                                Підтвердження пароля
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                required
                                className="glass-input w-full px-5 py-3 rounded-2xl text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
                            type="submit"
                            className="premium-button w-full flex justify-center py-3.5 px-4 text-white text-base font-bold rounded-2xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Реєстрація...' : 'Створити акаунт'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 text-xs text-slate-400 relative z-10">
                    Вже є акаунт?{' '}
                    <Link
                        to="/login"
                        className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
                    >
                        Увійти
                    </Link>
                </div>
            </div>
        </div>
    );
}
