import React, { useState } from 'react';
import { UserPlus, Mail, Shield, ShieldCheck, User, Trash2, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../../utils/api';
import AddAdminModal from '../modals/AddAdminModal';
import InviteVoterModal from '../modals/InviteVoterModal';

const OwnerPeople = ({ data, onUpdateElection }) => {
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [isInviteVoterOpen, setIsInviteVoterOpen] = useState(false);
    const [voterSearch, setVoterSearch] = useState('');

    const admins = data?.admins || [];
    const participants = data?.participants || [];

    const handleRemoveVoter = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this voter?')) return;
        try {
            const res = await api.delete(`/elections/${data._id}/participants/${userId}`);
            if (res.data.success && onUpdateElection) onUpdateElection(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove voter');
        }
    };

    const handleRemoveAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to remove this admin?')) return;
        // Implementation for remove admin would go here (endpoint needed if not exists)
        alert('Remove admin feature coming soon');
    };

    const filteredParticipants = participants.filter(p => {
        const name = p.name || p.userId?.name || '';
        const email = p.email || p.userId?.email || '';
        return name.toLowerCase().includes(voterSearch.toLowerCase()) ||
            email.toLowerCase().includes(voterSearch.toLowerCase());
    });

    const SectionHeader = ({ title, onInvite, count }) => (
        <div className="flex items-center justify-between border-b-[1px] border-indigo-600 pb-3 mb-6">
            <h2 className="text-3xl font-normal text-indigo-700 font-sans">{title}</h2>
            <div className="flex items-center gap-4">
                {count !== undefined && (
                    <span className="text-sm font-medium text-gray-500">{count} {count === 1 ? 'person' : 'people'}</span>
                )}
                <button
                    onClick={onInvite}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-90"
                    title={`Invite ${title}`}
                >
                    <UserPlus className="w-6 h-6" />
                </button>
            </div>
        </div>
    );

    const PersonItem = ({ person, isOwner, isAdmin, onRemove }) => {
        const name = person.name || person.userId?.name || 'Anonymous Voter';
        const email = person.email || person.userId?.email || '';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-4 group px-2 rounded-xl transition-all hover:bg-gray-50/80"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-sm transition-transform group-hover:scale-110 ${isAdmin ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                        {initials || <User className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-base font-medium text-gray-900 leading-none">{name}</p>
                        {isOwner && (
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <Shield className="w-2.5 h-2.5" /> Primary Owner
                            </p>
                        )}
                        {!isOwner && isAdmin && (
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> Co-owner
                            </p>
                        )}
                        {!isAdmin && email && (
                            <p className="text-xs text-gray-400 mt-1 font-medium italic">{email}</p>
                        )}
                    </div>
                </div>
                {!isOwner && onRemove && (
                    <button
                        onClick={() => (data?.status === 'scheduled' || data?.status === 'draft' || data?.status === 'active') && onRemove(person._id || person.userId?._id)}
                        disabled={data?.status !== 'scheduled' && data?.status !== 'draft' && data?.status !== 'active'}
                        title={data?.status !== 'scheduled' && data?.status !== 'draft' && data?.status !== 'active' ? 'Cannot remove participants once election has closed' : 'Remove'}
                        className={`p-2 rounded-lg transition-all group-hover:opacity-100 ${(data?.status === 'scheduled' || data?.status === 'draft' || data?.status === 'active')
                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            : 'text-gray-200 cursor-not-allowed'
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto py-10 px-4 min-h-screen"
        >

            {/* Owners Section */}
            <section className="mb-20">
                <div className="flex items-center justify-between border-b-[1px] border-indigo-600 pb-3 mb-6">
                    <h2 className="text-3xl font-normal text-indigo-700 font-sans">Owners</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => (data?.status === 'scheduled' || data?.status === 'draft' || data?.status === 'active') && setIsAddAdminOpen(true)}
                            disabled={data?.status !== 'scheduled' && data?.status !== 'draft' && data?.status !== 'active'}
                            title={data?.status !== 'scheduled' && data?.status !== 'draft' && data?.status !== 'active' ? 'Cannot add owners once election has closed' : 'Invite Owners'}
                            className={`p-2 rounded-full transition-all active:scale-90 ${(data?.status === 'scheduled' || data?.status === 'draft' || data?.status === 'active')
                                ? 'text-indigo-600 hover:bg-indigo-50'
                                : 'text-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <UserPlus className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    {admins.map((admin, idx) => (
                        <PersonItem
                            key={idx}
                            person={admin}
                            isOwner={admin.role === 'owner'}
                            isAdmin={true}
                            onRemove={admin.role !== 'owner' ? handleRemoveAdmin : null}
                        />
                    ))}
                </div>
            </section>

            {/* Voters Section */}
            <section>
                <div className="flex items-center justify-between border-b-[1px] border-indigo-600 pb-3 mb-6">
                    <h2 className="text-3xl font-normal text-indigo-700 font-sans">Voters</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={voterSearch}
                                onChange={(e) => setVoterSearch(e.target.value)}
                                className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none w-32 sm:w-48 transition-all"
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{participants.length} {participants.length === 1 ? 'voter' : 'voters'}</span>
                        <button
                            onClick={() => (data?.status === 'scheduled' || data?.status === 'draft' || data?.status === 'active') && setIsInviteVoterOpen(true)}
                            disabled={data?.status !== 'scheduled' && data?.status !== 'draft' && data?.status !== 'active'}
                            title={data?.status !== 'scheduled' && data?.status !== 'draft' && data?.status !== 'active' ? 'Cannot invite voters once election has closed' : 'Invite Voters'}
                            className={`p-2 rounded-full transition-all active:scale-90 ${(data?.status === 'scheduled' || data?.status === 'draft' || data?.status === 'active')
                                ? 'text-indigo-600 hover:bg-indigo-50'
                                : 'text-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <UserPlus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {participants.length === 0 ? (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="py-24 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="relative">
                            <div className="w-48 h-48 bg-gray-50/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-100">
                                <User className="w-24 h-24 text-gray-100" />
                            </div>
                            <div className="absolute -bottom-4 -right-2 w-20 h-20 bg-white rounded-3xl shadow-xl shadow-indigo-100/50 flex items-center justify-center animate-bounce">
                                <UserPlus className="w-10 h-10 text-indigo-600" />
                            </div>
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-2xl font-medium text-gray-900">Add voters to your election</h3>
                            <button
                                onClick={() => setIsInviteVoterOpen(true)}
                                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
                            >
                                <UserPlus className="w-5 h-5" />
                                Invite voters
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        <AnimatePresence>
                            {filteredParticipants.map((voter, idx) => (
                                <PersonItem
                                    key={voter._id || idx}
                                    person={voter}
                                    isAdmin={false}
                                    onRemove={handleRemoveVoter}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* Modals */}
            <AddAdminModal
                isOpen={isAddAdminOpen}
                onClose={() => setIsAddAdminOpen(false)}
                electionId={data._id}
                onUpdate={onUpdateElection}
            />
            <InviteVoterModal
                isOpen={isInviteVoterOpen}
                onClose={() => setIsInviteVoterOpen(false)}
                electionId={data._id}
                onUpdate={onUpdateElection}
                admins={data?.admins || []}
            />
        </motion.div>
    );
};

export default OwnerPeople;
