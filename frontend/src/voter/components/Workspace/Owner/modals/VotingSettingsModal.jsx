import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Shield, Eye, Award, CheckCircle2, Info, Globe, Activity, Lock as LockIcon } from 'lucide-react';
import api from '../../../../../utils/api';

const VotingSettingsModal = ({ isOpen, onClose, electionData, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        votingType: 'Single Choice',
        maxVotes: 1,
        anonymous: true,
        allowLiveResults: false,
        liveResultsEnabled: false,
        publicResultsVisible: false
    });

    useEffect(() => {
        if (electionData) {
            setFormData({
                votingType: electionData.votingType || 'Single Choice',
                maxVotes: electionData.maxVotes || 1,
                anonymous: electionData.anonymous !== undefined ? electionData.anonymous : true,
                allowLiveResults: electionData.allowLiveResults !== undefined ? electionData.allowLiveResults : false,
                liveResultsEnabled: electionData.liveResultsEnabled !== undefined ? electionData.liveResultsEnabled : (electionData.allowLiveResults || false),
                publicResultsVisible: electionData.publicResultsVisible !== undefined ? electionData.publicResultsVisible : false
            });
        }
    }, [electionData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 🛡️ MAX VOTES VALIDATION
        if (formData.votingType === 'Multiple Choice' && formData.maxVotes > electionData.candidates.length) {
            setError(`Maximum selections (${formData.maxVotes}) cannot exceed the number of candidates (${electionData.candidates.length})`);
            return;
        }

        setLoading(true);

        try {
            const res = await api.patch(`/elections/${electionData._id}`, formData);
            if (res.data.success) {
                alert('Voting settings updated successfully');
                onUpdate(res.data.data);
                onClose();
            }
        } catch (err) {
            console.error('Update voting settings error:', err);
            setError(err.response?.data?.message || 'Failed to update voting settings');
        } finally {
            setLoading(false);
        }
    };

    const OptionCard = ({ label, icon: Icon, active, onClick, desc }) => (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex flex-col items-start p-4 rounded-2xl border-2 transition-all group w-full
                ${active ? 'bg-indigo-50 border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}
            `}
        >
            <div className={`p-2.5 rounded-xl mb-3 transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className={`font-bold text-xs mb-1 ${active ? 'text-indigo-900' : 'text-gray-700'}`}>{label}</p>
            <p className="text-[10px] text-gray-400 text-left line-clamp-2 leading-tight">{desc}</p>
            {active && <CheckCircle2 className="w-3 h-3 text-indigo-600 mt-2 ml-auto animate-in zoom-in" />}
        </button>
    );

    const Toggle = ({ icon: Icon, label, value, onChange, desc, color = 'indigo' }) => (
        <div
            className={`
                flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer bg-white
                ${value ? `border-${color}-100 shadow-sm ring-1 ring-${color}-50` : 'border-gray-100 hover:border-gray-200'}
            `}
            onClick={() => onChange(!value)}
        >
            <div className={`p-2 rounded-xl ${value ? `bg-${color}-50 text-${color}-600` : 'bg-gray-50 text-gray-400'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
            </div>
            <div className={`
                w-9 h-4.5 rounded-full relative transition-all shrink-0
                ${value ? (color === 'indigo' ? 'bg-indigo-600' : 'bg-blue-500') : 'bg-gray-200'}
            `}>
                <div className={`
                    absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all
                    ${value ? 'translate-x-4.5' : ''}
                `}></div>
            </div>
        </div>
    );

    const Layers = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Voting Settings</h2>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">Configure election rules & privacy</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 animate-in slide-in-from-top-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium leading-tight">{error}</p>
                            </div>
                        )}

                        {/* Voting Type Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                                <h3 className="font-bold text-gray-800 uppercase tracking-widest text-[10px]">Voting Type</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <OptionCard
                                    label="Single Choice"
                                    icon={CheckCircle2}
                                    active={formData.votingType === 'Single Choice'}
                                    onClick={() => setFormData({ ...formData, votingType: 'Single Choice', maxVotes: 1 })}
                                    desc="Select one candidate"
                                />
                                <OptionCard
                                    label="Multiple Choice"
                                    icon={Layers}
                                    active={formData.votingType === 'Multiple Choice'}
                                    onClick={() => setFormData({ ...formData, votingType: 'Multiple Choice' })}
                                    desc="Select multiple"
                                />
                                <OptionCard
                                    label="Ranked Voting"
                                    icon={Award}
                                    active={formData.votingType === 'Ranked Voting'}
                                    onClick={() => setFormData({ ...formData, votingType: 'Ranked Voting' })}
                                    desc="Rank candidates"
                                />
                            </div>

                            {formData.votingType === 'Multiple Choice' && (
                                <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 border border-gray-100">
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-tight">Max selection allowed</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, maxVotes: Math.max(1, formData.maxVotes - 1) })}
                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                                        >-</button>
                                        <span className="w-6 text-center text-sm font-bold text-gray-800">{formData.maxVotes}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, maxVotes: formData.maxVotes + 1 })}
                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                                        >+</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Privacy & Visibility */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                <h3 className="font-bold text-gray-800 uppercase tracking-widest text-[10px]">Security & Privacy</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Toggle
                                    icon={Eye}
                                    label="Anonymous"
                                    value={formData.anonymous}
                                    onChange={(val) => setFormData({ ...formData, anonymous: val })}
                                    desc="Hide voter identities"
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                    <p className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">Live Result Visibility</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <OptionCard
                                        label="Results OFF"
                                        icon={LockIcon}
                                        active={!formData.liveResultsEnabled}
                                        onClick={() => setFormData({ ...formData, liveResultsEnabled: false, publicResultsVisible: false, allowLiveResults: false })}
                                        desc="No live monitoring"
                                    />
                                    <OptionCard
                                        label="Admin/Owner Only"
                                        icon={Shield}
                                        active={formData.liveResultsEnabled && !formData.publicResultsVisible}
                                        onClick={() => setFormData({ ...formData, liveResultsEnabled: true, publicResultsVisible: false, allowLiveResults: true })}
                                        desc="Only staff access"
                                    />
                                    <OptionCard
                                        label="Public Live"
                                        icon={Globe}
                                        active={formData.liveResultsEnabled && formData.publicResultsVisible}
                                        onClick={() => setFormData({ ...formData, liveResultsEnabled: true, publicResultsVisible: true, allowLiveResults: true })}
                                        desc="Everyone can see"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-gray-50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VotingSettingsModal;
