import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    Slash,
    AlertCircle,
    UserCheck,
    Trash2,
    Clock,
    Shield,
    BarChart3,
    Users,
    Mail,
    Calendar,
    ArrowRight,
    Loader2,
    X,
    UserX,
    Ban,
    ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const getStatusColor = (status) => {
    switch (status) {
        case 'verified': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'suspended': return 'bg-red-50 text-red-600 border-red-100';
        case 'restricted': return 'bg-red-50 text-red-600 border-red-100';
        case 'new': return 'bg-orange-50 text-orange-600 border-orange-100';
        default: return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // 'active/safe'
    }
};

const OwnerProfileModal = ({ onClose, ownerId }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ownerId) {
            fetchProfile();
        }
    }, [ownerId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/owners/${ownerId}/profile`);
            setProfile(res.data.data);
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-gray-500 font-bold animate-pulse">Loading Owner Intelligence...</p>
                    </div>
                ) : profile && (
                    <>
                        <div className="relative h-40 bg-indigo-600 shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-800 opacity-90"></div>
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10 backdrop-blur-md cursor-pointer pointer-events-auto"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="px-8 pb-8 -mt-16 relative z-10 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
                                <div className="w-32 h-32 rounded-[40px] bg-white p-1.5 shadow-2xl">
                                    <div className="w-full h-full rounded-[34px] bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-700 uppercase border-4 border-white overflow-hidden">
                                        {profile.photoUrl ? (
                                            <img src={profile.photoUrl} className="w-full h-full object-cover" alt="" />
                                        ) : profile.name?.split(' ').map(n => n[0]).join('') || '?'}
                                    </div>
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(profile.ownerStatus)}`}>
                                            {profile.ownerStatus}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 font-bold flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4" /> {profile.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <BarChart3 className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Elections</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{profile.stats.totalElections}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Total Created</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <Users className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Reach</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{profile.stats.totalVotersManaged.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Voters Managed</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Success</span>
                                    </div>
                                    <p className="text-2xl font-black text-emerald-900">{profile.stats.successfulElections}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Closed Normally</p>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Failures</span>
                                    </div>
                                    <p className="text-2xl font-black text-rose-900">{profile.stats.unsuccessfulElections}</p>
                                    <p className="text-[10px] text-rose-400 font-bold uppercase mt-1">Force Close/Pause</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Largest</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{profile.stats.largestElectionSize}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Single Election</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <AlertCircle className="w-24 h-24" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        Security & Metadata
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Account Created</span>
                                            <span className="text-sm font-bold flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                {new Date(profile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Last Election Activity</span>
                                            <span className="text-sm font-bold flex items-center gap-2 text-indigo-300">
                                                <Clock className="w-4 h-4" />
                                                {profile.stats.lastElectionDate ? new Date(profile.stats.lastElectionDate).toLocaleDateString() : 'No activity yet'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Suspicious Flags</span>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${profile.stats.totalElections > 10 && profile.successfulElections === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                                {profile.stats.totalElections > 10 && profile.successfulElections === 0 ? 'HIGH RISK' : 'LOW RISK / SECURE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Timeline UI */}
                                <div className="p-6 bg-white border border-gray-100 rounded-[24px]">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        Owner status History
                                    </h4>
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-indigo-50">
                                        {profile.statusHistory && profile.statusHistory.length > 0 ? (
                                            profile.statusHistory.slice().reverse().map((entry, idx) => (
                                                <div key={idx} className="relative pl-10">
                                                    <div className={`absolute left-1 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${idx === 0 ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-300'}`}></div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-sm font-bold text-gray-900 capitalize">{entry.status} State</p>
                                                        {idx === 0 && <span className="text-[10px] font-black text-indigo-600 uppercase">Current</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Changed from <span className="capitalize">{entry.previousStatus || 'new'}</span> on {new Date(entry.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="relative pl-10">
                                                <div className="absolute left-1 top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm shadow-indigo-200"></div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-sm font-bold text-gray-900 capitalize">{profile.ownerStatus} State</p>
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase">Current</span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">System updated status on {new Date(profile.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                        <div className="relative pl-10 opacity-50">
                                            <div className="absolute left-1 top-1.5 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-bold text-gray-500">Initial Registration</p>
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">First became owner on {new Date(profile.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                                className="w-full mt-8 py-4 bg-gray-950 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 group cursor-pointer pointer-events-auto relative z-20"
                            >
                                Done Viewing Profile
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

const Owners = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOwnerId, setSelectedOwnerId] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        fetchOwners();
    }, [filterStatus]);

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/owners?status=${filterStatus}&search=${searchTerm}`);
            setOwners(res.data.data);
        } catch (err) {
            toast.error('Failed to load owners');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/admin/owners/${id}/status`, { status: newStatus });
            toast.success(`Owner ${newStatus === 'verified' ? 'verified' : newStatus} successfully`);
            fetchOwners();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteOwner = async (id) => {
        if (!window.confirm('Are you sure you want to permanently remove this owner? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/owners/${id}`);
            toast.success('Owner removed successfully');
            fetchOwners();
        } catch (err) {
            toast.error('Failed to remove owner');
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchOwners();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">🏢 Owner Management</h2>
                    <p className="text-gray-500 mt-1 font-medium">Control election creation power and monitor organizer reputation.</p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row gap-6 justify-between items-center bg-gray-50/20">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    <div className="flex bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm overflow-x-auto w-full lg:w-auto no-scrollbar">
                        {['all', 'new', 'verified', 'restricted', 'suspended'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap ${filterStatus === status
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {status === 'all' ? `All` : status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 font-bold text-indigo-600">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span>Syncing Data...</span>
                            </div>
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Election Owner</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Efficiency</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Last Activity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Reputation Action Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {owners.length > 0 ? (
                                owners.map((owner) => (
                                    <tr key={owner._id} className="hover:bg-indigo-50/30 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-700 font-black border border-indigo-50 shadow-sm text-xs uppercase overflow-hidden shrink-0">
                                                    {owner.photoUrl ? (
                                                        <img src={owner.photoUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : owner.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-base">{owner.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {owner.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(owner.ownerStatus)}`}>
                                                {owner.ownerStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-black text-gray-900">{new Date(owner.updatedAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(owner.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-gray-400 text-[10px]" title="Total Elections">{owner.totalElections || 0}</span>
                                                    <ArrowRight className="w-3 h-3 text-gray-200" />
                                                    <span className="font-black text-emerald-600" title="Successful (Closed)">{owner.successfulElections || 0}</span>
                                                    <span className="text-gray-300">/</span>
                                                    <span className="font-black text-rose-500" title="Unsuccessful (Paused)">{owner.unsuccessfulElections || 0}</span>
                                                </div>
                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${(owner.successfulElections / (owner.totalElections || 1)) * 100}%` }}></div>
                                                    <div className="h-full bg-rose-400" style={{ width: `${(owner.unsuccessfulElections / (owner.totalElections || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {owner.lastActivity ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-slate-700">{new Date(owner.lastActivity).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-indigo-400 font-bold uppercase flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" /> Recent • {new Date(owner.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic font-bold">No activity</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Profile */}
                                                <button
                                                    onClick={() => { setSelectedOwnerId(owner._id); setIsProfileOpen(true); }}
                                                    className="p-2 bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm hover:shadow-indigo-100"
                                                    title="View Profile Intelligence"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Suspend/Active Toggle */}
                                                <button
                                                    onClick={() => handleStatusUpdate(owner._id, owner.ownerStatus === 'suspended' ? 'new' : 'suspended')}
                                                    className={`p-2 border rounded-xl transition-all ${owner.ownerStatus === 'suspended'
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                        : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'}`}
                                                    title={owner.ownerStatus === 'suspended' ? 'Activate Power' : 'Suspend Power'}
                                                >
                                                    {owner.ownerStatus === 'suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>

                                                {/* Restrict/Active Toggle */}
                                                <button
                                                    onClick={() => handleStatusUpdate(owner._id, owner.ownerStatus === 'restricted' ? 'verified' : 'restricted')}
                                                    className={`p-2 border rounded-xl transition-all ${owner.ownerStatus === 'restricted'
                                                        ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
                                                        : 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'}`}
                                                    title={owner.ownerStatus === 'restricted' ? 'Remove Restrictions' : 'Restrict Access'}
                                                >
                                                    {owner.ownerStatus === 'restricted' ? <Shield className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                </button>

                                                {/* Verify/New Toggle */}
                                                <button
                                                    onClick={() => handleStatusUpdate(owner._id, owner.ownerStatus === 'verified' ? 'new' : 'verified')}
                                                    className={`p-2 border rounded-xl transition-all ${owner.ownerStatus === 'verified'
                                                        ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                                                        : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'}`}
                                                    title={owner.ownerStatus === 'verified' ? 'Reset to New' : 'Verify Owner'}
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>

                                                {/* Remove Owner */}
                                                <button
                                                    onClick={() => handleDeleteOwner(owner._id)}
                                                    className="p-2 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                                                    title="Permanently Remove Owner"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-gray-400 italic">
                                            No owners found matching current filters.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/10 flex justify-between items-center shrink-0">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active nodes online</span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isProfileOpen && (
                    <OwnerProfileModal
                        onClose={() => setIsProfileOpen(false)}
                        ownerId={selectedOwnerId}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Owners;
