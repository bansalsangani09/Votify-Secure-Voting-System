import React, { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    UserSquare2,
    Activity,
    BarChart3,
    Database,
    ShieldCheck,
    Settings,
    ChevronLeft,
    ChevronRight,
    Vote,
    Menu,
    X,
    LogOut,
    Power,
    HelpCircle
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Overview', icon: FileText, path: '/admin/elections' },
        { name: 'Candidates', icon: UserSquare2, path: '/admin/candidates' },
        { name: 'Voters', icon: Users, path: '/admin/voters' },
        { name: 'Owners', icon: ShieldCheck, path: '/admin/owners' },
        { name: 'Live Monitoring', icon: Activity, path: '/admin/monitoring' },
        { name: 'Results', icon: BarChart3, path: '/admin/results' },
        { name: 'Permanent Records', icon: Database, path: '/admin/blockchain' },
        { name: 'Security Logs', icon: ShieldCheck, path: '/admin/audit' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? 88 : 280 }}
            className="h-screen sticky top-0 bg-card-light dark:bg-card-dark border-r border-slate-100 dark:border-slate-800 flex flex-col z-30 transition-colors duration-300"
        >
            {/* Logo Section */}
            <div className="p-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-1 rounded-xl">
                        <img src="/logo.svg" alt="Votify Logo" className="w-14 h-14 object-contain" />
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                Votify
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">
                                Admin Panel
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                {!isCollapsed && (
                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                        Main Menu
                    </p>
                )}
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 rounded-2xl -z-10 border border-blue-100/50 dark:border-blue-500/10"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                {!isCollapsed && (
                                    <span className="text-sm font-semibold tracking-tight">
                                        {item.name}
                                    </span>
                                )}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute right-4 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Section */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {!isCollapsed && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-2">
                        <div className="flex items-center gap-3 mb-2 text-slate-900 dark:text-white">
                            <HelpCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold">Need Help?</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Check our documentation or contact support for assistance.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl flex items-center justify-center transition-all group"
                >
                    {isCollapsed ?
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" /> :
                        <div className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-xs font-bold">Collapse Sidebar</span>
                        </div>
                    }
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;

