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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full"></div>

                <div className="flex justify-between items-center p-8 border-b border-white/5 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic truncate pr-4">
                        Редагування: {room.name}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/5">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar relative z-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 ml-1 uppercase tracking-widest">Назва кімнати</label>
                            <input
                                required
                                type="text"
                                className="glass-input w-full px-5 py-4 rounded-2xl text-white transition-all font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 ml-1 uppercase tracking-widest">Опис</label>
                            <textarea
                                rows="2"
                                className="glass-input w-full px-5 py-4 rounded-2xl text-white transition-all font-medium resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-8">
                        <h3 className="text-sm font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <Shield size={18} className="text-white/80" />
                            Управління доступом
                        </h3>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="flex-1 glass-input px-5 py-4 rounded-2xl text-sm font-medium"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addMember}
                                className="bg-indigo-600 p-4 rounded-2xl text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                                title="Додати учасника"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
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
                                    <div key={email} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:bg-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-800 p-2.5 rounded-xl border border-white/10 shadow-inner">
                                                {role === 'Admin' ? <Shield size={16} className="text-white/80" /> : <User size={16} className="text-white/40" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{email}</p>
                                                <p className="text-[10px] text-white/60 uppercase tracking-widest font-black opacity-70 mt-0.5">{role}</p>
                                            </div>
                                        </div>
                                        {(currentUserRole === 'Admin' && email.toLowerCase() !== normalizedUserEmail) && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRole(email)}
                                                    className="text-[10px] font-black text-indigo-400 hover:text-white hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-all uppercase tracking-tighter"
                                                >
                                                    Змінити роль
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(email)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                            className="premium-button flex-1 py-4 px-4 rounded-2xl font-black text-white transition-all text-sm uppercase tracking-widest"
                        >
                            Зберегти зміни
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
