import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Vote, ShieldCheck, Zap, Globe, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const VoterResults = ({ data }) => {
    const isClosed = data?.status === 'closed';
    const liveResultsEnabled = data?.liveResultsEnabled ?? data?.allowLiveResults;
    const publicResultsVisible = data?.publicResultsVisible ?? false;

    if (!isClosed && (!liveResultsEnabled || !publicResultsVisible)) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Access Restricted</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
                    Live telemetry is currently disabled for this election. Standings will be broadcasted once the polls officially close.
                </p>
                <div className="mt-8 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure Data Isolation
                </div>
            </motion.div>
        );
    }

    const candidates = data?.candidates || [];
    const isRanked = data?.votingType === 'Ranked Voting';
    const totalPoints = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 0;
    const totalParticipants = data?.participants?.length || 0;
    const turnout = totalParticipants > 0 && !isRanked ? ((totalPoints / totalParticipants) * 100).toFixed(1) : (totalParticipants > 0 ? '100.0' : '0');

    const standings = candidates.map((c, i) => {
        const percentage = totalPoints > 0 ? Math.round((c.voteCount || 0) / totalPoints * 100) : 0;
        return {
            name: c.name,
            partyName: c.partyName || 'Independent',
            points: c.voteCount || 0,
            gradient: i === 0 ? 'from-blue-600 to-indigo-600' : i === 1 ? 'from-slate-400 to-slate-500' : 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600',
            percentage
        };
    }).sort((a, b) => b.points - a.points);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-[1200px] mx-auto pb-12">
            {/* STATUS BAR */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between glass px-8 py-5 rounded-[32px] border border-white/50 dark:border-slate-800 shadow-xl gap-4"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-25"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.6)]"></div>
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            Live Stream Protocol
                            <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] rounded-md animate-pulse">LIVE</span>
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time data synchronization enabled</p>
                    </div>
                </div>
                <div className="flex items-center gap-8 px-6 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Aggregate Data</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {totalPoints.toLocaleString()} <span className="text-[10px] opacity-40 font-bold">{isRanked ? 'POINTS' : 'VOTES'}</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* STANDINGS CARD */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 premium-card p-10 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute -top-20 -right-20 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <BarChart3 className="w-64 h-64 text-blue-500" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4 relative z-10">
                        <div className="p-3 premium-gradient rounded-2xl shadow-xl shadow-blue-500/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        Leaderboard Standings
                        {isRanked && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest ml-4">Weighted Points</span>}
                    </h3>

                    <div className="space-y-10 relative z-10">
                        {standings.map((c, i) => (
                            <div key={i} className="group/item">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-lg shadow-lg border-b-4 
                                            ${i === 0 ? 'bg-amber-100 text-amber-600 border-amber-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                                {c.name}
                                                {i === 0 && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Majority</span>}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                                                {c.partyName} • {c.points.toLocaleString()} {isRanked ? 'Points' : 'Votes'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{c.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200 dark:border-slate-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${c.percentage}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                                        className={`h-full bg-gradient-to-r ${c.gradient} rounded-full transition-all group-hover/item:brightness-110 shadow-lg`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-slate-900 dark:bg-blue-600 rounded-[32px] shadow-2xl relative overflow-hidden group/notice">
                        <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12 group-hover/notice:rotate-45 transition-transform duration-700">
                            <Zap className="w-16 h-16 text-white" />
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white border border-white/20">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-lg tracking-tight">Electoral Integrity</h4>
                                <p className="text-blue-100/80 text-xs mt-1 font-bold leading-relaxed">
                                    Standalone results are verified against cryptographical hashes. Every vote is signed with an immutable unique identification.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* STATS SUMMARY */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="premium-card p-10"
                    >
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                            Engagement Metrics
                        </h4>

                        <div className="space-y-8">
                            <StatBox
                                icon={<Users className="w-5 h-5" />}
                                label="Total Stakeholders"
                                value={totalParticipants.toLocaleString()}
                                sub="Verified Identities"
                                color="blue"
                            />
                            <StatBox
                                icon={<BarChart3 className="w-5 h-5" />}
                                label="Poll Turnout"
                                value={`${turnout}%`}
                                sub="Active Participation"
                                color="emerald"
                            />
                            <StatBox
                                icon={<Clock className="w-5 h-5" />}
                                label="Lifecycle Status"
                                value={data?.status || 'Active'}
                                sub="Election Progress"
                                color="indigo"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="premium-gradient p-[2px] rounded-[40px] shadow-2xl shadow-blue-500/20"
                    >
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[38px] relative overflow-hidden group/trans">
                            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover/trans:opacity-[0.03] transition-opacity" />
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-5 h-5 text-blue-500 animate-spin-slow" />
                                <h5 className="font-black text-slate-900 dark:text-white tracking-tight">Network Transparency</h5>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                These results represent the current consensus of the decentralized ledger. Final auditing will occur upon the official certification ceremony.
                            </p>
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol V2.4</span>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ icon, label, value, sub, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/10',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/10',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/10'
    };

    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 duration-500 ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{label}</span>
                    <p className="text-sm font-black text-slate-500 dark:text-slate-400 leading-none">{sub}</p>
                </div>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</span>
        </div>
    );
};

export default VoterResults;
