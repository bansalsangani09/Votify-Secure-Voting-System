import React from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Calendar,
    Clock,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    Globe,
    Lock as LockIcon,
    User,
    ChevronRight,
    Info,
    LayoutDashboard,
    Zap
} from "lucide-react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const VoterOverview = ({ data, onTabChange }) => {
    const startDate = data?.startDate ? new Date(data.startDate) : null;
    const endDate = data?.endDate ? new Date(data.endDate) : null;

    const owners = data?.admins?.filter(a => a.role === "owner") || [];
    const coOwners = data?.admins?.filter(a => a.role === "co-owner") || [];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto space-y-8 pb-12"
        >
            {/* ACTION CARD */}
            <motion.div
                variants={fadeUp}
                className="premium-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="w-32 h-32 text-blue-500" />
                </div>

                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 premium-gradient rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Ready to Vote?
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm
                                ${data?.status === 'active' ? 'bg-emerald-500 text-white' :
                                    data?.status === 'scheduled' ? 'bg-blue-500 text-white' :
                                        'bg-slate-500 text-white'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {data?.status === "active" ? (data?.userHasVoted ? "Vote Recorded" : "Voting Open") : data?.status}
                            </span>
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                Protected by secure system
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => data?.status !== 'closed' && onTabChange?.("vote")}
                    disabled={data?.status === 'closed'}
                    className={`relative z-10 w-full md:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                        ${data?.status === 'closed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:scale-[1.05] active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none'
                        } flex items-center justify-center gap-2 group/btn`}
                >
                    {data?.status === 'closed' ? 'Election Closed' : (data?.userHasVoted ? 'View Your Vote' : 'Cast Your Vote')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* IDENTITY CARD */}
                    <motion.div variants={fadeUp} className="premium-card p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Voter Profile</h3>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-800">
                                <ShieldCheck className="w-3 h-3" />
                                Authenticated
                            </span>
                        </div>

                        <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 group">
                            <div className="w-16 h-16 premium-gradient rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:scale-110 transition-transform">
                                {data?.currentUser?.name?.[0] || 'V'}
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white mb-1">{data?.currentUser?.name || 'Verified Voter'}</p>
                                <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                    <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">VID</span>
                                    {data?.currentUser?.id?.substring(0, 8)}...{data?.currentUser?.id?.slice(-8)}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CONTEXT CARD */}
                    <motion.div variants={fadeUp} className="premium-card p-8 group">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl group-hover:rotate-6 transition-transform">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            Election Information
                        </h3>

                        <div className="space-y-6">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                                {data?.description || "This election is conducted under strict security standards to ensure every vote is counted accurately and remains permanent once cast."}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                                            <LockIcon className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-amber-900 dark:text-amber-200 mb-1">Total Anonymity</p>
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-tight">Your identity is kept separate from your vote choice.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-5 rounded-2xl border transition-colors ${data?.liveResultsEnabled && data?.publicResultsVisible
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                                            {data?.liveResultsEnabled && data?.publicResultsVisible ? (
                                                <Globe className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <Info className="w-4 h-4 text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black mb-1 ${data?.liveResultsEnabled && data?.publicResultsVisible ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-slate-200'}`}>
                                                {data?.liveResultsEnabled && data?.publicResultsVisible ? 'Live Transparency' : 'Hidden Results'}
                                            </p>
                                            <p className={`text-[11px] font-medium leading-tight ${data?.liveResultsEnabled && data?.publicResultsVisible ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                                {data?.liveResultsEnabled && data?.publicResultsVisible
                                                    ? 'Real-time standings are broadcasted live to all stakeholders.'
                                                    : 'Standings are sealed until the polls officially close.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* SIDEBAR */}
                <div className="space-y-8">
                    {/* DATES CARD */}
                    <motion.div variants={fadeUp} className="premium-card p-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Timeline Status
                        </h3>

                        <div className="space-y-6">
                            <DateItem label="Start" date={startDate?.toLocaleString()} sub="Election Start" />
                            <div className="h-8 w-[2px] bg-slate-100 dark:bg-slate-800 ml-5" />
                            <DateItem label="End" date={endDate?.toLocaleString()} sub="Polls Close" highlighted />
                        </div>
                    </motion.div>

                    {/* AUTHORITY CARD */}
                    <motion.div variants={fadeUp} className="premium-card p-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                            Election Authority
                        </h3>

                        <div className="space-y-4">
                            {[...owners, ...coOwners].map((admin, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 premium-gradient text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                        {admin.userId?.name?.[0]?.toUpperCase() || "A"}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-0.5">
                                            {admin.role}
                                        </p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                            {admin.userId?.name || "Admin"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* BLOCKCHAIN BADGE */}
                    <motion.div variants={fadeUp} className="premium-gradient p-8 rounded-[32px] text-white shadow-2xl shadow-blue-500/30 group">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:rotate-12 transition-transform">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-black tracking-tight mb-2">Permanent Record</h4>
                        <p className="text-blue-100 text-[11px] font-bold leading-relaxed">
                            Every digital signature is verified against the system protocol to guarantee permanent and tamper-proof results.
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const DateItem = ({ label, date, sub, highlighted }) => (
    <div className="flex gap-5 group">
        <div className={`p-2.5 rounded-2xl shadow-sm transition-colors ${highlighted ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
            <Clock className="w-5 h-5" />
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className={`text-sm font-black mb-0.5 ${highlighted ? 'text-slate-900 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>{date || 'TBD'}</p>
            <p className="text-[10px] font-bold text-slate-400">{sub}</p>
        </div>
    </div>
);

const ArrowRight = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export default VoterOverview;
