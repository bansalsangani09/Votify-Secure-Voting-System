import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    Calendar as CalendarIcon,
    Clock,
    Users,
    Loader2,
    Check
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks
} from 'date-fns';
import api from '../../utils/api';

const Calendar = () => {
    const { openActionModal } = useOutletContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // 'month' or 'week'
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'scheduled', 'closed'
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const res = await api.get('/elections/my');
                if (res.data.success) {
                    const { joined, created } = res.data.data;
                    setElections([...created, ...joined]);
                }
            } catch (err) {
                console.error('Failed to fetch elections:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchElections();
    }, []);

    const getViewInterval = () => {
        if (view === 'month') {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(monthStart);
            return {
                start: startOfWeek(monthStart),
                end: endOfWeek(monthEnd)
            };
        } else {
            return {
                start: startOfWeek(currentDate),
                end: endOfWeek(currentDate)
            };
        }
    };

    const { start: startDate, end: endDate } = getViewInterval();

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const nextInterval = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const prevInterval = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const getElectionStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'scheduled': return 'bg-indigo-600';
            case 'closed': return 'bg-gray-400';
            default: return 'bg-indigo-600';
        }
    };

    const filterOptions = [
        { id: 'all', label: 'All Elections' },
        { id: 'active', label: 'Active Only' },
        { id: 'scheduled', label: 'Upcoming' },
        { id: 'closed', label: 'Completed' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Voting Calendar</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and schedule election events.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white p-1 rounded-2xl border border-gray-100 flex items-center shadow-sm">
                        <button
                            onClick={() => setView('month')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'week' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Week
                        </button>
                    </div>
                    <button
                        onClick={openActionModal}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Election
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Calendar Controls */}
                <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                            {view === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(startDate, 'MMM d, yyyy')}`}
                        </h2>
                        <div className="flex items-center bg-gray-50 rounded-xl p-1">
                            <button
                                onClick={prevInterval}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextInterval}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        <div className="hidden md:flex items-center gap-4 mr-6">
                            {[
                                { label: 'Active', color: 'bg-green-500' },
                                { label: 'Upcoming', color: 'bg-indigo-600' },
                                { label: 'Closed', color: 'bg-gray-400' },
                            ].map((l, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{l.label}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-3 rounded-2xl border border-gray-100 transition-all ${isFilterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Filter className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-indigo-100/50 p-2 z-50"
                                >
                                    {filterOptions.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setFilterStatus(option.id);
                                                setIsFilterOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 rounded-2xl transition-all group"
                                        >
                                            <span className={`text-sm font-bold ${filterStatus === option.id ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`}>
                                                {option.label}
                                            </span>
                                            {filterStatus === option.id && <Check className="w-4 h-4 text-indigo-600" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-50 last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {loading ? (
                        <div className="col-span-7 h-96 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : calendarDays.map((day, idx) => {
                        const dayElections = elections.filter(e => {
                            const isSameDayCheck = isSameDay(new Date(e.startDate), day);
                            const matchesFilter = filterStatus === 'all' || e.status === filterStatus;
                            return isSameDayCheck && matchesFilter;
                        });
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div key={idx} className={`
                                min-h-[140px] p-4 border-r border-b border-gray-50 last:border-r-0 transition-all hover:bg-gray-50/50 group relative
                                ${!isCurrentMonth && view === 'month' ? 'bg-gray-50/30' : 'bg-white'}
                            `}>
                                <span className={`
                                    text-sm font-bold transition-all
                                    ${isToday ? 'bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-100' : 'text-gray-400'}
                                    ${!isCurrentMonth && view === 'month' ? 'opacity-20' : ''}
                                `}>
                                    {format(day, 'd')}
                                </span>

                                <div className="mt-3 space-y-2">
                                    {dayElections.map((election) => (
                                        <div
                                            key={election._id}
                                            className={`
                                                p-2 rounded-xl ${getElectionStatusColor(election.status)} text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all
                                            `}
                                        >
                                            <p className="text-[9px] font-black leading-tight line-clamp-2">{election.title}</p>
                                            <div className="flex items-center gap-1 mt-1 opacity-80">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span className="text-[7px] font-bold">
                                                    {election.startTime || '10:00 AM'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={openActionModal}
                                    className="absolute bottom-4 right-4 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend Mobile */}
            <div className="md:hidden flex flex-wrap gap-4 px-4">
                {[
                    { label: 'Active', color: 'bg-green-500' },
                    { label: 'Upcoming', color: 'bg-indigo-600' },
                    { label: 'Closed', color: 'bg-gray-400' },
                ].map((l, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100">
                        <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{l.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
