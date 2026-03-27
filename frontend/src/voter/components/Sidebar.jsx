import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderPlus,
    Calendar,
    Settings,
    Activity,
    BarChart3,
    Users,
    ChevronRight,
    Vote,
    Clock,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, createdElections = [], participatingElections = [] }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00' });
    const [nextElection, setNextElection] = useState(null);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BarChart3, label: 'Results', path: '/results' },
        { icon: Calendar, label: 'Calendar', path: '/activity' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    useEffect(() => {
        const calculateNextElection = () => {
            const allElections = [...createdElections, ...participatingElections];
            const activeElections = allElections.filter(e => e.status === 'active' && new Date(e.endDate) > new Date());

            if (activeElections.length === 0) {
                setNextElection(null);
                return;
            }

            activeElections.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            setNextElection(activeElections[0]);
        };

        calculateNextElection();
    }, [createdElections, participatingElections]);

    useEffect(() => {
        if (!nextElection) return;

        const timer = setInterval(() => {
            const total = Date.parse(nextElection.endDate) - Date.parse(new Date());
            if (total <= 0) {
                setTimeLeft({ days: '00', hours: '00' });
                clearInterval(timer);
                return;
            }

            const days = Math.floor(total / (1000 * 60 * 60 * 24));
            const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

            setTimeLeft({
                days: days.toString().padStart(2, '0'),
                hours: hours.toString().padStart(2, '0')
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [nextElection]);

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group relative
                ${isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
            `}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="voter-active-pill"
                            className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 rounded-2xl -z-10 border border-blue-100/50 dark:border-blue-500/10"
                        />
                    )}
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    <span className="tracking-tight">{item.label}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <aside className={`
            fixed left-0 top-20 bottom-0 w-72 bg-card-light dark:bg-card-dark border-r border-slate-100 dark:border-slate-800 transition-all duration-500 z-40
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="h-full overflow-y-auto py-8 px-5 no-scrollbar flex flex-col">

                {/* Main Menu */}
                <div className="space-y-1 mb-10">
                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                        General
                    </p>
                    {menuItems.slice(0, 1).map((item) => <NavItem key={item.path} item={item} />)}
                </div>

                {/* My Workspace */}
                <div className="flex-1 space-y-8">
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                            My Workspace
                        </p>

                        <div className="space-y-4">
                            {/* Created Elections Section */}
                            {createdElections.length > 0 && (
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 uppercase tracking-wider">
                                        <FolderPlus className="w-4 h-4 text-blue-500" />
                                        <span>Created</span>
                                        <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                                    </button>
                                    <div className="pl-11 space-y-2">
                                        {createdElections.map(election => (
                                            <NavLink
                                                key={election.id}
                                                to={`/election/${election.id}`}
                                                className="block py-1 text-xs font-medium text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                                            >
                                                {election.title}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Participating Section */}
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 uppercase tracking-wider">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    <span>Participating</span>
                                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                                </button>
                                <div className="pl-11 space-y-2">
                                    {participatingElections.length > 0 ? (
                                        participatingElections.map(election => (
                                            <NavLink
                                                key={election.id}
                                                to={`/election/${election.id}`}
                                                className="block py-1 text-xs font-medium text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                                            >
                                                {election.title}
                                            </NavLink>
                                        ))
                                    ) : (
                                        <span className="block py-1 text-[10px] font-bold italic text-slate-300 dark:text-slate-600 tracking-tight">No elections joined</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 py-4 border-t border-slate-100 dark:border-slate-800">
                        {menuItems.slice(1).map((item) => <NavItem key={item.path} item={item} />)}
                    </div>
                </div>

                {/* Countdown Widget */}
                <AnimatePresence>
                    {nextElection && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 px-2"
                        >
                            <div className="premium-gradient rounded-[32px] p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-100">Voting Countdown</p>
                                    </div>

                                    <h4 className="text-white font-bold text-xs mb-4 line-clamp-1 opacity-80">{nextElection.title}</h4>

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-center flex-1 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                            <p className="text-2xl font-black text-white leading-none">{timeLeft.days}</p>
                                            <p className="text-[8px] font-bold text-blue-200 mt-2 uppercase tracking-widest">Days</p>
                                        </div>
                                        <div className="text-center flex-1 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                            <p className="text-2xl font-black text-white leading-none">{timeLeft.hours}</p>
                                            <p className="text-[8px] font-bold text-blue-200 mt-2 uppercase tracking-widest">Hours</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/election/${nextElection.id}`)}
                                        className="w-full mt-5 py-3.5 bg-white text-blue-600 rounded-xl text-[11px] font-black hover:bg-blue-50 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Vote className="w-3.5 h-3.5" />
                                        Cast Your Vote
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
};

export default Sidebar;

