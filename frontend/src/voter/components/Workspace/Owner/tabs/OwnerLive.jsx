import React from 'react';
import { Activity, Users, ShieldAlert, Wifi, TrendingUp, AlertCircle, Globe, Lock as LockIcon } from 'lucide-react';

const OwnerLive = ({ data }) => {
    const liveResultsEnabled = data?.liveResultsEnabled ?? data?.allowLiveResults;

    if (!liveResultsEnabled) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100">
                    <LockIcon className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">Live Results Disabled</h3>
                <p className="text-slate-500 text-center max-w-md text-lg leading-relaxed font-medium">
                    You have disabled live results in the voting settings. Enable them to monitor real-time participation and standings.
                </p>
                <div className="mt-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 max-w-sm">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                            Pro Tip: You can set visibility to "Admin/Owner Only" to monitor progress without sharing it with voters.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    const totalParticipants = data?.participants?.length || 0;
    const candidates = data?.candidates || [];
    const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

    // Sort candidates by votes for the chart
    const sortedCandidates = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const maxVotes = Math.max(...candidates.map(c => c.voteCount || 0), 1);

    const chartColors = ['bg-indigo-600', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Live Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Participants</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{totalParticipants}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center animate-pulse">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Votes Cast</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{totalVotes}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</p>
                        <p className="text-sm font-bold text-green-600 mt-2 flex items-center gap-2">
                            <Wifi className="w-4 h-4" /> WebSocket Connected
                        </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)]"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Vote Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Live Vote Distribution
                    </h3>
                    <div className="flex-1 flex flex-col justify-end gap-4 p-4 bg-gray-50/50 rounded-2xl">
                        {sortedCandidates.length > 0 ? (
                            sortedCandidates.map((c, i) => (
                                <div key={c._id || i} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                        <span>{c.name} <span className="text-[9px] text-gray-400 ml-1">({c.partyName || 'Independent'})</span></span>
                                        <span>{c.voteCount || 0} votes</span>
                                    </div>
                                    <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            className={`h-full ${chartColors[i % chartColors.length]} transition-all duration-1000 ease-out`}
                                            style={{ width: `${((c.voteCount || 0) / maxVotes) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <Activity className="w-12 h-12 opacity-20 mb-4" />
                                <p className="text-sm font-bold tracking-widest uppercase">No data available yet</p>
                            </div>
                        )}
                        <p className="text-[10px] text-gray-400 text-center mt-4 italic font-medium">Results are updated in real-time as votes are processed on the blockchain</p>
                    </div>
                </div>

                {/* Security Feed */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full">
                    <h3 className="text-lg font-bold text-indigo-600 mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        Live Activity Feed
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Wifi className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Monitoring Active</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed font-medium">
                                The system is monitoring all blockchain transactions for this election. No suspicious activity detected.
                            </p>
                        </div>
                    </div>
                    <button className="mt-8 w-full py-4 text-xs font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl transition-all border border-indigo-100/50">
                        View Blockchain Explorer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OwnerLive;
