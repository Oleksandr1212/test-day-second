import React, { useState, useEffect } from 'react';
import { LogOut, Layout, Plus, Users, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import CreateRoomModal from '../components/CreateRoomModal';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'rooms'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const roomsData = [];
            querySnapshot.forEach((doc) => {
                roomsData.push({ id: doc.id, ...doc.data() });
            });
            setRooms(roomsData);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
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

            <main className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Ваші переговорки</h2>
                        <p className="text-slate-500 text-sm">Керуйте кімнатами та бронюваннями</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus size={20} />
                        Створити кімнату
                    </button>
                </div>

                {rooms.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Кімнат ще немає</h3>
                        <p className="text-slate-500 mb-6">Створіть свою першу переговорну кімнату, щоб почати бронювання.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-indigo-600 font-semibold hover:text-indigo-700"
                        >
                            Додати кімнату +
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Users size={24} />
                                    </div>
                                    {user.email === room.createdBy && (
                                        <div className="flex gap-2">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Ви впевнені?')) await deleteDoc(doc(db, 'rooms', room.id))
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{room.name}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{room.description}</p>
                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                    <span>Створено: {room.createdBy}</span>
                                </div>
                                <button className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Відкрити бронювання
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {isModalOpen && (
                <CreateRoomModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}
