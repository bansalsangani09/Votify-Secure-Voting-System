import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import socket from '../../utils/socket';
import NotificationDropdown from './NotificationDropdown';
import {
    Plus,
    Search,
    Bell,
    User,
    Moon,
    Sun,
    Menu,
    ChevronDown,
    LogOut,
    PlusCircle,
    Command,
    Shield,
    Vote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ toggleSidebar, onAddClick, userRole }) => {
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
        <header className="h-20 glass fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between transition-all duration-300">
            {/* Left: Logo & Search */}
            <div className="flex items-center gap-6 flex-1">
                <button
                    onClick={toggleSidebar}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden text-slate-500"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="group-hover:scale-110 transition-transform duration-300">
                        <img src="/logo.svg" alt="Votify Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white hidden sm:block tracking-tight">
                        Votify
                    </span>
                </div>


            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
                {userRole !== 'admin' && (
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-2 premium-gradient hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
                    >
                        <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden sm:inline">New Election</span>
                    </button>
                )}

                <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Dark Mode */}
                    <button
                        onClick={() => {
                            setIsDarkMode(!isDarkMode);
                            document.documentElement.classList.toggle('dark');
                        }}
                        className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-all ${showNotifications ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'text-slate-400'}`}
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

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden ring-2 ring-white dark:ring-slate-800">
                                {user?.photoUrl ? (
                                    <img
                                        src={`${user.photoUrl}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs">{user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}</span>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 hidden md:block ${showProfileDropdown ? 'rotate-180' : ''}`} />
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">My Profile</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            <button
                                                onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all group"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Safety & Security
                                            </button>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 px-2">
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

