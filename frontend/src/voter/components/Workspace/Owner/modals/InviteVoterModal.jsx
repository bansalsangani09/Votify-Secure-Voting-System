import React, { useState, useContext } from 'react';
import { X, Loader2, UserPlus, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../../../../utils/api';
import { AuthContext } from '../../../../../context/AuthContext';

const InviteVoterModal = ({ isOpen, onClose, electionId, onUpdate, admins = [] }) => {
    const { user } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleInvite = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter an email address');
            return;
        }

        // 🛡️ FRONTEND CHECK: Prevent owner/co-owner from inviting themselves or each other as voters
        const invitedEmail = email.toLowerCase();
        const isOwner = user && invitedEmail === user.email?.toLowerCase();
        const isCoOwner = admins.some(a => (a.email?.toLowerCase() === invitedEmail) || (a.userId?.email?.toLowerCase() === invitedEmail));

        if (isOwner || isCoOwner) {
            setError('Administrators (owners and co-owners) cannot be added as voters to this election.');
            return;
        }

        setInviting(true);
        try {
            const res = await api.post(`/elections/${electionId}/invite-voter`, { email });
            if (res.data.success) {
                setSuccess('Invitation sent successfully!');
                setEmail('');
                if (onUpdate) onUpdate(res.data.data);
                // Close after a short delay to show success
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error('Invite voter error:', err);
            setError(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Invite Voter</h2>
                        <p className="text-sm text-gray-500 font-medium">Add a participant to this election</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <form onSubmit={handleInvite} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="voter@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                <ShieldAlert className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-bold">{success}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 -mx-8 px-8 mt-4 bg-gray-50/50 -mb-8 py-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={inviting}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-[20px] text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
                            >
                                {inviting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Inviting...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>Send Invite</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteVoterModal;
