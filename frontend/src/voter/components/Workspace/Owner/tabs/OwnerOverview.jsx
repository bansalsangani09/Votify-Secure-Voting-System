import React, { useState, useEffect } from 'react';
import ScheduleEditModal from '../modals/ScheduleEditModal';
import InfoEditModal from '../modals/InfoEditModal';
import VotingSettingsModal from '../modals/VotingSettingsModal';
import { Users, ShieldCheck, BarChart3, Clock, Calendar, ChevronRight, Edit3, Settings } from 'lucide-react';

const OwnerOverview = ({ data, onTabChange, onUpdateElection }) => {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00' });

    useEffect(() => {
        const targetDate = data?.status === 'scheduled' ? data?.startDate : data?.endDate;
        if (!targetDate) return;

        const updateTimer = () => {
            const total = Date.parse(targetDate) - Date.parse(new Date());
            if (total <= 0) {
                setTimeLeft({ days: '00', hours: '00', mins: '00' });
                return;
            }

            const days = Math.floor(total / (1000 * 60 * 60 * 24));
            const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((total / 1000 / 60) % 60);

            setTimeLeft({
                days: days.toString().padStart(2, '0'),
                hours: hours.toString().padStart(2, '0'),
                mins: mins.toString().padStart(2, '0')
            });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [data?.startDate, data?.endDate, data?.status]);

    const totalVoters = data?.participants?.length || 0;
    const votesCast = data?.candidates?.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 0;
    const turnout = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : '0';

    const stats = [
        { label: 'Total Voters', value: totalVoters.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Votes Cast', value: votesCast.toLocaleString(), icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Turnout %', value: `${turnout}%`, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Status', value: data?.status || 'Active', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const isPaused = data?.status === 'paused';
    const isDraft = data?.status === 'draft';
    const isScheduled = data?.status === 'scheduled';
    const canManageSchedule = isPaused || isDraft || isScheduled;

    const now = new Date();
    const startDate = data?.startDate ? new Date(data.startDate) : null;
    const endDate = data?.endDate ? new Date(data.endDate) : null;

    const timelineSteps = [
        {
            label: 'Created',
            date: data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
            status: 'completed'
        },
        {
            label: 'Activation',
            date: startDate ? startDate.toLocaleDateString() : 'TBD',
            status: startDate && now > startDate ? 'completed' : 'pending'
        },
        {
            label: 'Voting Period',
            date: startDate && now > startDate && endDate && now < endDate ? 'In Progress' : 'Scheduled',
            status: startDate && now > startDate && endDate && now < endDate ? 'active' : startDate && now > startDate ? 'completed' : 'pending'
        },
        {
            label: 'Closing',
            date: endDate ? endDate.toLocaleDateString() : 'TBD',
            status: endDate && now > endDate ? 'completed' : 'pending'
        },
        {
            label: 'Results',
            date: data?.resultTime ? new Date(data.resultTime).toLocaleDateString() : endDate ? endDate.toLocaleDateString() : 'TBD',
            status: endDate && now > endDate ? 'completed' : 'pending'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => { if (stat.label === 'Status') onTabChange('settings'); }}>
                        <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Election Lifecycle
                        </h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => (data?.status === 'scheduled' || data?.status === 'draft') && setIsSettingsOpen(true)}
                                title="Voting Settings"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${(data?.status === 'scheduled' || data?.status === 'draft')
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Voting Settings
                            </button>
                            <button
                                onClick={() => (data?.status === 'scheduled' || data?.status === 'draft') && setIsInfoModalOpen(true)}
                                disabled={data?.status !== 'scheduled' && data?.status !== 'draft'}
                                title={data?.status !== 'scheduled' && data?.status !== 'draft' ? 'Cannot edit details once election has started or closed' : 'Edit Details'}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${(data?.status === 'scheduled' || data?.status === 'draft')
                                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit Details
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-10 right-10 h-1 bg-gray-100 z-0">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-1000"
                                style={{
                                    width: `${((timelineSteps.filter(s => s.status === 'completed').length - 1) / (timelineSteps.length - 1)) * 100}%`
                                }}
                            ></div>
                        </div>

                        {timelineSteps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center relative z-10 text-center">
                                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                  ${step.status === 'completed' ? 'bg-indigo-600 border-white text-white shadow-lg' :
                                        step.status === 'active' ? 'bg-white border-indigo-600 text-indigo-600 scale-110' :
                                            'bg-white border-gray-50 text-gray-300'}
                `}>
                                    {step.status === 'completed' ? <ShieldCheck className="w-5 h-5" /> : idx + 1}
                                </div>
                                <p className={`text-xs font-bold mt-4 ${step.status === 'active' ? 'text-indigo-600' : step.status === 'completed' ? 'text-gray-800' : 'text-gray-300'}`}>
                                    {step.label}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">{step.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Countdown Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                            {data?.status === 'scheduled' ? 'Starts In' : 'Time Remaining'}
                        </p>
                        <h3 className="text-lg font-bold mt-2">
                            {data?.status === 'scheduled' ? 'Election Starting In' : 'Election Closing In'}
                        </h3>

                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black">{timeLeft.days}</p>
                                <p className="text-[10px] uppercase font-bold text-indigo-200">Days</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black">{timeLeft.hours}</p>
                                <p className="text-[10px] uppercase font-bold text-indigo-200">Hours</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black">{timeLeft.mins}</p>
                                <p className="text-[10px] uppercase font-bold text-indigo-200">Mins</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => canManageSchedule && setIsScheduleModalOpen(true)}
                        disabled={!canManageSchedule}
                        className={`mt-8 w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${canManageSchedule ? 'bg-white/20 hover:bg-white text-white hover:text-indigo-600' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
                    >
                        {isPaused || isDraft || isScheduled ? 'Manage Schedule' : 'Pause to Edit Schedule'} <ChevronRight className="w-4 h-4" />
                    </button>

                    <Clock className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-700" />
                </div>
            </div>

            <ScheduleEditModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                electionData={data}
                onUpdate={onUpdateElection}
            />

            <InfoEditModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                electionData={data}
                onUpdate={onUpdateElection}
            />

            <VotingSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                electionData={data}
                onUpdate={onUpdateElection}
            />
        </div>
    );
};

export default OwnerOverview;
