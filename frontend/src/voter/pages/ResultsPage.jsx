import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import ResultsTab from '../components/Workspace/Shared/ResultsTab';
import { Loader2, Search, Filter, BarChart3, ChevronRight, Trophy, Vote, Check, X } from 'lucide-react';

const ResultsPage = () => {
    const { user } = useContext(AuthContext);
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'scheduled', 'closed'
    const [filterOwnership, setFilterOwnership] = useState('all'); // 'all', 'owned', 'joined'
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                setLoading(true);
                const res = await api.get('/elections/my');
                if (res.data.success) {
                    // Combine created and joined elections
                    const combined = [
                        ...res.data.data.created.map(e => ({ ...e, isOwner: true })),
                        ...res.data.data.joined.map(e => ({ ...e, isOwner: false }))
                    ];
                    setElections(combined);

                    // Auto-select first if available
                    if (combined.length > 0) {
                        fetchElectionDetails(combined[0]._id, combined[0].isOwner);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch elections:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchElections();
    }, []);

    const fetchElectionDetails = async (id, isOwner) => {
        try {
            setLoadingResults(true);
            const res = await api.get(`/elections/${id}`);
            if (res.data.success) {
                setSelectedElection({ ...res.data.data, isOwner });
            }
        } catch (err) {
            console.error('Failed to fetch election details:', err);
        } finally {
            setLoadingResults(false);
        }
    };

    const filteredElections = elections.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
        const matchesOwnership = filterOwnership === 'all' ||
            (filterOwnership === 'owned' ? e.isOwner : !e.isOwner);

        return matchesSearch && matchesStatus && matchesOwnership;
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Election Results</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Live standings and final tally for all your campaigns.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-[20px] blur-xl group-focus-within:bg-indigo-500/10 transition-all duration-500"></div>
                        <div className="relative flex items-center">
                            <Search className={`absolute left-4 w-4 h-4 transition-all duration-300 ${searchQuery ? 'text-indigo-600 scale-110' : 'text-gray-400 group-focus-within:text-indigo-600'}`} />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-[20px] pl-11 pr-10 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 transition-all w-full md:w-64 placeholder:text-gray-400 shadow-sm hover:shadow-md"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-3 border rounded-2xl transition-all ${isFilterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600 hover:shadow-sm'}`}
                        >
                            <Filter className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-3 w-64 bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-indigo-100/50 p-6 z-50 space-y-6"
                                >
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Election Status</h4>
                                        <div className="space-y-1">
                                            {[
                                                { id: 'all', label: 'All Status' },
                                                { id: 'active', label: 'Active Only' },
                                                { id: 'scheduled', label: 'Upcoming' },
                                                { id: 'closed', label: 'Completed' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFilterStatus(opt.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${filterStatus === opt.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                    {filterStatus === opt.id && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Role / Ownership</h4>
                                        <div className="space-y-1">
                                            {[
                                                { id: 'all', label: 'All Roles' },
                                                { id: 'owned', label: '👑 Owned' },
                                                { id: 'joined', label: '🗳 Joined' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFilterOwnership(opt.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${filterOwnership === opt.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                    {filterOwnership === opt.id && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                                    >
                                        Apply Filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Election List Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Available Reports</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                        {filteredElections.length > 0 ? (
                            filteredElections.map((election) => (
                                <button
                                    key={election._id}
                                    onClick={() => fetchElectionDetails(election._id, election.isOwner)}
                                    className={`w-full text-left p-4 rounded-3xl transition-all border outline-none ${selectedElection?._id === election._id
                                        ? 'bg-white border-indigo-100 shadow-xl shadow-indigo-100/50'
                                        : 'bg-transparent border-transparent hover:bg-white/50 text-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${selectedElection?._id === election._id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <Vote className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 truncate">
                                            <p className={`text-sm font-black truncate ${selectedElection?._id === election._id ? 'text-gray-900' : 'text-gray-600'
                                                }`}>
                                                {election.title}
                                            </p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">
                                                {election.isOwner ? '👑 Owned' : '🗳 Joined'}
                                            </p>
                                        </div>
                                        {selectedElection?._id === election._id && (
                                            <ChevronRight className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-xs font-bold text-gray-400">No elections found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Display Area */}
                <div className="lg:col-span-3">
                    {loadingResults ? (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-4 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Standings...</p>
                        </div>
                    ) : selectedElection ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ResultsTab data={selectedElection} isOwner={selectedElection.isOwner} />
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                <BarChart3 className="w-10 h-10" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Select an Election</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 max-w-xs mx-auto">Pick a campaign from the list to view its real-time analytics and results recorded on the blockchain.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
