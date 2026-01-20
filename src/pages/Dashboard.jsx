import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Layout, Plus, Users, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import CreateRoomModal from '../components/CreateRoomModal';
import EditRoomModal from '../components/EditRoomModal';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const canEditRoom = (room) => {
        if (!user?.email) return false;
        const normalizedUserEmail = user.email.toLowerCase();

        if (room.createdBy?.toLowerCase() === normalizedUserEmail) return true;

        const members = room.members || {};
        const userRole = Object.entries(members).find(
            ([email]) => email.toLowerCase() === normalizedUserEmail
        )?.[1];

        return userRole === 'Admin';
    };

    useEffect(() => {
        const q = query(collection(db, 'rooms'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const normalizedUserEmail = user?.email?.toLowerCase();
            const roomsData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const members = data.members || {};
                const isMember = members[user?.email] || members[normalizedUserEmail];
                const isCreator = data.createdBy?.toLowerCase() === normalizedUserEmail;

                if (isMember || isCreator) {
                    roomsData.push({ id: doc.id, ...data });
                }
            });
            setRooms(roomsData);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="min-h-screen text-slate-100 flex flex-col">
            <nav className="glass-card border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 z-40 backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-2xl text-white shadow-lg shadow-white/5 border border-white/10">
                        <Layout size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">RoomSync</h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Користувач</span>
                        <span className="text-sm font-black text-slate-200">{user?.displayName || user?.email}</span>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Вийти</span>
                    </button>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto w-full flex-grow relative">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                    <div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Ваші переговорки</h2>
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                            <p className="text-sm font-medium tracking-wide italic">Керуйте кімнатами та бронюваннями</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="premium-button flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl"
                    >
                        <Plus size={20} />
                        Створити кімнату
                    </button>
                </div>

                {rooms.length === 0 ? (
                    <div className="glass-card rounded-[2.5rem] p-20 text-center border-dashed border-white/10 flex flex-col items-center">
                        <div className="bg-slate-800/50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                            <Users className="text-indigo-400" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Кімнат ще немає</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-10 font-medium leading-relaxed italic">
                            Ваш простір для продуктивності поки порожній. Створіть свою першу переговорну кімнату прямо зараз.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-indigo-400 font-black hover:text-indigo-300 transition-all uppercase tracking-widest text-sm border-b-2 border-indigo-400/30 pb-1"
                        >
                            Додати першу кімнату →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                className="glass-card rounded-[2.5rem] p-8 group transition-all duration-500 hover:translate-y-[-8px] hover:shadow-indigo-500/10 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="bg-white/10 text-white p-4 rounded-2xl border border-white/10 group-hover:bg-white/20 transition-all duration-300 shadow-lg">
                                        <Users size={28} />
                                    </div>
                                    <div className="flex gap-1">
                                        {canEditRoom(room) && (
                                            <button
                                                onClick={() => setEditingRoom(room)}
                                                className="p-3 text-slate-500 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all"
                                                title="Редагувати"
                                            >
                                                <Edit size={20} />
                                            </button>
                                        )}

                                        {canEditRoom(room) && (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Ви впевнені, що хочете видалити всю кімнату?')) await deleteDoc(doc(db, 'rooms', room.id))
                                                }}
                                                className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Видалити кімнату"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative z-10 mb-6">
                                    <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors mb-2 tracking-tight">{room.name}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-2 italic">{room.description}</p>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex flex-col gap-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                                            {room.createdBy?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Власник</span>
                                            <span className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">{room.createdBy}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/room/${room.id}`)}
                                        className="w-full py-4 glass-input rounded-2xl text-sm font-black text-white uppercase tracking-[0.15em] hover:bg-indigo-600 transition-all border-none"
                                    >
                                        Перейти до бронювання
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {isModalOpen && (
                <CreateRoomModal onClose={() => setIsModalOpen(false)} />
            )}
            {editingRoom && (
                <EditRoomModal room={editingRoom} onClose={() => setEditingRoom(null)} />
            )}
        </div>
    );
}
