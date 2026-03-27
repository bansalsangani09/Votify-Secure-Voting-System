import React from 'react';
import {
    BarChart3,
    Users,
    Settings,
    Activity,
    Vote,
    ShieldCheck,
    Eye,
    LayoutDashboard,
    Clock
} from 'lucide-react';

const ElectionHeader = ({ isOwner, activeTab, onTabChange, data }) => {
    const ownerTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates', icon: Activity },
        { id: 'people', label: 'People', icon: Users },
        { id: 'live', label: 'Live', icon: Eye },
        { id: 'results', label: 'Results', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const voterTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'vote', label: 'Vote', icon: Vote },
        { id: 'results', label: 'Results', icon: BarChart3 },
        { id: 'proof', label: 'Proof', icon: ShieldCheck },
    ];

    const tabs = isOwner ? ownerTabs : voterTabs;

    const getTimeRemaining = (endDate) => {
        if (!endDate) return 'N/A';
        const total = Date.parse(endDate) - Date.parse(new Date());
        if (total <= 0) return 'Ended';

        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    const statusConfig = {
        active: { label: 'Live Now', class: 'bg-emerald-500 shadow-emerald-500/20', dot: 'bg-white animate-pulse' },
        paused: { label: 'Paused', class: 'bg-amber-500 shadow-amber-500/20', dot: 'bg-white' },
        scheduled: { label: 'Upcoming', class: 'bg-blue-500 shadow-blue-500/20', dot: 'bg-blue-100' },
        closed: { label: 'Closed', class: 'bg-slate-500 shadow-slate-500/20', dot: 'bg-slate-200' },
        ended: { label: 'Ended', class: 'bg-slate-500 shadow-slate-500/20', dot: 'bg-slate-200' }
    };

    const currentStatus = statusConfig[data?.status] || statusConfig.active;

    return (
        <div className="glass sticky top-20 z-30 p-4 sm:p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group hover:rotate-12 transition-transform duration-500">
                        <Vote className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{data?.title || 'Loading Election...'}</h1>
                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 ${currentStatus.class} shadow-lg`}>
                                <div className={`w-1 h-1 rounded-full ${currentStatus.dot}`} />
                                {currentStatus.label}
                            </div>
                        </div>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            {isOwner ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                            {isOwner ? 'Verified Administrator' : 'Verified Voter'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50 self-start md:self-center">
                    <div className="px-4 py-2 flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                            <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time Remaining</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{getTimeRemaining(data?.endDate)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/30 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all duration-300 whitespace-nowrap group
                            ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'}
                        `}
                    >
                        <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default ElectionHeader;
