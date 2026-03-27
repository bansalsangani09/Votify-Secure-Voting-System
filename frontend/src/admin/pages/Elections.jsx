import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Calendar,
    Users,
    Mail,
    FileText,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    Play,
    Pause,
    Loader2,
    X,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Copy,
    Check,
    ShieldCheck,
    Lock,
    Globe,
    Link as LinkIcon
} from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CopyInviteCode = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invite code copied!');
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 group/copy"
        >
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg group-hover/copy:bg-indigo-50 group-hover/copy:text-indigo-600 transition-colors uppercase">
                {code || 'N/A'}
            </span>
            {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
                <Copy className="w-3.5 h-3.5 text-slate-300 group-hover/copy:text-indigo-400 transition-colors" />
            )}
        </button>
    );
};

const ElectionCycle = ({ start, end, status }) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    let progress = 0;
    if (now > endDate) progress = 100;
    else if (now > startDate) {
        const total = endDate - startDate;
        const current = now - startDate;
        progress = Math.min(100, Math.max(0, (current / total) * 100));
    }

    const phases = [
        { label: 'Created', done: true },
        { label: 'Voting', done: now >= startDate },
        { label: 'Closed', done: now >= endDate || status === 'closed' }
    ];

    return (
        <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="flex items-center gap-2">
                {phases.map((p, i) => (
                    <React.Fragment key={i}>
                        <div
                            className={`w-2 h-2 rounded-full border ${p.done ? 'bg-indigo-500 border-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-100 border-slate-200'}`}
                            title={p.label}
                        />
                        {i < phases.length - 1 && (
                            <div className={`h-[1px] w-4 ${phases[i + 1].done ? 'bg-indigo-300' : 'bg-slate-100'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {progress === 100 ? 'Cycle Complete' : progress > 0 ? `${Math.round(progress)}% Through Cycle` : 'Cycle Pending'}
                </span>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${progress === 100 ? 'bg-emerald-400' : 'bg-indigo-500'} rounded-full`}
                    />
                </div>
            </div>
        </div>
    );
};

const Elections = () => {
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        ownerId: '',
        startDate: '',
        endDate: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    const fetchOwners = async () => {
        try {
            const res = await api.get('/admin/owners');
            setOwners(res.data.data);
        } catch (err) {
            console.error('Error fetching owners:', err);
        }
    };

    const fetchElections = useCallback(async () => {
        setLoading(true);
        try {
            let query = `?search=${filters.search}&status=${filters.status}&ownerId=${filters.ownerId}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
            const response = await api.get(`/admin/elections${query}`);
            setElections(response.data.data || []);
        } catch (error) {
            console.error('Error fetching elections:', error);
            setElections([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOwners();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchElections();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchElections]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            status: '',
            ownerId: '',
            startDate: '',
            endDate: ''
        });
        setPage(1);
    };

    const handleStatusUpdate = async (electionId, newStatus) => {
        // Optimistic Update
        const previousElections = [...elections];
        setElections(prev => prev.map(e =>
            e._id === electionId ? { ...e, status: newStatus } : e
        ));

        try {
            const res = await api.patch(`/elections/${electionId}/status`, { status: newStatus });
            if (res.data.success) {
                toast.success(`Status updated to ${newStatus}`);
                // No need to fetchElections here as we've already optimistically updated
                // But we can call it to ensure sync with any other server changes if needed
                // For "direct" feel, we rely on the state update above
            }
        } catch (err) {
            // Rollback
            setElections(previousElections);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'closed': return 'text-rose-600 bg-rose-50 border-rose-200';
            case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'paused': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="p-1 md:p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        Elections Overview
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Global administration and real-time election oversight.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm border ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Advanced Filters
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner</label>
                                <select
                                    name="ownerId"
                                    value={filters.ownerId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                                >
                                    <option value="">All Owners</option>
                                    {owners.map(owner => (
                                        <option key={owner._id} value={owner._id}>{owner.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>
                            <div className="flex items-end pb-0.5">
                                <button
                                    onClick={resetFilters}
                                    className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Reset Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search & Actions Bar */}
            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by election title..."
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[24px] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                            value={filters.search}
                            name="search"
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                <p className="text-sm font-bold text-slate-500">Syncing elections...</p>
                            </div>
                        </div>
                    )}
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Election info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invite Code</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Election Cycle</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {elections.length > 0 ? (
                                elections.map((e) => {
                                    const owner = e.admins.find(a => a.role === 'owner')?.userId;
                                    return (
                                        <tr key={e._id} className="group transition-all hover:bg-slate-50/50">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                        {e.title[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 max-w-[150px]">{e.title}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                                            ID: #{e._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <CopyInviteCode code={e.joinCode} />
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusStyles(e.status)}`}>
                                                    {e.status === 'active' && <Activity className="w-3 h-3 animate-pulse" />}
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <ElectionCycle start={e.startDate} end={e.endDate} status={e.status} />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                                        <Clock className="w-3 h-3 text-slate-300" />
                                                        {new Date(e.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(e.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 w-1/2 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    {!e.liveResultsEnabled ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                            <Lock className="w-3 h-3 text-slate-300" /> Results OFF
                                                        </span>
                                                    ) : e.publicResultsVisible ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-wider">
                                                            <Globe className="w-3 h-3" /> Public Live
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                                            <ShieldCheck className="w-3 h-3" /> Staff Only
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-white shadow-sm">
                                                        {owner?.name?.[0] || 'O'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{owner?.name || 'Unknown Owner'}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                            <Mail className="w-2.5 h-2.5" /> {owner?.email?.split('@')[0]}...
                                                        </span>
                                                        <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter mt-0.5">
                                                            {owner?.totalCreated || 0} Created
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {e.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(e._id, 'paused')}
                                                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                                                            title="Pause Election"
                                                        >
                                                            <Pause className="w-4 h-4" />
                                                        </button>
                                                    ) : e.status === 'paused' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(e._id, 'active')}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                                                            title="Activate Election"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        onClick={() => navigate(`/admin/elections/${e._id}`)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <FileText className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">No elections found matching these criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Elections;
