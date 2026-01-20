import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ room, onClose, booking = null }) {
    const { user } = useAuth();

    const [title, setTitle] = useState(booking ? booking.title : '');
    const [date, setDate] = useState(
        booking
            ? (booking.startTime.toDate ? booking.startTime.toDate() : new Date(booking.startTime)).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    const formatTimeForInput = (timestamp) => {
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toTimeString().slice(0, 5);
    };

    const [startTime, setStartTime] = useState(booking ? formatTimeForInput(booking.startTime) : '09:00');
    const [endTime, setEndTime] = useState(booking ? formatTimeForInput(booking.endTime) : '10:00');
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
            if (booking && doc.id === booking.id) return false;

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

            if (start < new Date()) {
                setError('Не можна бронювати час у минулому');
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

            if (booking) {
                await updateDoc(doc(db, 'bookings', booking.id), {
                    title: title.trim(),
                    startTime: startTS,
                    endTime: endTS,
                    updatedAt: Timestamp.now()
                });
            } else {
                await addDoc(collection(db, 'bookings'), {
                    roomId: room.id,
                    title: title.trim(),
                    startTime: startTS,
                    endTime: endTS,
                    createdBy: user.email.toLowerCase(),
                    createdAt: Timestamp.now(),
                    participants: [user.email.toLowerCase()]
                });
            }

            onClose();
        } catch (err) {
            console.error('Booking error:', err);
            setError(booking ? 'Помилка при оновленні бронювання.' : 'Помилка при створенні бронювання.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full"></div>

                <div className="flex justify-between items-center p-8 border-b border-white/5 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
                        {booking ? 'Редагувати' : 'Нова зустріч'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/5">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest border border-red-500/20 animate-shake">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-white mb-2 ml-1 uppercase tracking-[0.2em]">Тема зустрічі</label>
                        <input
                            required
                            type="text"
                            placeholder="Наприклад: Executive Sync"
                            className="glass-input w-full px-5 py-4 rounded-2xl text-white placeholder-slate-600 transition-all font-medium"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-white mb-2 ml-1 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar size={14} className="text-white" />
                            Дата
                        </label>
                        <input
                            required
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="glass-input w-full px-5 py-4 rounded-2xl text-white transition-all font-medium cursor-pointer hover:bg-white/5 active:bg-white/10"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-white mb-2 ml-1 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock size={14} className="text-white" />
                                Початок
                            </label>
                            <input
                                required
                                type="time"
                                className="glass-input w-full px-5 py-4 rounded-2xl text-white transition-all font-medium cursor-pointer hover:bg-white/5 active:bg-white/10"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-white mb-2 ml-1 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock size={14} className="text-white" />
                                Кінець
                            </label>
                            <input
                                required
                                type="time"
                                className="glass-input w-full px-5 py-4 rounded-2xl text-white transition-all font-medium cursor-pointer hover:bg-white/5 active:bg-white/10"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-4 glass-input rounded-2xl text-slate-300 font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest border-none"
                        >
                            Скасувати
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="premium-button flex-1 py-4 px-4 rounded-2xl font-black text-white transition-all text-xs uppercase tracking-widest"
                        >
                            {loading ? 'Processing...' : (booking ? 'Зберегти' : 'Забронювати')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
