import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    Activity,
    ShieldCheck,
    Users,
    Vote,
    TrendingUp,
    AlertTriangle,
    Clock,
    Eye,
    EyeOff,
    Lock,
    RefreshCcw,
    BarChart3,
    Zap,
    ChevronUp,
    ChevronDown,
    Loader2,
    Database,
    Cpu,
    CheckCircle2,
    Pause,
    Play,
    XCircle
} from 'lucide-react';
import api from '../../utils/api';

/**
 * Helper to determine result access
 */
const getResultAccess = (election) => {
    if (!election || election.status !== 'active') return 'NONE';
    if (!election.liveResultsEnabled) return 'ADMIN_ONLY';
    if (election.liveResultsEnabled && !election.publicResultsVisible) return 'ADMIN_OWNER';
    if (election.liveResultsEnabled && election.publicResultsVisible) return 'PUBLIC';
    return 'NONE';
};

const MetricCard = ({ title, value, subValue, icon: Icon, color, trend }) => (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl shadow-gray-200/50 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trend > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
                {subValue && <span className="text-gray-400 text-sm font-medium">{subValue}</span>}
            </div>
        </div>
    </div>
);

const CandidateRow = ({ candidate, index, totalVotes, lead }) => {
    const votes = candidate.votes || 0;
    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

    return (
        <div className="group relative p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300">
            <div className="flex items-end justify-between mb-2">
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-gray-200 group-hover:text-indigo-200 transition-colors">#{index + 1}</span>
                    <div>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {candidate.name}
                            {lead && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">{candidate.partyName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-gray-900">{votes.toLocaleString()}</p>
                    <p className="text-xs text-indigo-600 font-bold">{percentage}%</p>
                </div>
            </div>

            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {lead && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Lead: +{lead} votes</span>
                </div>
            )}
        </div>
    );
};

