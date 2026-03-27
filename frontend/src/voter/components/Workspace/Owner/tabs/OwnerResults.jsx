import React from 'react';
import { Award, Download, PieChart, BarChart, ChevronRight, TrendingUp, Users } from 'lucide-react';

const OwnerResults = ({ data }) => {
    const candidates = data?.candidates || [];
    const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 0;

    // Sort to find the winner/leader
    const sortedCandidates = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const winner = sortedCandidates[0] || { name: 'No candidates', voteCount: 0 };
    const winnerShare = totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Winner Hero Card */}
            <div className="relative p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-indigo-100 overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest">
                            <Award className="w-4 h-4 text-amber-300" /> Current Leader
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{winner.name}</h2>
                        <p className="text-indigo-100/80 text-sm font-bold uppercase tracking-widest">
                            {winner.partyName || 'Independent'}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Total Votes</span>
                                <span className="text-2xl font-black">{winner.voteCount}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-white/20"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Vote Share</span>
                                <span className="text-2xl font-black">{winnerShare}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-48 h-48 bg-white/10 backdrop-blur-2xl rounded-[40px] border-4 border-white/20 p-2 transform rotate-3 group-hover:rotate-0 transition-transform duration-700">
                        <img src={winner.photoUrl ? (winner.photoUrl.startsWith('http') ? winner.photoUrl : `${winner.photoUrl}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${winner.name}`} alt="Winner" className="w-full h-full object-cover rounded-[32px]" />
                    </div>
                </div>
                <Award className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-1000" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stats Recap */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-indigo-600" />
                            Participation Overview
                        </h3>
                    </div>

                    <div className="aspect-square max-w-[280px] mx-auto relative flex items-center justify-center">
                        <div className="w-full h-full rounded-full border-[32px] border-blue-50 border-t-indigo-600 relative rotate-45">
                            <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45">
                                <p className="text-3xl font-black text-gray-800">{totalVotes}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Total Ballots</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50">
                            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Votes Cast</p>
                                <p className="text-sm font-black text-gray-800">{totalVotes}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invited</p>
                                <p className="text-sm font-black text-gray-800">{data?.participants?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export & Actions Section */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Download className="w-5 h-5 text-green-600" />
                            Report Generation
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-8">
                            Generate the official election results document including blockchain verification hashes, audit trails, and demographic analytics.
                        </p>
                        <div className="space-y-3">
                            <button className="w-full bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 p-4 rounded-2xl font-bold flex items-center justify-between group transition-all">
                                <span className="flex items-center gap-3">
                                    <span className="bg-white p-2 rounded-xl group-hover:bg-white shadow-sm transition-all"><BarChart className="w-4 h-4" /></span>
                                    Summary Sheet (.PDF)
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                            <button className="w-full bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-600 p-4 rounded-2xl font-bold flex items-center justify-between group transition-all">
                                <span className="flex items-center gap-3">
                                    <span className="bg-white p-2 rounded-xl group-hover:bg-white shadow-sm transition-all"><Users className="w-4 h-4" /></span>
                                    Detailed Logs (.CSV)
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-[28px] font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                                <Award className="w-5 h-5" />
                                Finalize & Close Election
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6">
                        <div className="bg-white p-4 rounded-3xl shadow-sm text-indigo-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">Live Participation</h4>
                            <p className="text-gray-500 text-[11px] mt-0.5">
                                {data?.participants?.length > 0
                                    ? `Current turnout is ${((totalVotes / data.participants.length) * 100).toFixed(1)}% of registered participants.`
                                    : 'No participants registered yet.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerResults;
