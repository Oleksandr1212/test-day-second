import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Clock, Users, Plus, Shield, Trash2, Edit } from 'lucide-react';
import BookingModal from '../components/BookingModal';

export default function RoomDetails() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [editBooking, setEditBooking] = useState(null);

    useEffect(() => {
        if (!roomId) return;

        const unsubscribeRoom = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
            if (doc.exists()) {
                setRoom({ id: doc.id, ...doc.data() });
            } else {
                navigate('/');
            }
            setLoading(false);
        });

        const q = query(
            collection(db, 'bookings'),
            where('roomId', '==', roomId),
            orderBy('startTime', 'asc')
        );

        const unsubscribeBookings = onSnapshot(q, (snapshot) => {
            const bookingsData = [];
            snapshot.forEach((doc) => {
                bookingsData.push({ id: doc.id, ...doc.data() });
            });
            setBookings(bookingsData);
        });

        return () => {
            unsubscribeRoom();
            unsubscribeBookings();
        };
    }, [roomId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]"></div>
            </div>
        );
    }

    const normalizedUserEmail = user?.email?.toLowerCase();
    const isAdmin = room?.createdBy?.toLowerCase() === normalizedUserEmail ||
        room?.members?.[user?.email] === 'Admin' ||
        room?.members?.[normalizedUserEmail] === 'Admin';

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    };

    const deleteBooking = async (bookingId) => {
        if (window.confirm('Ви впевнені, що хочете видалити це бронювання?')) {
            try {
                await deleteDoc(doc(db, 'bookings', bookingId));
            } catch (err) {
                alert('Помилка при видаленні бронювання');
            }
        }
    };

    return (
        <div className="min-h-screen text-slate-100 flex flex-col">
            <nav className="glass-card border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 z-40 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest text-xs group"
                    >
                        <div className="bg-white/5 p-2 rounded-lg group-hover:bg-indigo-600 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        Назад
                    </button>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase italic">{room?.name}</h1>
                    <div className="w-20"></div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-8 w-full relative">
                <div className="absolute top-20 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full -z-10"></div>

                <div className="glass-card rounded-[3rem] p-10 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic line-clamp-1">{room?.name}</h2>
                                <p className="text-slate-400 text-lg font-medium italic max-w-2xl">{room?.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-white bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 shadow-inner">
                                    <Users size={16} className="text-white" />
                                    <span>{Object.keys(room?.members || {}).length} учасників</span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-white bg-indigo-500/40 px-5 py-2.5 rounded-2xl border border-indigo-500/50 shadow-lg shadow-indigo-500/20">
                                        <Shield size={16} className="text-white" />
                                        <span>Адміністратор</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsBookingModalOpen(true)}
                            className="premium-button flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl"
                        >
                            <Plus size={22} />
                            Забронювати
                        </button>
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                <Calendar size={22} className="text-white" />
                            </div>
                            Розклад зустрічей
                        </h2>
                        <div className="h-[1px] flex-grow mx-8 bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="glass-card rounded-[2.5rem] p-20 text-center border-dashed border-white/10">
                            <div className="bg-slate-800/50 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                                <Clock size={36} className="text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-bold italic tracking-wide uppercase text-sm">Сьогодні поки що вільно</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="glass-card p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between group transition-all duration-300 border-l-4 border-l-indigo-500 hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                                        <div className="flex flex-col items-center justify-center bg-slate-900 border border-white/5 w-20 h-20 rounded-2xl shadow-inner group-hover:border-indigo-500/30 transition-colors">
                                            <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter mb-0.5">Start</span>
                                            <span className="text-lg font-black text-white">{formatTime(booking.startTime)}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight mb-1">{booking.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
                                                <Calendar size={12} className="text-white" />
                                                <span>{formatDate(booking.startTime)}</span>
                                                <span className="text-slate-700">•</span>
                                                <Clock size={12} className="text-white" />
                                                <span>Тривалість: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center border-t md:border-t-0 border-white/5 pt-4 md:pt-0 gap-8">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Організатор</span>
                                            <span className="text-xs font-bold text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">{booking.createdBy}</span>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditBooking(booking);
                                                        setIsBookingModalOpen(true);
                                                    }}
                                                    className="p-3.5 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 rounded-2xl transition-all border border-white/5 shadow-inner"
                                                    title="Редагувати"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => deleteBooking(booking.id)}
                                                    className="p-3.5 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl transition-all border border-white/5 shadow-inner"
                                                    title="Скасувати"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isBookingModalOpen && (
                <BookingModal
                    room={room}
                    booking={editBooking}
                    onClose={() => {
                        setIsBookingModalOpen(false);
                        setEditBooking(null);
                    }}
                />
            )}
        </div>
    );
}
