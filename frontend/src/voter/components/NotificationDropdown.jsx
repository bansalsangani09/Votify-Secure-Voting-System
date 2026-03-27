import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Check,
    Clock,
    X,
    CheckCircle2,
    PauseCircle,
    PlayCircle,
    AlertCircle,
    UserPlus,
    UserCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
    ELECTION_STARTED: <PlayCircle className="w-4 h-4 text-green-500" />,
    ELECTION_PAUSED: <PauseCircle className="w-4 h-4 text-amber-500" />,
    ELECTION_RESUMED: <PlayCircle className="w-4 h-4 text-green-500" />,
    ELECTION_ENDED: <AlertCircle className="w-4 h-4 text-red-500" />,
    VOTE_SUCCESS: <CheckCircle2 className="w-4 h-4 text-indigo-500" />,
    ELECTION_JOINED: <UserPlus className="w-4 h-4 text-blue-500" />,
    ADMIN_ADDED: <UserCircle className="w-4 h-4 text-purple-500" />
};

const NotificationDropdown = ({
    notifications,
    onClose,
    onMarkAsRead,
    onMarkAllRead
}) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-16 right-0 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[60]"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onMarkAllRead}
                            className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            Mark all read
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 dark:text-gray-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => !notif.isRead && onMarkAsRead(notif._id)}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex gap-4 relative group ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                        {TYPE_ICONS[notif.type] || <Bell className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                                    </div>

                                    <div className="space-y-1">
                                        <p className={`text-sm font-bold ${!notif.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Clock className="w-3 h-3 text-gray-300" />
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {!notif.isRead && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="font-bold text-gray-900">All caught up!</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                                No new notifications at the moment
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 text-center border-t border-gray-50 dark:border-gray-800">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                        View History
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationDropdown;
