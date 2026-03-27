import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, X, ExternalLink, Loader2, ArrowRight, GripVertical, Clock } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../../../../utils/api';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { motion } from 'framer-motion';

const SortableCandidateItem = ({ candidate, id, index }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center gap-6 bg-white dark:bg-slate-800 rounded-[28px] p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-grab active:cursor-grabbing group mb-4 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col items-center justify-center p-2 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                <GripVertical className="w-6 h-6" />
                <div className="mt-2 w-7 h-7 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                    {index + 1}
                </div>
            </div>

            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                <img
                    src={candidate.photoUrl ? (candidate.photoUrl.startsWith('http') ? candidate.photoUrl : `${candidate.photoUrl}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${candidate.name}`}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">{candidate.name}</h3>
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/10 px-1.5 py-0.5 rounded">
                        {candidate.partyName || 'Independent'}
                    </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 italic">
                    "{candidate.bio || 'Representing the future of a digital democracy.'}"
                </p>
            </div>

            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700 text-slate-300">
                <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
            </div>
        </div>
    );
};


const VoterVote = ({ data, onTabChange }) => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [selectedIds, setSelectedIds] = useState([]);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteDetails, setVoteDetails] = useState({ txHash: '', timestamp: '' });
    const [electionState, setElectionState] = useState('active');

    const defaultOrder = data?.candidates?.map((_, idx) => idx.toString()) || [];
    const [rankedOrder, setRankedOrder] = useState(defaultOrder);

    const isRanked = data?.votingType === 'Ranked Voting';

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (data?.candidates) {
            setRankedOrder(data.candidates.map((_, idx) => idx.toString()));
        }
    }, [data?.candidates]);

    useEffect(() => {
        if (data?.userHasVoted) {
            setHasVoted(true);
            setVoteDetails({
                txHash: data.voteDetails?.txHash || '',
                timestamp: data.voteDetails?.timestamp ? new Date(data.voteDetails.timestamp).toLocaleString() : ''
            });
        }

        const checkState = () => {
            const now = new Date();
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (now < start) setElectionState('upcoming');
            else if (now > end) setElectionState('closed');
            else if (data.status !== 'active') setElectionState('closed');
            else setElectionState('active');
        };

        checkState();
        const timer = setInterval(checkState, 60000);
        return () => clearInterval(timer);
    }, [data]);

    const candidates = data?.candidates || [];

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setRankedOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleVoteSubmit = async () => {
        const isMultiple = data?.votingType === 'Multiple Choice';

        if (!isRanked && !isMultiple && selectedIds.length === 0) return;
        if (isMultiple && selectedIds.length !== data.maxVotes) return;

        setIsVoting(true);
        try {
            if (!executeRecaptcha) {
                alert("Security check not initialized. Please try again.");
                setIsVoting(false);
                return;
            }

            const captchaToken = await executeRecaptcha('vote_submit');

            const payload = {
                electionId: data._id,
                captchaToken
            };

            if (isRanked) {
                payload.rankedCandidateIds = rankedOrder.map(Number);
            } else if (isMultiple) {
                payload.selectedCandidateIds = selectedIds;
                payload.candidateId = selectedIds[0];
            } else {
                payload.candidateId = selectedIds[0];
            }

            const res = await api.post('/votes', payload);

            if (res.data.success) {
                setVoteDetails({
                    txHash: res.data.data.txHash,
                    timestamp: new Date().toLocaleString()
                });
                setHasVoted(true);
                setIsConfirming(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Voting failed. Please try again.');
        } finally {
            setIsVoting(false);
        }
    };

    const isMultiple = data?.votingType === 'Multiple Choice';
    const isReady = isRanked ||
        (isMultiple ? selectedIds.length === data.maxVotes : selectedIds.length === 1);

    const selectedCandidateNames = selectedIds.map(id => candidates[id]?.name).join(', ');

    if (hasVoted) {
        return (
            <div className="max-w-3xl mx-auto py-12 space-y-10 text-center animate-in zoom-in-95 duration-1000">
                <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-pulse"></div>
                    <div className="relative w-28 h-28 premium-gradient text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-900">
                        <CheckCircle2 className="w-16 h-16" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Vote Confirmed</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg uppercase tracking-widest">Digital Ballot ID Verified</p>
                </div>

                <div className="premium-card p-10 space-y-8 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                        <ShieldCheck className="w-40 h-40 text-blue-500" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Digital Receipt</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Receipt ID</label>
                                <div className="p-5 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs break-all border border-slate-800 shadow-2xl group flex items-start gap-4 cursor-alias select-all">
                                    <span className="opacity-40 mt-1">#</span>
                                    {voteDetails.txHash || '0x4f2d...93a1'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed At</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">{voteDetails.timestamp || 'Just now'}</p>
                                </div>
                                <div className="text-right">
                                    <button
                                        onClick={() => onTabChange && onTabChange('proof')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                                    >
                                        Check Receipt <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium leading-relaxed max-w-lg mx-auto italic">
                    "Your vote has been securely recorded and broadcasted to the network. It can no longer be modified or removed by any authority."
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800/50 pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Voting Open</div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cast Your Ballot</h2>
                    </div>
                    {electionState === 'upcoming' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-xl w-fit border border-blue-100 dark:border-blue-800/50">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Opens: {new Date(data.startDate).toLocaleString()}</span>
                        </div>
                    )}
                    {electionState === 'closed' && (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 px-4 py-2 rounded-xl w-fit border border-rose-100 dark:border-rose-800/50">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Polls officially closed</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/10 px-5 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Privacy Tier</p>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">Fully Encrypted</p>
                    </div>
                </div>
            </div>

            {isMultiple && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-5 p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                        <Info className="w-20 h-20" />
                    </div>
                    <div className={`p-3 rounded-2xl transition-colors ${selectedIds.length === data.maxVotes ? 'bg-emerald-500' : 'bg-blue-600'} text-white shadow-xl`}>
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest mb-1">Selection Quota</p>
                        <p className="text-xs font-bold opacity-80">
                            {selectedIds.length === data.maxVotes
                                ? `Requirement met: You have selected ${data.maxVotes} of ${data.maxVotes} candidates.`
                                : `Attention Required: Please finalize exactly ${data.maxVotes} choices to unlock your ballot.`}
                        </p>
                    </div>
                </motion.div>
            )}

            {isRanked ? (
                <div className="max-w-3xl mx-auto premium-card p-4 sm:p-12 border-slate-200 dark:border-slate-800">
                    <div className="mb-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <GripVertical className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Priority Ranking</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-md mx-auto">
                            Drag candidates to arrange them by preference. Your <span className="text-blue-600 dark:text-blue-400 font-black">top choice</span> should be at the very top.
                        </p>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={rankedOrder}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {rankedOrder.map((id, index) => (
                                    <div key={id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                        <SortableCandidateItem
                                            id={id}
                                            index={index}
                                            candidate={candidates[Number(id)]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {candidates.map((candidate, idx) => {
                        const isSelected = selectedIds.includes(idx);
                        return (
                            <motion.div
                                key={candidate._id || idx}
                                whileHover={electionState === 'active' ? { y: -12 } : {}}
                                whileTap={electionState === 'active' ? { scale: 0.98 } : {}}
                                onClick={() => {
                                    if (electionState !== 'active') return;
                                    if (isMultiple) {
                                        if (isSelected) {
                                            setSelectedIds(selectedIds.filter(id => id !== idx));
                                        } else if (selectedIds.length < data.maxVotes) {
                                            setSelectedIds([...selectedIds, idx]);
                                        }
                                    } else {
                                        setSelectedIds([idx]);
                                    }
                                }}
                                className={`
                                    group relative rounded-[40px] p-8 mt-12 border transition-all duration-500
                                    ${electionState === 'active' ? 'cursor-pointer' : 'cursor-not-allowed grayscale-0 opacity-80'}
                                    ${isSelected
                                        ? "border-blue-600 dark:border-blue-500 shadow-2xl shadow-blue-500/10 bg-white dark:bg-slate-800"
                                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-100 dark:hover:border-blue-900/50 shadow-sm hover:shadow-xl"}
                                `}
                            >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 z-10 transition-transform duration-700 group-hover:scale-110">
                                    <div className="absolute inset-0 bg-blue-500/30 rounded-[35px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <img
                                        src={candidate.photoUrl ? (candidate.photoUrl.startsWith('http') ? candidate.photoUrl : `${candidate.photoUrl}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${candidate.name}`}
                                        alt={candidate.name}
                                        className="relative w-full h-full rounded-[35px] object-cover border-[6px] border-white dark:border-slate-800 shadow-2xl"
                                    />
                                    {isSelected && (
                                        <div className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-2xl shadow-2xl z-20 animate-in zoom-in spin-in-90">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-20 text-center space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                            {candidate.name}
                                        </h3>
                                        <p className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                            {candidate.partyName || 'Independent Participant'}
                                        </p>
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium italic">
                                        "{candidate.bio || "Deduced to the service of our collective goal and the prosperity of this community."}"
                                    </p>

                                    <div className={`
                                        w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                                        ${isSelected
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"}
                                    `}>
                                        {isSelected ? "Selected" : "Mark Choice"}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {isReady && electionState === 'active' && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-slate-950/80 dark:bg-white/80 backdrop-blur-3xl border border-white/10 dark:border-slate-200 p-3 sm:px-6 sm:py-4 rounded-[40px] shadow-2xl z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-20 duration-1000">
                    <div className="flex items-center gap-4 py-2 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-xl animate-pulse">
                            {isRanked ? '★' : selectedIds.length}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                {isRanked ? 'Preference Set' : `${selectedIds.length} Candidate${selectedIds.length > 1 ? 's' : ''} Locked`}
                            </p>
                            <p className="text-sm font-black text-white dark:text-slate-900 truncate max-w-[200px]">
                                {isRanked ? 'Full Ranked List' : selectedCandidateNames}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsConfirming(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3"
                    >
                        Submit Vote <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            )}


            {isConfirming && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-[50px] shadow-2xl w-full max-w-lg overflow-hidden border border-white dark:border-slate-800"
                    >
                        <div className="p-12 space-y-10">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative">
                                <AlertCircle className="w-12 h-12" />
                            </div>

                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Final Confirmation</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
                                    You are about to securely sign your ballot for <span className="text-blue-600 dark:text-blue-400 font-black">{isRanked ? 'your optimized preference list' : selectedCandidateNames}</span>.
                                    Once officially recorded, this <span className="text-slate-900 dark:text-white font-black underline underline-offset-4 decoration-rose-500">cannot be undone</span>.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleVoteSubmit}
                                    disabled={isVoting}
                                    className={`
                                        w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all flex items-center justify-center gap-3
                                        ${isVoting ? 'bg-slate-400' : 'bg-slate-900 dark:bg-blue-600 hover:scale-[1.02] active:scale-95'}
                                    `}
                                >
                                    {isVoting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Vote'}
                                </button>
                                <button
                                    onClick={() => setIsConfirming(false)}
                                    className="w-full py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                                >
                                    Back to Selections
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VoterVote;
