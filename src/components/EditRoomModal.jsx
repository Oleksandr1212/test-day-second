import React, { useState } from 'react';
import { X, UserPlus, Shield, User, Trash2 } from 'lucide-react';
import { db } from '../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function EditRoomModal({ room, onClose }) {
    const { user } = useAuth();
    const [name, setName] = useState(room.name);
    const [description, setDescription] = useState(room.description);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [members, setMembers] = useState(room.members || {});
    const [loading, setLoading] = useState(false);

    const normalizedUserEmail = user?.email?.toLowerCase();
    const rawRole = members[user?.email] || members[normalizedUserEmail];
    const isOwner = room.createdBy?.toLowerCase() === normalizedUserEmail;
    const currentUserRole = (rawRole === 'Admin' || rawRole === 'Creator' || isOwner) ? 'Admin' : 'User';

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, 'rooms', room.id), {
                name,
                description,
                members
            });
            onClose();
        } catch (err) {
            alert('Помилка при оновленні кімнати');
        }
        setLoading(false);
    }

    function addMember() {
        if (!newMemberEmail) return;
        const normalizedEmail = newMemberEmail.trim().toLowerCase();
        setMembers({ ...members, [normalizedEmail]: 'User' });
        setNewMemberEmail('');
    }

    function toggleRole(email) {
        const targetRole = members[email];
        const nextRole = targetRole === 'Admin' ? 'User' : 'Admin';
        setMembers({ ...members, [email]: nextRole });
    }

    function removeMember(email) {
        const updated = { ...members };
        delete updated[email];
        setMembers(updated);
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Редагування: {room.name}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Назва кімнати</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Опис</label>
                            <textarea
                                rows="2"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-indigo-600" />
                            Управління учасниками
                        </h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addMember}
                                className="bg-slate-100 p-2 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                title="Додати учасника"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(members)
                                .sort(([email1, role1], [email2, role2]) => {
                                    const e1 = email1.toLowerCase();
                                    const e2 = email2.toLowerCase();

                                    if (e1 === normalizedUserEmail) return -1;
                                    if (e2 === normalizedUserEmail) return 1;

                                    const roleOrder = { Admin: 1, User: 2 };
                                    return (roleOrder[role1] || 3) - (roleOrder[role2] || 3);
                                })
                                .map(([email, role]) => (
                                    <div key={email} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                                                {role === 'Admin' ? <Shield size={14} className="text-indigo-600" /> : <User size={14} className="text-slate-400" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-900">{email}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{role}</p>
                                            </div>
                                        </div>
                                        {(currentUserRole === 'Admin' && email.toLowerCase() !== normalizedUserEmail) && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRole(email)}
                                                    className="text-[10px] font-bold text-indigo-600 hover:bg-white px-2 py-1 rounded-md"
                                                >
                                                    Змінити роль
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(email)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Скасувати
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100"
                        >
                            Зберегти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
