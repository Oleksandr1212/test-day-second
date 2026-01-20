import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ room, onClose }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkConflicts = async (start, end) => {
        const q = query(
            collection(db, 'bookings'),
            where('roomId', '==', room.id),
            where('endTime', '>', start)
        );

        const snapshot = await getDocs(q);
        const conflicts = snapshot.docs.filter(doc => {
            const b = doc.data();
            const bStart = b.startTime.toDate();
            const bEnd = b.endTime.toDate();
            const s = start.toDate();
            const e = end.toDate();

            return (bStart < e) && (bEnd > s);
        });

        return conflicts.length > 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const start = new Date(`${date}T${startTime}`);
            const end = new Date(`${date}T${endTime}`);

            if (end <= start) {
                setError('Час завершення має бути пізніше часу початку');
                setLoading(false);
                return;
            }

            const startTS = Timestamp.fromDate(start);
            const endTS = Timestamp.fromDate(end);

            const hasConflict = await checkConflicts(startTS, endTS);

            if (hasConflict) {
                setError('Цей час уже зайнятий. Будь ласка, оберіть інший проміжок.');
                setLoading(false);
                return;
            }

            await addDoc(collection(db, 'bookings'), {
                roomId: room.id,
                title: title.trim(),
                startTime: startTS,
                endTime: endTS,
                createdBy: user.email.toLowerCase(),
                createdAt: Timestamp.now(),
                participants: [user.email.toLowerCase()]
            });

            onClose();
        } catch (err) {
            console.error('Booking error:', err);
            setError('Помилка при створенні бронювання. Спробуйте ще раз.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Нове бронювання</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-shake">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Тема зустрічі</label>
                        <input
                            required
                            type="text"
                            placeholder="Наприклад: Daily Standup"
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-500" />
                            Дата
                        </label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                <Clock size={16} className="text-indigo-500" />
                                Початок
                            </label>
                            <input
                                required
                                type="time"
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                <Clock size={16} className="text-indigo-500" />
                                Кінець
                            </label>
                            <input
                                required
                                type="time"
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Скасувати
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {loading ? 'Обробка...' : 'Підтвердити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