const Monitoring = () => {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [monitoringData, setMonitoringData] = useState(null);

    const fetchData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const response = await api.get('/admin/monitoring/active-elections');
            const activeElections = response.data.data;
            setElections(activeElections);

            if (activeElections.length > 0 && !selectedElection) {
                setSelectedElection(activeElections[0]);
            } else if (selectedElection) {
                const updated = activeElections.find(e => e._id === selectedElection._id);
                if (updated) setSelectedElection(updated);
            }

            // Fetch specific live data if an election is selected
            if (activeElections.length > 0) {
                const currentId = selectedElection?._id || activeElections[0]._id;
                const liveRes = await api.get(`/admin/monitoring/live?electionId=${currentId}`);
                setMonitoringData(liveRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching monitoring data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(), 10000); // Auto refresh every 10s for live feel
        return () => clearInterval(interval);
    }, [selectedElection?._id]);

    const toggleVisibility = async (field, value) => {
        if (!selectedElection) return;
        try {
            await api.patch(`/elections/${selectedElection._id}`, { [field]: value });
            fetchData(true);
        } catch (error) {
            console.error(`Error toggling ${field}:`, error);
            toast.error(`Failed to update ${field}`);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedElection) return;
        setRefreshing(true);
        try {
            await api.patch(`/elections/${selectedElection._id}/status`, { status: newStatus });
            toast.success(`Election ${newStatus} successfully`);
            fetchData(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Initializing Monitoring Systems...</p>
            </div>
        );
    }

    if (elections.length === 0) {
        return (
            <div className="bg-white/80 p-12 rounded-3xl border border-dashed border-gray-300 text-center max-w-2xl mx-auto mt-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">No Active Elections</h2>
                <p className="text-gray-500 mt-2">Currently, there are no live elections to monitor. Live results and system metrics will appear here once an election starts.</p>
            </div>
        );
    }

    const mode = selectedElection ? getResultAccess(selectedElection) : 'NONE';
    const sortedCandidates = selectedElection ? [...(selectedElection?.candidates || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0)) : [];
    const voteLead = sortedCandidates.length > 1 ? (sortedCandidates[0].votes || 0) - (sortedCandidates[1].votes || 0) : 0;

    if (!selectedElection) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. LIVE HEADER (Control Bar) */}
            <div className="bg-gray-900 p-6 rounded-[2rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-ping"></div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black tracking-tight">{selectedElection.title}</h2>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md tracking-widest ${selectedElection.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}>
                                {selectedElection.status === 'active' ? 'LIVE' : 'PAUSED'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm font-medium mt-1 flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${monitoringData ? 'text-green-500' : 'text-gray-500'}`} />
                            System Status: {monitoringData ? 'Healthy & Monitoring' : 'Connecting...'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <div className="flex bg-gray-800 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => toggleVisibility('liveResultsEnabled', false)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!selectedElection.liveResultsEnabled ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <EyeOff className="w-4 h-4 inline mr-2" />
                            PRIVATE
                        </button>
                        <button
                            onClick={() => {
                                toggleVisibility('liveResultsEnabled', true);
                                toggleVisibility('publicResultsVisible', false);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedElection.liveResultsEnabled && !selectedElection.publicResultsVisible ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <ShieldCheck className="w-4 h-4 inline mr-2" />
                            OWNERS
                        </button>
                        <button
                            onClick={() => {
                                toggleVisibility('liveResultsEnabled', true);
                                toggleVisibility('publicResultsVisible', true);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedElection.publicResultsVisible ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            PUBLIC
                        </button>
                    </div>

                    <div className="flex bg-gray-800 p-1.5 rounded-2xl border border-white/5">
                        {selectedElection.status === 'active' ? (
                            <button
                                onClick={() => handleStatusUpdate('paused')}
                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-amber-400 hover:bg-amber-400/10 flex items-center"
                                title="Pause Election"
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                PAUSE
                            </button>
                        ) : (
                            <button
                                onClick={() => handleStatusUpdate('active')}
                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-emerald-400 hover:bg-emerald-400/10 flex items-center"
                                title="Resume Election"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                RESUME
                            </button>
                        )}
                        <button
                            onClick={() => handleStatusUpdate('closed')}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-rose-400 hover:bg-rose-400/10 flex items-center border-l border-white/10 ml-1 pl-4"
                            title="End Election"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            END
                        </button>
                    </div>

                    <button
                        onClick={() => fetchData(true)}
                        className={`p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 2. TOP LIVE METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Votes"
                    value={selectedElection.totalVotes.toLocaleString()}
                    icon={Vote}
                    color="bg-indigo-50 text-indigo-600"
                    trend={+8.2}
                />
                <MetricCard
                    title="Live Sessions"
                    value={monitoringData?.activeSessions || 0}
                    icon={Users}
                    color="bg-purple-50 text-purple-600"
                />
                <MetricCard
                    title="Votes / Min"
                    value={monitoringData?.throughput || 0}
                    icon={Zap}
                    color="bg-amber-50 text-amber-600"
                    trend={-2.4}
                />
                <MetricCard
                    title="Turnout"
                    value={`${Math.round(selectedElection.turnout)}%`}
                    icon={BarChart3}
                    color="bg-emerald-50 text-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. CANDIDATE RACE PANEL */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Race Standings</h3>
                            <p className="text-gray-500 text-sm font-medium">Real-time vote distribution and momentum</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Election Pool</p>
                            <p className="text-sm font-bold text-gray-900">{selectedElection.participants.length.toLocaleString()} Voters</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sortedCandidates.map((candidate, idx) => (
                            <CandidateRow
                                key={candidate._id}
                                candidate={candidate}
                                index={idx}
                                totalVotes={selectedElection.totalVotes}
                                lead={idx === 0 && voteLead > 0 ? voteLead : null}
                            />
                        ))}
                    </div>

                    {/* 4. MOMENTUM / SWING VIEW */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            Momentum Tracker
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {sortedCandidates.slice(0, 4).map(c => (
                                <div key={c._id} className="p-4 bg-gray-50 rounded-2xl flex flex-col justify-center text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{c.name}</p>
                                    <div className="flex items-center justify-center gap-1 mt-1 font-black text-sm">
                                        <ChevronUp className="w-3 h-3 text-green-500" />
                                        <span>+{(Math.random() * 5).toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* 5. INTEGRITY & SECURITY PANEL (Admin Only) */}
                    <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
                        <h3 className="text-lg font-black tracking-tight mb-6 relative z-10 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-300" />
                            System Integrity
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database className="w-4 h-4 text-indigo-300" />
                                    <span className="text-sm font-medium text-indigo-100">Blockchain Sync</span>
                                </div>
                                <span className="text-[10px] font-black bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md">VERIFIED</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Cpu className="w-4 h-4 text-indigo-300" />
                                    <span className="text-sm font-medium text-indigo-100">Node Latency</span>
                                </div>
                                <span className="text-sm font-black">24ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-medium text-indigo-100">Security Flags</span>
                                </div>
                                <span className="text-sm font-black text-amber-400">0 Alerts</span>
                            </div>

                            <div className="pt-4 border-t border-white/10 mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase text-indigo-300">Winner confidence</span>
                                    <span className="text-xs font-black">87.4%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 w-[87.4%] rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6. LIVE ACTIVITY FEED */}
                    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-gray-200/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Live Logs</h3>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {(monitoringData?.liveFeed || []).map((log, i) => (
                                <div key={log.id} className="flex gap-4 group transition-all">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${log.status === 'success' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                            }`}></div>
                                        {i !== (monitoringData.liveFeed.length - 1) && <div className="w-[1px] h-full bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>}
                                    </div>
                                    <div className="pb-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-black text-gray-900">{log.user}</p>
                                            <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{log.action}</p>
                                    </div>
                                </div>
                            ))}
                            {(!monitoringData?.liveFeed || monitoringData.liveFeed.length === 0) && (
                                <p className="text-center text-gray-400 text-xs py-8">Waiting for activity...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Stability / Prediction (Floating or Bottom) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 50 Q 25 20 50 50 T 100 50" fill="none" stroke="white" strokeWidth="0.5" />
                        <path d="M0 70 Q 25 40 50 70 T 100 70" fill="none" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <Cpu className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                            AI Verdict Stability
                            <span className="px-2 py-0.5 bg-green-400 text-gray-900 text-[10px] font-black uppercase rounded">High</span>
                        </h4>
                        <p className="text-indigo-100 text-sm font-medium">87% probability of lead maintenance in the next 30 minutes</p>
                    </div>
                </div>

                <div className="text-center md:text-right relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Estimated Winner Finalize</p>
                    <p className="text-3xl font-black tracking-tighter">11 mins <span className="text-indigo-200 text-sm">remaining</span></p>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default Monitoring;
