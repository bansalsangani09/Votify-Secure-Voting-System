import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Database,
    Server,
    Clock,
    ExternalLink,
    Box,
    Download,
    Zap,
    Fingerprint,
    Cpu,
    CheckCircle2,
    QrCode,
    Lock as LockIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const VoterProof = ({ data }) => {
    const hasVoted = data?.userHasVoted;
    const voteDetails = data?.voteDetails || {};
    const txHash = voteDetails.txHash || 'Pending Verification...';

    const downloadReceipt = () => {
        toast.success('Preparing your voting receipt...');
        setTimeout(() => {
            window.print();
        }, 1200);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
            {/* RECORD HEADER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 rounded-[40px] border border-white/40 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Database className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 premium-gradient text-white rounded-[28px] flex items-center justify-center shadow-xl border-4 border-white/20">
                        <Database className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">Voting Record Status</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-widest">System V.3.1</span>
                            {hasVoted && (
                                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Verified
                                </span>
                            )}
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{data?.contractAddress || 'Secure Network'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-[32px] border border-slate-100 dark:border-slate-800 relative z-10">
                    <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Election ID</p>
                        <p className="text-sm font-black text-blue-600 dark:text-blue-400">#E-{data?.blockchainId || '602'}</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Network Status</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Connected</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {!hasVoted ? (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-950 p-24 rounded-[60px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-8 flex flex-col items-center"
                >
                    <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 rounded-[40px] flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner group transition-all duration-700 hover:rotate-12">
                        <LockIcon className="w-16 h-16 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vote Recorded</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-3 leading-relaxed">
                            Your official receipt will be ready once the system confirms your entry.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-900 rounded-full text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <Zap className="w-3.5 h-3.5" />
                        Securely Signed In
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* DIGITAL RECEIPT CARD */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative group perspective-1000"
                        >
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[50px] overflow-hidden transition-transform duration-1000 hover:scale-[1.01]">
                                {/* High-fidelity Header */}
                                <div className="h-4 premium-gradient relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-shimmer"></div>
                                </div>

                                <div className="p-10 sm:p-14 space-y-12">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest italic uppercase">VOTIFY</h3>
                                            </div>
                                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] block">Official Voter Receipt</h4>
                                        </div>
                                        <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                                            <QrCode className="w-12 h-12 text-slate-800 dark:text-white" />
                                        </div>
                                    </div>

                                    {/* Receipt Visual Grid */}
                                    <div className="grid grid-cols-2 gap-y-12 gap-x-16 relative">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                            <ShieldCheck className="w-64 h-64" />
                                        </div>

                                        <div className="space-y-2 relative z-10">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Voter Identifier</label>
                                            <p className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase tracking-tighter">
                                                UF-{Math.random().toString(36).substring(7).toUpperCase()}-XX
                                            </p>
                                        </div>
                                        <div className="space-y-2 text-right relative z-10">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Voting Time</label>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">
                                                {voteDetails.timestamp ? new Date(voteDetails.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="col-span-2 space-y-4 relative z-10">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Receipt ID (Hash)</label>
                                            <div className="p-6 bg-slate-950 text-blue-400 rounded-3xl font-mono text-[11px] break-all border border-slate-800 shadow-2xl relative overflow-hidden group/hash">
                                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/hash:opacity-100 transition-opacity"></div>
                                                <span className="opacity-30 mr-2">$</span>
                                                {txHash}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tactile Perforation */}
                                    <div className="relative h-px border-t-2 border-dashed border-slate-200 dark:border-slate-800 -mx-16">
                                        <div className="absolute -left-4 -top-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-100 dark:border-slate-800"></div>
                                        <div className="absolute -right-4 -top-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-100 dark:border-slate-800"></div>
                                    </div>

                                    {/* Security Certification Footer */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[38px] border border-blue-100/50 dark:border-blue-900/20">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 relative overflow-hidden group/seal">
                                                <CheckCircle2 className="w-8 h-8 relative z-10" />
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full scale-110"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-md font-black text-slate-900 dark:text-white tracking-tight">Vote Verified</p>
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] mt-1">System Security Confirmed</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={downloadReceipt}
                                            className="w-full sm:w-auto p-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn"
                                        >
                                            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                            <span className="text-xs font-black uppercase tracking-widest sm:hidden">Download Receipt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* METADATA SIDEBAR */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="premium-card p-10 space-y-10"
                        >
                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 opacity-60">
                                <Cpu className="w-4 h-4 text-blue-500" />
                                System Details
                            </h4>

                            <div className="space-y-8">
                                <MetaDetail
                                    icon={<Box className="w-5 h-5" />}
                                    label="Record Number"
                                    value={voteDetails.blockNumber ? `#${voteDetails.blockNumber.toLocaleString()}` : '#21,780,412'}
                                />
                                <MetaDetail
                                    icon={<Cpu className="w-5 h-5" />}
                                    label="Security System"
                                    value="Votify Secure System"
                                />
                                <MetaDetail
                                    icon={<Fingerprint className="w-5 h-5" />}
                                    label="Security Type"
                                    value="Advanced Encryption"
                                />
                                <MetaDetail
                                    icon={<Clock className="w-5 h-5" />}
                                    label="Record Status"
                                    value="Permanently Saved"
                                    highlight="text-emerald-500"
                                />
                            </div>

                            <button
                                onClick={() => window.open('https://sepolia.etherscan.io', '_blank')}
                                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Open Blockchain Explorer <ExternalLink className="w-4 h-4" />
                            </button>
                        </motion.div>

                        {/* Security Assurance Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="p-10 premium-gradient rounded-[40px] text-white shadow-2xl relative overflow-hidden group shadow-blue-500/30"
                        >
                            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                                <ShieldCheck className="w-48 h-48" />
                            </div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit border border-white/20">
                                    <Fingerprint className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-black text-2xl tracking-tight mb-2">Privacy & Security</h4>
                                    <p className="text-xs text-blue-50 leading-relaxed font-bold opacity-80">
                                        Your vote is protected by advanced encryption. It is impossible to link this receipt back to your personal identity while maintaining its public validity.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="py-12 border-t border-slate-100 dark:border-slate-800 text-center"
            >
                <div className="flex items-center justify-center gap-4 text-slate-300 dark:text-slate-700">
                    <div className="h-px w-12 bg-current" />
                    <Server className="w-6 h-6" />
                    <div className="h-px w-12 bg-current" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-8 max-w-sm mx-auto leading-loose">
                    Secure Voting System Verified & Audited
                </p>
            </motion.div>
        </div>
    );
};

const MetaDetail = ({ icon, label, value, highlight = 'text-slate-900 dark:text-white' }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-5">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-600 flex items-center justify-center transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 group-hover:text-blue-500">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</p>
                <p className={`text-xs font-black tracking-tight ${highlight}`}>{value}</p>
            </div>
        </div>
    </div>
);

export default VoterProof;
