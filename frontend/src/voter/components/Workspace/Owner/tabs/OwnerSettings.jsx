import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../utils/api';
import {
    Settings, Play, Pause, XCircle, Globe, ShieldCheck,
    Trash2, AlertTriangle, ChevronRight, Copy, Maximize2, RefreshCw,
    MoreVertical, Check, Info, Loader2
} from 'lucide-react';

const OwnerSettings = ({ data, onUpdateElection, isOwner }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(null); // 'status', 'type', 'otp', etc.
    const [inviteStatus, setInviteStatus] = useState('on'); // 'on', 'off'

    const [showFullCode, setShowFullCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const inviteCode = data?.joinCode || 'N/A';
    const inviteLink = `${window.location.origin}/vote/${inviteCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (!isOwner) {
            alert('Only the primary owner can delete this election.');
            return;
        }
        if (!window.confirm('Are you absolutely sure you want to delete this election? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const electionId = data._id || data.id;
            const res = await api.delete(`/elections/${electionId}`);
            if (res.data.success) {
                navigate('/dashboard');
                window.location.reload(); // Refresh to update sidebar
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete election');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (updates, field) => {
        setLoading(field);
        try {
            const electionId = data._id || data.id;
            const res = await api.patch(`/elections/${electionId}`, updates);
            if (res.data.success) {
                if (onUpdateElection) onUpdateElection(res.data.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || `Failed to update ${field}`);
        } finally {
            setLoading(null);
        }
    };

    const handleStatusUpdate = (newStatus) => {
        if (newStatus === 'closed' && !window.confirm('Are you sure you want to close this election? This cannot be undone.')) return;
        handleUpdate({ status: newStatus }, 'status');
    };

    const handleTypeUpdate = (newType) => {
        const typeValue = newType.toLowerCase().includes('public') ? 'public' : 'private';
        handleUpdate({ type: typeValue }, 'type');
    };




    const resetCode = () => {
        // This would require a backend call to regenerate joinCode
        console.log('Reset code requested');
    };

    const SettingRow = ({ icon: Icon, label, desc, children }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-gray-50/50 rounded-3xl transition-all border border-transparent hover:border-gray-100">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-indigo-600 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{label}</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">{desc}</p>
                </div>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">

            {/* General Header */}
            <div className="px-2">
                <h2 className="text-4xl font-medium text-gray-800 font-sans">General</h2>
            </div>

            {/* Invite Codes Section (Google Classroom Style) */}
            <section className="space-y-6">
                <div className="px-2">
                    <h3 className="text-2xl font-normal text-gray-800 font-sans">Invite codes</h3>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 space-y-1">
                    {/* Manage Invite Codes */}
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-base font-normal text-gray-900">Manage invite codes</p>
                            <p className="text-sm text-gray-500 mt-0.5">Settings apply to both invite links and class codes</p>
                        </div>
                        <div className="relative group">
                            <select
                                value={inviteStatus}
                                onChange={(e) => {
                                    if (e.target.value === 'reset') {
                                        resetCode();
                                    } else {
                                        setInviteStatus(e.target.value);
                                    }
                                }}
                                className="appearance-none bg-transparent hover:bg-gray-50 text-indigo-600 font-bold px-4 py-2 rounded-xl cursor-pointer transition-all outline-none text-right min-w-[120px]"
                            >
                                <option value="on">Turned on</option>
                                <option value="off">Turned off</option>
                                <option value="reset">Reset</option>
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {inviteStatus === 'on' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Invite Link */}
                            <div className="flex items-center justify-between p-6">
                                <p className="text-base font-normal text-gray-900">Invite link</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500 max-w-[200px] sm:max-w-md truncate">{inviteLink}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Class Code */}
                            <div className="flex items-center justify-between p-6">
                                <p className="text-base font-normal text-gray-900">Election code</p>
                                <span className="text-lg font-medium text-gray-600 tracking-wider pr-4">{inviteCode}</span>
                            </div>

                            {/* Class View */}
                            <div className="flex items-center justify-between p-6">
                                <p className="text-base font-normal text-gray-900">Class view</p>
                                <button
                                    onClick={() => setShowFullCode(true)}
                                    className="flex items-center gap-2 text-indigo-600 font-bold px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    Display class code <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Control Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Election Control</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Status Card */}
                    <div className={`p-6 rounded-[32px] border transition-all ${data.status === 'active' ? 'bg-green-50/30 border-green-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${data.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                <Play className="w-5 h-5" />
                            </div>
                            {data.status === 'active' && (
                                <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">Current</span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Active</h4>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Voting is enabled. Users see the election as open and votes are recorded in real-time.
                        </p>
                        <button
                            onClick={() => handleStatusUpdate('active')}
                            disabled={data.status === 'active' || loading === 'status'}
                            className={`mt-6 w-full py-3 rounded-xl text-xs font-black transition-all active:scale-95 ${data.status === 'active' ? 'bg-green-100 text-green-600 cursor-default' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}
                        >
                            {loading === 'status' && data.status !== 'active' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data.status === 'active' ? 'Already Active' : 'Start/Resume Election')}
                        </button>
                    </div>

                    {/* Pause Status Card */}
                    <div className={`p-6 rounded-[32px] border transition-all ${data.status === 'paused' ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${data.status === 'paused' ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                <Pause className="w-5 h-5" />
                            </div>
                            {data.status === 'paused' && (
                                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">Current</span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Pause</h4>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Stop voting temporarily. **Schedule changes are only allowed while paused.** Previous votes remain safe.
                        </p>
                        <button
                            onClick={() => handleStatusUpdate('paused')}
                            disabled={data.status === 'paused' || loading === 'status'}
                            className={`mt-6 w-full py-3 rounded-xl text-xs font-black transition-all active:scale-95 ${data.status === 'paused' ? 'bg-amber-100 text-amber-600 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {loading === 'status' && data.status !== 'paused' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data.status === 'paused' ? 'Already Paused' : 'Pause Election')}
                        </button>
                    </div>

                    {/* Force Close Card */}
                    <div className={`p-6 rounded-[32px] border transition-all ${data.status === 'closed' ? 'bg-red-50/30 border-red-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${data.status === 'closed' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                <XCircle className="w-5 h-5" />
                            </div>
                            {data.status === 'closed' && (
                                <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">Closed</span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Force Close</h4>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Immediately end the election permanently. Final integrity validation starts and results are generated.
                        </p>
                        <button
                            onClick={() => handleStatusUpdate('closed')}
                            disabled={data.status === 'closed' || loading === 'status'}
                            className={`mt-6 w-full py-3 rounded-xl text-xs font-black transition-all active:scale-95 ${data.status === 'closed' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                            {loading === 'status' && data.status !== 'closed' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data.status === 'closed' ? 'Election Closed' : 'Stop Election')}
                        </button>
                    </div>
                </div>
            </section>


            {/* Visibility & Access */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Visibility & Access</h3>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 space-y-2">
                    <SettingRow
                        icon={Globe}
                        label="Election Discovery"
                        desc="Public elections appear on the global community dashboard."
                    >
                        <select
                            value={data.type === 'public' ? 'Public' : 'Private (Invite Only)'}
                            onChange={(e) => handleTypeUpdate(e.target.value)}
                            disabled={loading === 'type'}
                            className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none pr-10 cursor-pointer"
                        >
                            <option>Private (Invite Only)</option>
                            <option>Public</option>
                        </select>
                    </SettingRow>



                </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Danger Zone</h3>
                </div>

                <div className="bg-red-50/30 rounded-[40px] border-2 border-dashed border-red-100 p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                            <div className="p-4 bg-red-100 text-red-600 rounded-3xl">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-red-900 leading-tight">Delete this election</p>
                                <p className="text-sm text-red-600/70 mt-1 max-w-sm">
                                    This action is permanent. All votes, blockchain hashes, and results will be purged from our servers.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || !isOwner}
                            className={`w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-[24px] font-black shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 ${isDeleting || !isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            {isDeleting ? 'Deleting...' : 'Delete Permanent'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Full Screen Code Modal */}
            {showFullCode && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
                    <button
                        onClick={() => setShowFullCode(false)}
                        className="absolute top-8 left-8 p-4 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <XCircle className="w-8 h-8 text-gray-500" />
                    </button>

                    <div className="text-center space-y-12">
                        <h4 className="text-2xl font-medium text-gray-500 uppercase tracking-[0.2em]">Election Code</h4>
                        <p className="text-[12rem] font-medium text-indigo-600 tracking-tight leading-none tabular-nums">
                            {inviteCode}
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-12">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                            >
                                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                {copied ? 'Copied Link' : 'Copy Invite Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerSettings;
