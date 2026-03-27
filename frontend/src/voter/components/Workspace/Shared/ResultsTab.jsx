import React from 'react';
import { Award, Download, PieChart, BarChart3, ChevronRight, TrendingUp, Users, Vote, ShieldCheck, Clock } from 'lucide-react';

import CountUp from 'react-countup';
import { motion } from 'framer-motion';


const ResultsTab = ({ data, isOwner }) => {
    const isClosed = data?.status === 'closed';
    const liveResultsEnabled = data?.liveResultsEnabled ?? data?.allowLiveResults;
    const publicResultsVisible = data?.publicResultsVisible ?? false;

    // Logic:
    // 1. If closed, everyone sees.
    // 2. If open:
    //    - Owner sees only if liveResultsEnabled is true.
    //    - Voter sees only if liveResultsEnabled AND publicResultsVisible are true.
    const canSee = isClosed || (isOwner ? liveResultsEnabled : (liveResultsEnabled && publicResultsVisible));

    if (!canSee) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-24 max-w-2xl mx-auto"
            >
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg border border-indigo-100">
                    <Clock className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Results Hidden</h3>
                <p className="text-gray-500 text-center text-lg max-w-md leading-relaxed">
                    Live results are disabled for this election. The final verified results will be available immediately after the voting period ends.
                </p>
            </motion.div>
        );
    }

    const candidates = data?.candidates || [];
    const isRanked = data?.votingType === 'Ranked Voting';
    const totalPoints = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 0;
    const totalParticipants = data?.participants?.length || 0;
    const turnout = totalParticipants > 0 && !isRanked ? ((totalPoints / totalParticipants) * 100).toFixed(1) : (totalParticipants > 0 ? '100.0' : '0');

    // Sort to find the winner/leader
    const sortedCandidates = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const winner = sortedCandidates[0] || { name: 'No candidates', voteCount: 0 };
    const winnerShare = totalPoints > 0 ? ((winner.voteCount / totalPoints) * 100).toFixed(1) : '0';

    const standings = sortedCandidates.map((c, i) => {
        const percentage = totalPoints > 0 ? Math.round((c.voteCount || 0) / totalPoints * 100) : 0;
        return {
            name: c.name,
            points: c.voteCount || 0,
            color: i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-blue-500' : 'bg-gray-300',
            percentage,
            photoUrl: c.photoUrl
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-6xl mx-auto"
        >
            {/* Winner Hero Card */}
            <div className="relative p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-indigo-100 overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest">
                            <Award className="w-4 h-4 text-amber-300" /> Current Leader
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{winner.name}</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{isRanked ? 'Total Points' : 'Total Votes'}</span>
                                <span className="text-2xl font-black">{winner.voteCount}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-white/20"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{isRanked ? 'Points Share' : 'Vote Share'}</span>
                                <span className="text-2xl font-black">
                                    <CountUp end={parseFloat(winnerShare)} decimals={1} duration={1.2} />%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-48 h-48 bg-white/10 backdrop-blur-2xl rounded-[40px] border-4 border-white/20 p-2 transform rotate-3 group-hover:rotate-0 transition-transform duration-700">
                        <img src={winner.photoUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${winner.name}`} alt="Winner" className="w-full h-full object-cover rounded-[32px]" />
                    </div>
                </div>
                <Award className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-1000" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Standings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                                Current Standings
                            </h3>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Live Updates</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {standings.map((c, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-50 group-hover:border-indigo-100 transition-all">
                                                <img src={c.photoUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${c.name}`} alt={c.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
                                                    {c.name} {i === 0 && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Leader</span>}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{c.points} {isRanked ? 'Points' : 'Votes'}</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black text-gray-900 leading-none">
                                            <CountUp end={c.percentage} duration={1} />%
                                        </span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${c.percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full ${c.color} rounded-full shadow-sm`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isOwner && (
                        <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-center gap-6">
                            <div className="bg-white p-4 rounded-3xl shadow-sm text-indigo-600">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 text-lg tracking-tight">Voter Information</h4>
                                <p className="text-indigo-600/70 text-sm mt-1">Results are cryptographically verified and recorded on the immutable ledger. Accuracy is guaranteed.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats & Actions Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Participation Summary</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-gray-600">Total Voters</span>
                                </div>
                                <span className="text-sm font-black text-gray-800">
                                    <CountUp end={totalParticipants} separator="," duration={1.5} />
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><BarChart3 className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-gray-600">{isRanked ? 'Total Points' : 'Total Votes'}</span>
                                </div>
                                <span className="text-sm font-black text-indigo-600">
                                    <CountUp end={totalPoints} separator="," duration={1.5} />
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-gray-600">Turnout %</span>
                                </div>
                                <span className="text-sm font-black text-green-600">
                                    <CountUp end={parseFloat(turnout)} decimals={1} duration={1.5} />%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-gray-600">Election Status</span>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-lg">
                                    {data?.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default ResultsTab;
