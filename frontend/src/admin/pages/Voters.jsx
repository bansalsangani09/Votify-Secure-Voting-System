import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    X,
    Eye,
    ShieldCheck,
    Clock,
    Globe,
    Search,
    Mail,
    UserMinus,
    ChevronDown,
    CheckCircle,
    Activity,
    Loader2
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AddVoterModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post('/admin/voters', formData);
            if (res.data.success) {
                toast.success('Voter added successfully');
                onSave();
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add voter');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Add New Voter</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                placeholder="Enter voter's full name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                placeholder="voter@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Temporary Password</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                placeholder="Min. 6 characters"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Add Voter
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const VoterDetailsModal = ({ isOpen, onClose, voter }) => {
    if (!isOpen || !voter) return null;

    const stats = voter.stats || {};

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'Suspended': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'Inactive': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header with Photo and Basic Info */}
                    <div className="relative h-48 bg-indigo-600 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700"></div>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10 backdrop-blur-md border border-white/20 group">
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="absolute -bottom-16 left-10 flex items-end gap-6">
                            <div className="w-36 h-36 rounded-[40px] bg-white p-1.5 shadow-2xl relative">
                                {voter.photoUrl ? (
                                    <img src={voter.photoUrl} alt={voter.name} className="w-full h-full rounded-[34px] object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-[34px] bg-indigo-50 flex items-center justify-center text-4xl font-black text-indigo-600 uppercase">
                                        {voter.name?.split(' ').map(n => n[0]).join('') || '?'}
                                    </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center ${voter.status === 'Active' ? 'bg-green-500' : voter.status === 'Suspended' ? 'bg-red-500' : 'bg-slate-500'}`}>
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="mb-6 pb-2">
                                <h3 className="text-3xl font-black text-white drop-shadow-sm">{voter.name}</h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <p className="text-indigo-100 font-bold flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 text-sm">
                                        <Mail className="w-3.5 h-3.5" /> {voter.email}
                                    </p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(voter.status)}`}>
                                        {voter.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-10 pt-24 pb-10 overflow-y-auto custom-scrollbar">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-indigo-400 transition-colors">Account Age</p>
                                <p className="text-2xl font-black text-slate-800">{stats.accountAge || 0} <span className="text-sm font-bold text-slate-400">Days</span></p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-indigo-400 transition-colors">Elections</p>
                                <p className="text-2xl font-black text-slate-800">{stats.totalElectionsAssigned || 0}</p>
                            </div>
                            <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 group">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Voted</p>
                                <p className="text-2xl font-black text-indigo-700">{stats.electionsVotedCount || 0}</p>
                            </div>
                            <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 group">
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">Not Voted</p>
                                <p className="text-2xl font-black text-amber-700">{(stats.totalElectionsAssigned - (stats.electionsVotedCount || 0)) || 0}</p>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-slate-100"></span>
                                System Records
                                <span className="flex-1 h-[2px] bg-slate-100"></span>
                            </h4>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Created</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-300" />
                                        {new Date(voter.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-300" />
                                        {voter.lastLogin ? new Date(voter.lastLogin).toLocaleString() : 'Never logged in'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Election Name</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        {voter.electionName || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Tracking</p>
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold py-1.5 px-3 bg-slate-50 rounded-lg">
                                            <span className="text-slate-500">Last Changed</span>
                                            <span className="text-indigo-600">{voter.statusChangedAt ? new Date(voter.statusChangedAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        {voter.suspendedAt && (
                                            <div className="flex items-center justify-between text-[11px] font-bold py-1.5 px-3 bg-red-50 rounded-lg">
                                                <span className="text-red-400">Suspended Date</span>
                                                <span className="text-red-600">{new Date(voter.suspendedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {voter.inactiveAt && (
                                            <div className="flex items-center justify-between text-[11px] font-bold py-1.5 px-3 bg-slate-100 rounded-lg">
                                                <span className="text-slate-400">Inactive Date</span>
                                                <span className="text-slate-600">{new Date(voter.inactiveAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Flag</p>
                                    <div className={`mt-2 p-3 rounded-2xl flex items-center gap-3 border ${voter.isSuspicious ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${voter.isSuspicious ? 'bg-red-100' : 'bg-green-100'}`}>
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-wider">{voter.isSuspicious ? 'High Risk' : 'Secure'}</p>
                                            <p className="text-[10px] opacity-70 font-bold">{voter.isSuspicious ? 'Suspicious activity detected' : 'No unusual patterns found'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Votes */}
                        <div className="mt-10 space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-slate-100"></span>
                                Voting History
                                <span className="flex-1 h-[2px] bg-slate-100"></span>
                            </h4>
                            <div className="space-y-2">
                                {stats.votedElectionsList?.length > 0 ? stats.votedElectionsList.map(vote => (
                                    <div key={vote.electionId} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{vote.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Participation</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase">
                                            {new Date(vote.votedAt).toLocaleDateString()} <span className="ml-2 text-slate-300">|</span> <span className="ml-2">{new Date(vote.votedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </p>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm font-bold text-slate-400">No voting history found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const Voters = () => {
    const [voters, setVoters] = useState([]);
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0 });
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedVoter, setSelectedVoter] = useState(null);

    useEffect(() => {
        fetchElections();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVoters(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedElection, filterStatus]);

    const fetchElections = async () => {
        try {
            const response = await api.get('/admin/elections');
            setElections(response.data.data || []);
            if (response.data.data && response.data.data.length > 0) {
                // Optionally auto-select the first one
                // setSelectedElection(response.data.data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching elections:', error);
            toast.error('Failed to load elections');
        }
    };

    const fetchVoters = async (search = searchTerm) => {
        setLoading(true);
        try {
            let url = `/admin/voters?search=${search}`;
            if (selectedElection) url += `&electionId=${selectedElection}`;

            const response = await api.get(url);
            let voterData = response.data.data.voters;

            // Calculate stats before filtering
            const total = voterData.length;
            const votedCount = voterData.filter(v => v.electionStatus === 'Voted').length;
            const pendingCount = total - votedCount;

            setStats({
                total,
                voted: votedCount,
                pending: pendingCount
            });

            // Client side filtering
            if (filterStatus === 'voted') {
                voterData = voterData.filter(v => v.electionStatus === 'Voted');
            } else if (filterStatus === 'pending') {
                voterData = voterData.filter(v => v.electionStatus !== 'Voted');
            }

            setVoters(voterData);
        } catch (error) {
            console.error('Error fetching voters:', error);
            toast.error('Error loading voters');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            fetchVoters(searchTerm);
        }
    };

    const removeVoter = async (id) => {
        if (window.confirm('Are you sure you want to remove this voter?')) {
            try {
                await api.delete(`/admin/voters/${id}`);
                toast.success('Voter removed successfully');
                fetchVoters(searchTerm);
            } catch (error) {
                console.error('Error removing voter:', error);
                toast.error('Failed to remove voter');
            }
        }
    };

    const handleAddVoter = () => {
        setIsAddModalOpen(true);
    };

    const handleViewDetails = async (voter) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/voters/${voter._id}/profile`);
            setSelectedVoter(res.data.data);
            setIsDetailsModalOpen(true);
        } catch (err) {
            toast.error('Failed to load voter profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (voter, newStatus) => {
        try {
            const res = await api.patch(`/admin/voters/${voter._id}/status`, {
                status: newStatus,
                electionId: selectedElection // Pass this for election-specific suspension logic
            });
            if (res.data.success) {
                toast.success(`Voter ${newStatus.toLowerCase()} successfully`);
                fetchVoters();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleRemoveFromElection = async (voter) => {
        if (!selectedElection) {
            toast.error('Please select an election first');
            return;
        }

        if (window.confirm('Remove this voter from the selected election?')) {
            try {
                const res = await api.post(`/admin/voters/${voter._id}/remove-from-election`, { electionId: selectedElection });
                if (res.data.success) {
                    toast.success('Voter removed from election');
                    fetchVoters();
                }
            } catch (err) {
                toast.error('Failed to remove voter');
            }
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Voters Management</h2>
                    <p className="text-gray-500 mt-1">Review registered voters, their status and activity.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleAddVoter}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-indigo-200"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Voter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row gap-4 justify-between bg-gray-50/20">
                    <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={handleSearch}
                                onKeyDown={handleSearchSubmit}
                            />
                        </div>
                        <div className="relative min-w-[200px]">
                            <select
                                value={selectedElection}
                                onChange={(e) => setSelectedElection(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-100 rounded-lg text-sm outline-none appearance-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm font-medium"
                            >
                                <option value="">All Elections</option>
                                {elections.map(elec => (
                                    <option key={elec._id} value={elec._id}>{elec.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white rounded-lg border border-gray-100 p-1 shadow-sm">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilterStatus('voted')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'voted' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Voted ({stats.voted || 0})
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'pending' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Not Voted ({stats.pending || 0})
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[200px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    )}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Voter Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Election Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Vote Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Account Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Last Login</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">IP Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {voters.length > 0 ? (
                                voters.map((voter) => (
                                    <tr key={voter._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 text-xs uppercase">
                                                    {voter.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{voter.name}</p>
                                                    <p className="text-xs text-gray-500">{voter.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 font-bold text-[11px]">
                                                    {voter.joinedElections?.length > 0
                                                        ? (voter.joinedElections.length === 1
                                                            ? voter.joinedElections[0].title
                                                            : `${voter.joinedElections[0].title} +${voter.joinedElections.length - 1}`)
                                                        : 'No Election'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${voter.electionStatus === 'Voted' ? 'bg-green-50 text-green-700' :
                                                voter.electionStatus === 'Not Voted' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${voter.electionStatus === 'Voted' ? 'bg-green-500' :
                                                    voter.electionStatus === 'Not Voted' ? 'bg-amber-500' : 'bg-gray-300'
                                                    }`}></span>
                                                {voter.electionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${voter.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                voter.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${voter.status === 'Active' ? 'bg-green-500 animate-pulse' :
                                                    voter.status === 'Suspended' ? 'bg-red-500' : 'bg-slate-400'
                                                    }`} />
                                                {voter.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {voter.lastLogin ? new Date(voter.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{voter.ip}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleViewDetails(voter)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl bg-indigo-50 transition-all shadow-sm flex items-center gap-2 group/btn"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="hidden group-hover/btn:inline text-[10px] font-black uppercase pr-1">Profile</span>
                                                </button>

                                                {voter.status === 'Suspended' ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(voter, 'Active')}
                                                        className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-xl bg-green-50 transition-all shadow-sm"
                                                        title="Restore Access (Active)"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateStatus(voter, 'Suspended')}
                                                        className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-xl bg-red-50 transition-all shadow-sm"
                                                        title={`Suspend Voter (Temporary block${selectedElection ? ' from this election' : ''})`}
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleUpdateStatus(voter, voter.status === 'Inactive' ? 'Active' : 'Inactive')}
                                                    className={`p-2 transition-all rounded-xl shadow-sm ${voter.status === 'Inactive'
                                                        ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white'
                                                        : 'text-slate-600 bg-slate-50 hover:bg-slate-600 hover:text-white'}`}
                                                    title={voter.status === 'Inactive' ? 'Restore Access (Active)' : 'Disable Voter (Global block - cannot vote in any election)'}
                                                >
                                                    <Activity className="w-4 h-4" />
                                                </button>

                                                {selectedElection && (
                                                    <button
                                                        onClick={() => handleRemoveFromElection(voter)}
                                                        className="p-2 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl bg-amber-50 transition-all shadow-sm"
                                                        title="Remove from this election"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => removeVoter(voter._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                                                    title="Delete Voter Permanently"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Search className="w-12 h-12 text-slate-200" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">No voters found</p>
                                                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                                                </div>
                                                {(searchTerm || selectedElection || filterStatus !== 'all') && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setSelectedElection('');
                                                            setFilterStatus('all');
                                                        }}
                                                        className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                                                    >
                                                        Clear all filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddVoterModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={() => fetchVoters()}
            />

            <VoterDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                voter={selectedVoter}
            />
        </div >
    );
};

export default Voters;
