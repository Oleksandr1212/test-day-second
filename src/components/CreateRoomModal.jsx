import React, { useState } from 'react';
import { X } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function CreateRoomModal({ onClose }) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const normalizedEmail = user.email.toLowerCase();
            await addDoc(collection(db, 'rooms'), {
                name,
                description,
                createdBy: normalizedEmail,
                createdAt: new Date(),
                members: {
                    [normalizedEmail]: 'Admin'
                }
            });
            onClose();
        } catch (err) {
            alert('Помилка при створенні кімнати');
        }
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full"></div>

                <div className="flex justify-between items-center p-8 border-b border-white/5 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Нова кімната</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/5">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 ml-1 uppercase tracking-widest">Назва кімнати</label>
                            <input
                                required
                                type="text"
                                placeholder="Наприклад: Executive Suite"
                                className="glass-input w-full px-5 py-4 rounded-2xl text-white placeholder-slate-600 transition-all font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 ml-1 uppercase tracking-widest">Опис</label>
                            <textarea
                                placeholder="Наприклад: Простір для стратегічних рішень..."
                                rows="3"
                                className="glass-input w-full px-5 py-4 rounded-2xl text-white placeholder-slate-600 transition-all font-medium resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-4 glass-input rounded-2xl text-slate-300 font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest border-none"
                        >
                            Скасувати
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="premium-button flex-1 py-4 px-4 rounded-2xl font-black text-white transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? 'Створення...' : 'Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
