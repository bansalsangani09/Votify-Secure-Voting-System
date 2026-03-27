import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import socket from '../../utils/socket';
import NotificationDropdown from '../../voter/components/NotificationDropdown';
import {
    Bell,
    Search,
    ChevronDown,
    Moon,
    Sun,
    LogOut,
    Activity,
    Search as SearchIcon,
    User,
    Shield,
    Settings,
    HelpCircle,
    Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    useEffect(() => {
        if (!user?._id) return;

        socket.connect();
        socket.emit('join', user._id);

        socket.on('newNotification', (data) => {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        fetchNotifications();
        fetchUnreadCount();

        return () => {
            socket.off('newNotification');
            socket.disconnect();
        };
    }, [user?._id]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            if (res.data.success) {
                setUnreadCount(res.data.count);
            }
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const res = await api.patch(`/notifications/${id}/read`);
            if (res.data.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await api.patch('/notifications/read-all');
            if (res.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-20 glass sticky top-0 z-20 px-8 flex items-center justify-between transition-all duration-300">
            {/* Left Section: Context & Search */}
            <div className="flex items-center gap-10 flex-1">
                <div className="hidden md:flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5">
                        Current System
                    </p>
                    <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        National Election 2026
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    </h1>
                </div>
            </div>

            {/* Right Section: Actions & User */}
            <div className="flex items-center gap-6">
                {/* Status Badges */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">System Secure</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>

                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => {
                            setIsDarkMode(!isDarkMode);
                            document.documentElement.classList.toggle('dark');
                        }}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-all ${showNotifications ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600' : 'text-slate-400'}`}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 z-50"
                                >
                                    <NotificationDropdown
                                        notifications={notifications}
                                        onClose={() => setShowNotifications(false)}
                                        onMarkAsRead={handleMarkAsRead}
                                        onMarkAllRead={handleMarkAllRead}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden ring-2 ring-white dark:ring-slate-800 transition-all group-hover:ring-blue-100">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                                )}
                            </div>
                            <div className="hidden xl:block text-left">
                                <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
                                    System {user?.role || 'Staff'}
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showProfileDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-card-light dark:bg-card-dark rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50 overflow-hidden"
                                    >
                                        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 mb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Account</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            {[
                                                { label: 'My Profile', icon: User, path: '/admin/profile' },
                                                { label: 'System Settings', icon: Settings, path: '/admin/settings' },
                                                { label: 'Security Audit', icon: Shield, path: '/admin/audit' },
                                                { label: 'Help & Support', icon: HelpCircle, path: '#' },
                                            ].map((item) => (
                                                <button
                                                    key={item.label}
                                                    onClick={() => { if (item.path !== '#') navigate(item.path); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all group"
                                                >
                                                    <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 px-2 text-center">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Log Out
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

