import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Clock, Users, Plus, Shield, Trash2 } from 'lucide-react';
import BookingModal from '../components/BookingModal';

export default function RoomDetails() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
        <div className="min-h-screen bg-slate-50 pb-12">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Назад</span>
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">{room?.name}</h1>
                    <div className="w-20"></div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-slate-500 text-sm mb-2">{room?.description}</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                                    <span className="flex items-center gap-2">
                                        <Users size={16} className="text-indigo-500" />
                                        <span>{Object.keys(room?.members || {}).length} учасників</span>
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
                                        <Shield size={16} />
                                        <span>Адміністратор</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                            >
                                <Plus size={20} />
                                Забронювати час
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Calendar size={24} className="text-indigo-600" />
                        Розклад бронювань
                    </h2>

                    {bookings.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Clock size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">Поки що немає бронювань для цієї кімнати</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{booking.title}</h4>
                                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                <span>{formatDate(booking.startTime)}</span>
                                                <span>•</span>
                                                <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-semibold text-slate-400 mb-1">Організатор</p>
                                            <p className="text-sm font-bold text-slate-700">{booking.createdBy}</p>
                                        </div>

                                        {(isAdmin || booking.createdBy === normalizedUserEmail) && (
                                            <button
                                                onClick={() => deleteBooking(booking.id)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Скасувати бронювання"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
                    onClose={() => setIsBookingModalOpen(false)}
                />
            )}
        </div>
    );
}
