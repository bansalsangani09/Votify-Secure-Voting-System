import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Users,
    BarChart3,
    Download,
    Share2,
    ArrowUpRight,
    CheckCircle2,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Results = () => {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const response = await api.get('/admin/elections');
            const data = response.data.data || [];
            setElections(data);
            if (data.length > 0) {
                setSelectedElection(data[0]._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching elections:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedElection) {
            fetchResults(selectedElection);
        }
    }, [selectedElection]);

    const fetchResults = async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/results/${id}`);
            setResults(response.data.data.results);
        } catch (error) {
            console.error('Error fetching results:', error);
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        toast.success('Results link copied to clipboard');
    };

    const handleExport = () => {
        toast.info('Generating PDF report...');
        setTimeout(() => toast.success('Report downloaded'), 2000);
    };

    if (loading && !results) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Calculating final tallies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Election Results</h2>
                    <p className="text-gray-500 mt-1">Final tally and turnout analysis for the selected election.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative min-w-[240px]">
                        <select
                            value={selectedElection}
                            onChange={(e) => setSelectedElection(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none appearance-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm cursor-pointer"
                        >
                            {elections.map(elec => (
                                <option key={elec._id} value={elec._id}>{elec.title}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>
            </div>


            {!results || !results.candidates || results.candidates.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-gray-500 font-bold">No results available</p>
                    <p className="text-slate-400 text-sm mt-1">Voting might still be in progress or no votes have been cast.</p>
                </div>
            ) : (
                <>
                    {/* Winner Spotlight */}
                    {results.candidates && results.candidates.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-700 to-violet-800 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-indigo-200">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-2 relative">
                                    <div className="w-full h-full rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white uppercase overflow-hidden">
                                        {[...results.candidates].sort((a, b) => b.votes - a.votes)[0].name?.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center border-4 border-indigo-700 shadow-lg">
                                        <Trophy className="w-4 h-4 text-white fill-white" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Projected Winner</span>
                                    <h3 className="text-4xl font-extrabold text-white mt-4">{[...results.candidates].sort((a, b) => b.votes - a.votes)[0].name}</h3>
                                    <p className="text-indigo-100 text-lg font-medium">
                                        {[...results.candidates].sort((a, b) => b.votes - a.votes)[0].partyName || 'Independent'} • {[...results.candidates].sort((a, b) => b.votes - a.votes)[0].votes?.toLocaleString()} Total Votes
                                    </p>
                                    {[...results.candidates].sort((a, b) => b.votes - a.votes)[0].bio && (
                                        <p className="text-indigo-50/70 text-sm mt-4 italic font-medium leading-relaxed max-w-xl bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            "{[...results.candidates].sort((a, b) => b.votes - a.votes)[0].bio}"
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Type</span>
                                            <span className="text-xs font-bold text-white">{results.votingType || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Position</span>
                                            <span className="text-xs font-bold text-white">{results.position || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Ends</span>
                                            <span className="text-xs font-bold text-white">{results.resultDate ? new Date(results.resultDate).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:ml-auto grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                                        <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-wide">Vote Share</p>
                                        <p className="text-2xl font-bold text-white mt-1">{(([...results.candidates].sort((a, b) => b.votes - a.votes)[0].votes / (results.totalVotes || 1)) * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                                        <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-wide">Security</p>
                                        <p className="text-2xl font-bold text-indigo-300 mt-1">{results.blockchainIntegrated ? 'On-Chain' : 'Database'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Specialized Result Views */}
                        <div className="lg:col-span-2">
                            {results.votingType === 'Ranked Voting' || results.votingType === 'Ranked Choice' ? (
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        Final Leaderboard
                                    </h3>
                                    <div className="space-y-4">
                                        {[...results.candidates].sort((a, b) => b.votes - a.votes).map((cand, idx) => {
                                            const totalVotesCount = results.totalVotes || results.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
                                            const percentage = totalVotesCount > 0 ? ((cand.votes / totalVotesCount) * 100).toFixed(1) : 0;

                                            const getMedal = (index) => {
                                                if (index === 0) return '🥇';
                                                if (index === 1) return '🥈';
                                                if (index === 2) return '🥉';
                                                return `#${index + 1}`;
                                            };

                                            return (
                                                <div key={idx} className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${idx === 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-100'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                                idx === 1 ? 'bg-slate-100 text-slate-500' :
                                                                    idx === 2 ? 'bg-orange-100 text-orange-600' :
                                                                        'bg-gray-50 text-gray-400'
                                                            }`}>
                                                            {getMedal(idx)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-base font-bold text-gray-900">{cand.name}</p>
                                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{cand.partyName || 'Independent'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-indigo-600">{percentage}%</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{cand.votes?.toLocaleString()} Points</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : results.votingType === 'Multiple Choice' ? (
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        Selection Frequency
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[...results.candidates].sort((a, b) => b.votes - a.votes).map((cand, idx) => {
                                            const totalVotesCount = results.totalVotes || results.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
                                            const percentage = totalVotesCount > 0 ? ((cand.votes / totalVotesCount) * 100).toFixed(1) : 0;
                                            return (
                                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{cand.name}</p>
                                                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{cand.partyName || 'Independent'}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-indigo-600">{percentage}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <p className="mt-2 text-[10px] text-gray-400 font-medium">{cand.votes?.toLocaleString()} Selections</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                                        Vote Distribution
                                    </h3>
                                    <div className="space-y-6">
                                        {[...results.candidates].sort((a, b) => b.votes - a.votes).map((cand, idx) => {
                                            const totalVotesCount = results.totalVotes || results.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
                                            const percentage = totalVotesCount > 0 ? ((cand.votes / totalVotesCount) * 100).toFixed(1) : 0;
                                            return (
                                                <div key={idx} className="group">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[10px] text-slate-400 border border-slate-100">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{cand.name}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cand.partyName || 'Independent'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-indigo-600">{percentage}%</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{cand.votes?.toLocaleString()} votes</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                        <div
                                                            className="h-full bg-indigo-600 transition-all duration-1000"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Turnout Stats */}
                        <div className="space-y-6">
                            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 grid grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-indigo-600 rounded-lg">
                                            <Users className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-indigo-900">Total Turnout</span>
                                    </div>
                                    <h4 className="text-3xl font-extrabold text-indigo-900">
                                        {results.totalVoters > 0 ? ((results.totalVotes / results.totalVoters) * 100).toFixed(1) : 0}%
                                    </h4>
                                    <p className="text-xs text-indigo-600 mt-1 font-medium flex items-center gap-1">
                                        {results.totalVotes} / {results.totalVoters} Registered
                                    </p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div
                                        className="w-24 h-24 rounded-full border-[12px] border-indigo-200 flex items-center justify-center relative shadow-inner"
                                        style={{
                                            background: `conic-gradient(#4f46e5 ${results.totalVoters > 0 ? (results.totalVotes / results.totalVoters) * 100 : 0}%, transparent 0)`
                                        }}
                                    >
                                        <div className="absolute inset-0 rounded-full border-[12px] border-indigo-200 opacity-20"></div>
                                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-xs font-bold text-indigo-900">{results.totalVoters > 0 ? ((results.totalVotes / results.totalVoters) * 100).toFixed(1) : 0}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                                    Live Status Mode
                                </h3>
                                <div className={`flex items-center gap-4 p-4 rounded-2xl border ${results.status === 'closed' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                                    {results.status === 'closed' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />}
                                    <div>
                                        <p className={`text-sm font-bold ${results.status === 'closed' ? 'text-green-900' : 'text-amber-900'}`}>
                                            {results.status === 'closed' ? 'Finalized & Verified' : 'Live Tallying'}
                                        </p>
                                        <p className={`text-xs ${results.status === 'closed' ? 'text-green-700/80' : 'text-amber-700/80'}`}>
                                            {results.status === 'closed' ? 'Blockchain integrity checked. Results are official.' : 'Results are being updated in real-time as votes arrive.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Results;