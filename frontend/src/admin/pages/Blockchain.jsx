import React, { useState, useEffect } from 'react';
import {
    Database,
    ShieldCheck,
    Hash,
    Search,
    RefreshCw,
    Link as LinkIcon,
    AlertCircle,
    CheckCircle2,
    Cpu,
    ExternalLink,
    Loader2,
    X
} from 'lucide-react';
import api from '../../utils/api';

const Blockchain = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [stats, setStats] = useState({
        totalBlocks: 0,
        lastSync: 'Syncing...',
        status: 'Healthy'
    });

    useEffect(() => {
        fetchElections();
        fetchRecords();
    }, [selectedElection]);

    const fetchElections = async () => {
        try {
            const res = await api.get('/admin/elections');
            setElections(res.data.data || []);
        } catch (err) {
            console.error('Error fetching elections:', err);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const url = selectedElection
                ? `/admin/blockchain/records?electionId=${selectedElection}`
                : '/admin/blockchain/records';
            const response = await api.get(url);
            setBlocks(response.data.data.blocks);
            setStats({
                totalBlocks: response.data.data.blocks.length,
                lastSync: new Date().toLocaleTimeString(),
                status: 'Healthy'
            });
        } catch (error) {
            console.error('Error fetching blockchain records:', error);
            setStats(prev => ({ ...prev, status: 'Error' }));
        } finally {
            setLoading(false);
        }
    };

    const verifyChain = async () => {
        setVerifying(true);
        try {
            const response = await api.post('/admin/blockchain/verify');
            alert(response.data.message);
        } catch (error) {
            console.error('Error verifying chain:', error);
            alert('Verification failed.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Database className="w-7 h-7 text-indigo-600" />
                        Blockchain Records
                    </h2>
                    <p className="text-gray-500 mt-1">Direct view into the permanent record and voting sequence.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={verifyChain}
                        disabled={verifying}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50"
                    >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-green-600" />}
                        Check System Integrity
                    </button>
                    <button
                        onClick={fetchRecords}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-indigo-200"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
                        Refresh Records
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Blocks</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">{stats.totalBlocks}</p>
                        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+Real Data</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Network Status</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${stats.status === 'Healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <p className="text-lg font-bold text-gray-900">{stats.status}</p>
                        <span className="text-xs text-gray-400 font-medium ml-auto">Last Sync: {stats.lastSync}</span>
                    </div>
                </div>
                <div className="bg-indigo-900 p-6 rounded-2xl border border-indigo-800 shadow-lg text-white relative overflow-hidden">
                    <Cpu className="absolute -right-4 -top-4 w-24 h-24 text-white opacity-10" />
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Verification Engine</p>
                    <p className="text-lg font-bold">Security Encrypted</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Anonymous Voting Active
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                )}
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find block by hash or index..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={selectedElection}
                            onChange={(e) => setSelectedElection(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm cursor-pointer"
                        >
                            <option value="">All Elections</option>
                            {elections.map(e => (
                                <option key={e._id} value={e._id}>{e.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">Block</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Record ID (Hash)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Voter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">TX Count</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Time Recorded</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {blocks.length > 0 ? (
                                blocks.map((block) => (
                                    <tr key={block.height} className="hover:bg-indigo-50/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-col items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                                                    <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-200 leading-none">POS</span>
                                                    <span className="text-sm font-bold text-indigo-700 group-hover:text-white leading-tight">{block.height}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs font-mono font-bold text-gray-900 truncate max-w-[240px]">{block.hash}</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-50">
                                                    <LinkIcon className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] font-mono text-gray-500 truncate max-w-[240px]">{block.previousHash}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 line-clamp-1">{block.voterName}</span>
                                                <span className="text-xs text-gray-500 line-clamp-1">{block.voterEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="bg-gray-100 text-gray-700 rounded-lg px-2 py-1 text-xs font-bold border border-gray-200">
                                                {block.data?.length || 0} Votes
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-gray-900">{new Date(block.timestamp).toLocaleTimeString()}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{new Date(block.timestamp).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedBlock(block)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all shadow-none hover:shadow-sm"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                                            No records found in the system.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Record Details</h3>
                            <button onClick={() => setSelectedBlock(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Position</label>
                                <p className="text-sm font-bold text-indigo-600">{selectedBlock.height}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Hash</label>
                                <p className="text-xs font-mono bg-slate-50 p-2 rounded-lg break-all">{selectedBlock.hash}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Hash (Blockchain)</label>
                                <p className="text-xs font-mono bg-slate-50 p-2 rounded-lg break-all">{selectedBlock.txHash || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voter Details</label>
                                <div className="bg-slate-50 p-3 rounded-lg mt-1">
                                    <p className="text-sm font-bold text-gray-900">{selectedBlock.voterName}</p>
                                    <p className="text-xs text-gray-500">{selectedBlock.voterEmail}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</label>
                                <p className="text-sm font-medium">{new Date(selectedBlock.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedBlock(null)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all font-sans"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blockchain;
