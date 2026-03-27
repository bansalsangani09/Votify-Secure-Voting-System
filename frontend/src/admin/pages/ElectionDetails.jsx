import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    ShieldCheck,
    Loader2,
    Play,
    Pause,
    ArrowLeft,
    Users,
    Mail,
    Globe,
    ExternalLink,
    Trophy,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Activity,
    XCircle,
    Trash2,
    Save,
    Lock,
    X as CloseIcon
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ElectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchElection = async () => {
            try {
                const response = await api.get(`/admin/elections/${id}`);
                setElection(response.data.data);
                setEditData(response.data.data);
            } catch (error) {
                console.error('Error fetching election details:', error);
                toast.error('Failed to load election details');
            } finally {
                setLoading(false);
            }
        };
        fetchElection();
    }, [id]);

    const handleSave = async () => {
        setUpdating(true);
        try {
            const res = await api.patch(`/elections/${id}`, editData);
            if (res.data.success) {
                setElection(res.data.data);
                setIsEditing(false);
                toast.success('Election updated successfully');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update election');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await api.delete(`/elections/${id}`);
            if (res.data.success) {
                toast.success('Election deleted permanently');
                navigate('/admin/elections');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete election');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        const previousStatus = election.status;
        // Optimistic Update
        setElection(prev => ({ ...prev, status: newStatus }));
        setEditData(prev => ({ ...prev, status: newStatus }));

        setUpdating(true);
        try {
            const res = await api.patch(`/elections/${election._id}/status`, { status: newStatus });
            if (res.data.success) {
                setElection(res.data.data);
                setEditData(res.data.data);
                toast.success(`Election ${newStatus} successfully`);
            }
        } catch (err) {
            // Rollback
            setElection(prev => ({ ...prev, status: previousStatus }));
            setEditData(prev => ({ ...prev, status: previousStatus }));
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(election?.joinCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invite code copied!');
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!election) {
        return (
            <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-lg">Election not found</p>
                <button onClick={() => navigate('/admin/elections')} className="mt-4 text-indigo-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 mx-auto">
                    <ArrowLeft className="w-4 h-4" /> Back to Overview
                </button>
            </div>
        );
    }

    const owner = election.admins.find(a => a.role === 'owner')?.userId;
    const coOwners = election.admins.filter(a => a.role === 'co-owner');

    const canEdit = election.status === 'paused' || election.status === 'scheduled' || election.status === 'draft';
    const canControl = election.status === 'active' || election.status === 'paused';

    return (
        <div className="space-y-8 pb-20 p-4">
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6"
                        >
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                                <AlertCircle className="w-8 h-8 text-rose-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-900">Delete Election?</h3>
                                <p className="text-slate-500 font-medium text-sm">This action is permanent and will remove all associated votes and candidates. This cannot be undone.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 px-6 py-3 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all">Delete Forever</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin/elections')}
                        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-black uppercase tracking-widest text-[10px] mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Elections
                    </button>
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <input
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="text-3xl font-black text-slate-900 tracking-tight bg-slate-50 border-none rounded-2xl px-4 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        ) : (
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {election.title}
                                <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border font-black ${election.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    election.status === 'closed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {election.status}
                                </span>
                            </h2>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => { setIsEditing(false); setEditData(election); }} className="px-6 py-2.5 rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                                <CloseIcon className="w-4 h-4" /> Cancel
                            </button>
                            <button onClick={handleSave} disabled={updating} className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-all">
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => canEdit && setIsEditing(true)}
                                disabled={!canEdit}
                                title={!canEdit ? 'Cannot edit details once election has started or closed' : 'Edit Election'}
                                className={`px-6 py-2.5 rounded-2xl font-bold transition-all border ${canEdit
                                    ? 'text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                                    : 'text-gray-400 border-gray-100 bg-gray-50/50 cursor-not-allowed'
                                    }`}
                            >
                                Edit Election
                            </button>
                            <button
                                onClick={() => canEdit && setShowDeleteConfirm(true)}
                                disabled={!canEdit}
                                title={!canEdit ? 'Cannot delete an ongoing or active election' : 'Delete Election'}
                                className={`p-3 rounded-2xl transition-all border ${!canEdit
                                    ? 'text-gray-300 border-gray-100 bg-gray-50/50 cursor-not-allowed'
                                    : 'text-rose-500 border-rose-100 hover:bg-rose-50'
                                    }`}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Cover & General Info */}
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                        {/* Decorative Cover */}
                        <div className="h-48 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                <Globe className="w-64 h-64 text-white animate-pulse" />
                            </div>
                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white drop-shadow-lg">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Election Identity</p>
                                    <h3 className="text-2xl font-black tracking-tight">{election.title}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md uppercase tracking-widest leading-none">
                                        {election.category}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    General Details
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Proposed Position</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.position || ''}
                                                onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                                                placeholder="e.g. President, Board Member"
                                                className="w-full text-sm font-bold text-slate-900 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all font-inter"
                                            />
                                        ) : (
                                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <Trophy className="w-4 h-4 text-amber-500" />
                                                    {election.position || 'Not Specified'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Voting Method</label>
                                        {isEditing ? (
                                            <select
                                                value={editData.votingType}
                                                onChange={(e) => setEditData({ ...editData, votingType: e.target.value })}
                                                className="w-full text-sm font-bold text-slate-900 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all"
                                            >
                                                <option value="Single Choice">Single Choice</option>
                                                <option value="Multiple Choice">Multiple Choice</option>
                                                <option value="Ranked Choice">Ranked Choice</option>
                                            </select>
                                        ) : (
                                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-indigo-500" />
                                                    {election.votingType}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Election Description</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editData.description}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                rows={4}
                                                className="w-full text-sm font-medium text-slate-600 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all resize-none"
                                            />
                                        ) : (
                                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Activity className="w-4 h-4 text-indigo-200" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {election.description || 'No description provided.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Election Start</label>
                                        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Starts At</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(election.startDate).toLocaleDateString()} at {election.startTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Election End</label>
                                        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Ends At</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(election.endDate).toLocaleDateString()} at {election.endTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Settings Toggles */}
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    Security & Privacy
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="p-6 rounded-[32px] border border-slate-100 bg-slate-50/30 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">Anonymous Voting</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Securely hide voter identity</p>
                                            </div>
                                        </div>
                                        <button
                                            disabled={!isEditing}
                                            onClick={() => setEditData({ ...editData, anonymous: !editData.anonymous })}
                                            className={`w-14 h-7 rounded-full p-1.5 transition-all flex ${editData.anonymous ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'} ${!isEditing && 'opacity-30 cursor-not-allowed'}`}
                                        >
                                            <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                                        </button>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 px-1">
                                            <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Result Sharing</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: 'OFF', label: 'OFF', sub: 'Calculated at end', icon: Lock, active: !editData.liveResultsEnabled, onClick: () => setEditData({ ...editData, liveResultsEnabled: false, publicResultsVisible: false, allowLiveResults: false }) },
                                                { id: 'PRIVATE', label: 'Internal Only', sub: 'Admin dashboard', icon: ShieldCheck, active: editData.liveResultsEnabled && !editData.publicResultsVisible, onClick: () => setEditData({ ...editData, liveResultsEnabled: true, publicResultsVisible: false, allowLiveResults: true }) },
                                                { id: 'PUBLIC', label: 'Open Access', sub: 'Visible to voters', icon: Globe, active: editData.liveResultsEnabled && editData.publicResultsVisible, onClick: () => setEditData({ ...editData, liveResultsEnabled: true, publicResultsVisible: true, allowLiveResults: true }) }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    disabled={!isEditing}
                                                    onClick={opt.onClick}
                                                    className={`flex flex-col items-start p-6 rounded-[32px] border-2 transition-all duration-500 ${opt.active ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-200 ring-4 ring-indigo-50' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-100'} ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                                                >
                                                    <opt.icon className={`w-6 h-6 mb-4 ${opt.active ? 'text-white' : 'text-slate-300'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] mb-1">{opt.label}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${opt.active ? 'text-indigo-100' : 'text-slate-400'}`}>{opt.sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connectivity */}
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    Voter Access
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-indigo-50/30 rounded-[32px] border border-indigo-100/50 relative overflow-hidden group">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Election Invite Code</label>
                                        <div className="flex items-center justify-between relative z-10">
                                            <span className="text-3xl font-black text-indigo-600 tracking-[0.15em] font-mono drop-shadow-sm">
                                                {election.joinCode}
                                            </span>
                                            <button
                                                onClick={handleCopy}
                                                className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-indigo-600"
                                            >
                                                {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-900 rounded-[32px] border border-slate-800 text-white flex flex-col justify-center relative shadow-2xl overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Users className="w-24 h-24" />
                                        </div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Registered Voters</label>
                                        <div className="flex items-end gap-3 relative z-10">
                                            <span className="text-4xl font-black tracking-tight">{election.participants?.length || 0}</span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Confirmed Voters</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Owner Card - Vertical Redesign */}
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 relative z-10">Owner & Governance</h3>

                        <div className="space-y-8 relative z-10">
                            {/* Primary Owner */}
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200 flex items-center justify-center text-3xl font-black ring-8 ring-indigo-50">
                                    {owner?.name?.[0] || 'O'}
                                </div>
                                <div className="">
                                    <p className="text-xl font-black text-slate-900">{owner?.name || 'Unknown Owner'}</p>
                                    <p className="text-xs font-bold text-slate-400">{owner?.email}</p>
                                </div>
                                <div className="flex flex-col gap-2 w-full pt-4">
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Election Manager</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-50/50 border border-amber-100/50">
                                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs font-bold text-slate-600">{owner?.totalCreated || 0} Elections</span>
                                    </div>
                                </div>
                            </div>

                            {/* Co-Owners - List style */}
                            {coOwners.length > 0 && (
                                <div className="pt-8 border-t border-slate-50 space-y-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Governance Co-Owners</p>
                                    <div className="space-y-3">
                                        {coOwners.map((admin, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/80 border border-slate-100 hover:border-indigo-100 transition-all group/admin">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-400 border border-slate-100 group-hover/admin:bg-indigo-600 group-hover/admin:text-white transition-all">
                                                    {admin.userId?.name?.[0] || 'C'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-900 truncate">{admin.userId?.name || 'Unknown'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">Co-Owner</span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                        <span className="text-[8px] font-bold text-slate-400">{admin.userId?.totalCreated || 0} Created</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Election Lifecycle Card */}
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-600" /> Global Status
                            </h3>
                            <div className="flex gap-2">
                                {canControl ? (
                                    <>
                                        <button onClick={() => handleStatusUpdate('paused')} className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 hover:scale-110 active:scale-95 transition-all shadow-sm" title="Pause"><Pause className="w-4 h-4 fill-current" /></button>
                                        <button onClick={() => handleStatusUpdate('closed')} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 hover:scale-110 active:scale-95 transition-all shadow-sm" title="Terminate"><XCircle className="w-4 h-4" /></button>
                                        <button onClick={() => handleStatusUpdate('active')} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 hover:scale-110 active:scale-95 transition-all shadow-sm" title="Restart/Sync"><Play className="w-4 h-4 fill-current" /></button>
                                    </>
                                ) : (
                                    <div className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> Locked
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-10 relative">
                            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-100 via-indigo-200 to-slate-100"></div>

                            {[
                                { label: 'Election Created', color: 'bg-emerald-500 shadow-emerald-200', icon: CheckCircle2, status: 'Success', time: new Date(election.createdAt).toLocaleDateString() },
                                { label: 'Live Voting', color: election.status === 'active' ? 'bg-indigo-600 animate-pulse shadow-indigo-200' : 'bg-slate-200 shadow-slate-100', icon: Trophy, status: election.status === 'active' ? 'Processing' : 'Scheduled', time: election.startTime },
                                { label: 'Result Finalization', color: election.status === 'closed' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-200 shadow-slate-100', icon: ShieldCheck, status: election.status === 'closed' ? 'Distributed' : 'Pipeline', time: 'Phase 3' }
                            ].map((step, idx) => (
                                <div key={idx} className="flex gap-6 relative z-10 group/step">
                                    <div className={`w-8 h-8 rounded-2xl ${step.color} flex items-center justify-center text-white ring-4 ring-white shadow-xl transition-transform duration-300 group-hover/step:scale-125`}>
                                        <step.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{step.label}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{step.status} • {step.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Manifest */}
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-indigo-900/20 group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-1000">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System Security</h3>
                            <p className="text-sm font-bold text-slate-300 leading-relaxed">System-wide security enabled. All votes are permanent and tamper-proof.</p>
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                <Globe className="w-4 h-4" /> Globally Verified
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectionDetails;
