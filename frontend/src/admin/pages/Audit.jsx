import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Shield,
    Clock,
    Globe,
    AlertCircle,
    CheckCircle2,
    Database,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Audit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        actionType: '',
        role: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            let query = `?page=${page}&limit=10&search=${searchTerm}`;
            if (filters.actionType) query += `&actionType=${filters.actionType}`;
            if (filters.role) query += `&role=${filters.role}`;
            if (filters.status) query += `&status=${filters.status}`;
            if (filters.startDate) query += `&startDate=${filters.startDate}`;
            if (filters.endDate) query += `&endDate=${filters.endDate}`;

            const response = await api.get(`/admin/audit-logs${query}`);
            const data = response.data.data;
            setLogs(data.logs || []);
            setTotalPages(data.totalPages || 1);
            setTotalLogs(data.total || 0);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300); // Debounced search
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({
            actionType: '',
            role: '',
            status: '',
            startDate: '',
            endDate: ''
        });
        setSearchTerm('');
        setPage(1);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'FAILED': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'WARNING': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getActionBadge = (type) => {
        if (type.includes('ELECTION')) return 'bg-blue-50 text-blue-700 border-blue-100';
        if (type.includes('VOTE')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        if (type.includes('AUTH') || type.includes('LOGIN')) return 'bg-purple-50 text-purple-700 border-purple-100';
        if (type.includes('SECURITY')) return 'bg-rose-50 text-rose-700 border-rose-100';
        return 'bg-gray-50 text-gray-700 border-gray-100';
    };

    return (
        <div className="p-1 md:p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        Activity History
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Secure and permanent record of all system activities and monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm border ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Action Type</label>
                                <select
                                    name="actionType"
                                    value={filters.actionType}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                                >
                                    <option value="">All Actions</option>
                                    <option value="ELECTION_CREATED">Election Created</option>
                                    <option value="ELECTION_UPDATED">Election Updated</option>
                                    <option value="ELECTION_DELETED">Election Deleted</option>
                                    <option value="VOTE_CAST">Vote Cast</option>
                                    <option value="USER_LOGIN">User Login</option>
                                    <option value="LOGIN_FAILED">Login Failed</option>
                                    <option value="SYSTEM_NOTIFICATION">System Alert</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                                <select
                                    name="role"
                                    value={filters.role}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="owner">Owner</option>
                                    <option value="voter">Voter</option>
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
                                    <option value="SUCCESS">Success</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="WARNING">Warning</option>
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
                                    <X className="w-4 h-4" /> Reset
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by action keyword, user name..."
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[24px] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                <p className="text-sm font-bold text-slate-500">Retrieving system logs...</p>
                            </div>
                        </div>
                    )}
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Related Election</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr
                                        key={log._id}
                                        className="group transition-all hover:bg-slate-50"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                    {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-medium ml-5 mt-0.5">
                                                    {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-black text-slate-600 border border-white shadow-sm">
                                                    {log.actor?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{log.actor?.name || 'System Operator'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                {log.metadata?.ip || '0.0.0.0'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${log.actor?.role === 'admin' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                                                    log.actor?.role === 'owner' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                                        log.actor?.role === 'voter' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' :
                                                            'text-slate-500 bg-slate-50 border-slate-100'
                                                } border`}>
                                                {log.actor?.role || 'SYSTEM'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex w-fit px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getActionBadge(log.actionType)}`}>
                                                    {log.actionType.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium line-clamp-1">{log.message}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                                                    {log.electionId?.title || 'System Level Action'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${getStatusColor(log.status)}`}>
                                                {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                {log.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-full scale-125">
                                                    <Database className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-slate-900">No logs found</p>
                                                    <p className="text-xs text-slate-500 font-medium">Try adjusting your filters or search term.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-sm font-bold text-slate-700">
                            Total Records: {totalLogs}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-2 text-xs font-bold text-slate-500">
                            Page {page} of {totalPages}
                        </div>

                        <button
                            disabled={page === totalPages || loading}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Audit;
