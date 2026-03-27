import React, { useState, useEffect } from 'react';
import {
    Users,
    Vote,
    Percent,
    Activity,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
    Clock,
    Loader2,
    ChevronRight,
    Search
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import api from '../../utils/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            totalVoters: "0",
            totalVotes: "0",
            totalOwners: "0",
            turnout: "0%",
            integrity: "100%"
        },
        chartData: Array(24).fill({ name: '', votes: 0 }),
        recentActivity: [],
        alerts: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                const { stats, recentActivity, alerts = [], chartData = [] } = response.data.data;

                const turnout = stats.totalVoters > 0
                    ? ((stats.totalVotes / stats.totalVoters) * 100).toFixed(1)
                    : 0;

                // Format chart data for Recharts
                const formattedChart = chartData.length > 0 ? chartData.map((val, idx) => ({
                    name: `${idx}:00`,
                    votes: val
                })) : [
                    { name: "08:00", votes: 400 },
                    { name: "12:00", votes: 600 },
                    { name: "16:00", votes: 800 },
                    { name: "20:00", votes: 500 },
                    { name: "00:00", votes: 700 },
                ];

                setData({
                    stats: {
                        totalVoters: stats.totalVoters.toLocaleString(),
                        totalVotes: stats.totalVotes.toLocaleString(),
                        totalOwners: stats.totalOwners.toLocaleString(),
                        turnout: `${turnout}%`,
                        integrity: '100%'
                    },
                    chartData: formattedChart,
                    recentActivity: recentActivity.map(item => ({
                        id: item._id,
                        user: item.actor?.name || item.userId?.name || 'System',
                        action: item.actionType || item.action,
                        time: new Date(item.createdAt || item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: item.status === 'SUCCESS' ? 'verified' : 'flagged'
                    })),
                    alerts: alerts.map((alert, idx) => ({
                        id: idx,
                        title: alert.type === 'warning' ? 'Critical Alert' : 'System Guard',
                        message: alert.message,
                        type: alert.type
                    }))
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-inter">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        System Dashboard
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">
                            {loading ? 'Polling...' : 'System Online'}
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Global Election Monitoring</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search system nodes..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-64 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Verified Identities"
                    value={data.stats.totalVoters}
                    trend="+12%"
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    icon={<ShieldCheck className="w-5 h-5" />}
                    label="Election Owners"
                    value={data.stats.totalOwners}
                    trend="Secured"
                    color="indigo"
                    loading={loading}
                />
                <StatCard
                    icon={<Vote className="w-5 h-5" />}
                    label="Total Votes Cast"
                    value={data.stats.totalVotes}
                    trend="Live"
                    color="emerald"
                    loading={loading}
                />
                <StatCard
                    icon={<Percent className="w-5 h-5" />}
                    label="Voting Progress"
                    value={data.stats.turnout}
                    trend="High"
                    color="amber"
                    loading={loading}
                />
                <StatCard
                    icon={<Activity className="w-5 h-5" />}
                    label="System Security"
                    value={data.stats.integrity}
                    trend="Safe"
                    color="green"
                    loading={loading}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Voting Activity</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Current Activity</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Updated</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="votes"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorVotes)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Risk Alerts */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            System Alerts
                        </h3>
                        <div className="space-y-4">
                            {data.alerts.length > 0 ? (
                                data.alerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 ${alert.type === 'warning' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} border rounded-xl`}>
                                        <p className={`${alert.type === 'warning' ? 'text-red-700' : 'text-amber-700'} font-black text-[10px] uppercase tracking-wider`}>{alert.title}</p>
                                        <p className={`${alert.type === 'warning' ? 'text-red-600' : 'text-amber-600'} text-xs mt-1 font-medium`}>{alert.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-300 text-[10px] font-black uppercase text-center py-6 tracking-widest">No Active Alerts</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            Activity Log
                        </h3>
                        <div className="space-y-6">
                            {data.recentActivity.length > 0 ? (
                                data.recentActivity.slice(0, 5).map((activity) => (
                                    <LogItem
                                        key={activity.id}
                                        icon={<Activity />}
                                        text={`${activity.user}: ${activity.action}`}
                                        time={activity.time}
                                        verified={activity.status === 'verified'}
                                    />
                                ))
                            ) : (
                                <p className="text-slate-300 text-[10px] font-black uppercase text-center py-6 tracking-widest">No Recent Activity</p>
                            )}
                        </div>
                        <button className="w-full mt-8 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all">
                            View System Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, color, loading }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        indigo: "bg-indigo-50 text-indigo-600",
        amber: "bg-amber-50 text-amber-600",
        green: "bg-green-50 text-green-600",
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-end justify-between">
                {loading ? (
                    <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg"></div>
                ) : (
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
                )}
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${colors[color]} bg-opacity-50`}>
                    {trend}
                </span>
            </div>
        </div>
    );
};

const LogItem = ({ icon, text, time, verified }) => (
    <div className="flex items-center gap-4 group cursor-pointer">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${verified ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {React.cloneElement(icon, { size: 16 })}
        </div>
        <div className="flex-1">
            <p className="text-sm font-bold text-slate-700 leading-tight">{text}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{time}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
    </div>
);

export default Dashboard;
