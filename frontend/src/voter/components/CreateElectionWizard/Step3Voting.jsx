import React from 'react';
import { Shield, Lock as LockIcon, Eye, CheckCircle2, Award, Globe, Activity, AlertCircle } from 'lucide-react';

const Step3Voting = ({ data, setData }) => {
    const OptionCard = ({ id, label, icon: Icon, active, onClick, desc }) => (
        <button
            onClick={onClick}
            className={`
        flex flex-col items-start p-5 rounded-2xl border-2 transition-all group
        ${active ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}
      `}
        >
            <div className={`p-3 rounded-xl mb-4 transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className={`font-bold text-sm mb-1 ${active ? 'text-indigo-900' : 'text-gray-700'}`}>{label}</p>
            <p className="text-xs text-gray-400 text-left line-clamp-2">{desc}</p>
            {active && <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-3 ml-auto animate-in zoom-in" />}
        </button>
    );

    const Toggle = ({ icon: Icon, label, value, onChange, desc }) => (
        <div
            className={`
        flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer bg-white
        ${value ? 'border-indigo-100 shadow-sm ring-1 ring-indigo-50' : 'border-gray-100 hover:border-indigo-50'}
      `}
            onClick={() => onChange(!value)}
        >
            <div className={`p-2.5 rounded-xl ${value ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
            </div>
            <div className={`
        w-10 h-5 rounded-full relative transition-all shrink-0
        ${value ? 'bg-indigo-600' : 'bg-gray-200'}
      `}>
                <div className={`
          absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all
          ${value ? 'translate-x-5' : ''}
        `}></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Voting Type Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Voting Type</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <OptionCard
                        label="Single Choice"
                        icon={CheckCircle2}
                        active={data.votingType === 'Single Choice'}
                        onClick={() => setData({ ...data, votingType: 'Single Choice', maxVotes: 1 })}
                        desc="Voters can select only one candidate from the list."
                    />
                    <OptionCard
                        label="Multiple Choice"
                        icon={Layers}
                        active={data.votingType === 'Multiple Choice'}
                        onClick={() => setData({ ...data, votingType: 'Multiple Choice' })}
                        desc="Voters can select multiple candidates up to a limit."
                    />
                    <OptionCard
                        label="Ranked Voting"
                        icon={Award}
                        active={data.votingType === 'Ranked Voting'}
                        onClick={() => setData({ ...data, votingType: 'Ranked Voting' })}
                        desc="Voters rank candidates in order of preference."
                    />
                </div>

                {data.votingType === 'Multiple Choice' && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-600">Maximum selection allowed</p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setData({ ...data, maxVotes: Math.max(1, data.maxVotes - 1) })}
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                                >-</button>
                                <span className="w-8 text-center font-bold text-gray-800">{data.maxVotes}</span>
                                <button
                                    onClick={() => setData({ ...data, maxVotes: data.maxVotes + 1 })}
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                                >+</button>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <p className="text-[11px] font-bold text-amber-700 leading-tight">
                                <strong>Requirement:</strong> You must add at least <strong>{data.maxVotes} candidates</strong> in the next step to support this configuration.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Security & Privacy */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Security & Privacy</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Toggle
                        icon={Eye}
                        label="Anonymous Voting"
                        value={data.anonymous}
                        onChange={(val) => setData({ ...data, anonymous: val })}
                        desc="Hide voter identities in the final results"
                    />

                    <div className="md:col-span-2 lg:col-span-3 space-y-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            <p className="text-sm font-bold text-gray-800">Live Result Visibility</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <OptionCard
                                label="Results OFF"
                                icon={LockIcon}
                                active={!data.liveResultsEnabled}
                                onClick={() => setData({ ...data, liveResultsEnabled: false, publicResultsVisible: false, allowLiveResults: false })}
                                desc="No one can see results until closed"
                            />
                            <OptionCard
                                label="Admin/Owner Only"
                                icon={Shield}
                                active={data.liveResultsEnabled && !data.publicResultsVisible}
                                onClick={() => setData({ ...data, liveResultsEnabled: true, publicResultsVisible: false, allowLiveResults: true })}
                                desc="Only staff can monitor live progress"
                            />
                            <OptionCard
                                label="Public Live"
                                icon={Globe}
                                active={data.liveResultsEnabled && data.publicResultsVisible}
                                onClick={() => setData({ ...data, liveResultsEnabled: true, publicResultsVisible: true, allowLiveResults: true })}
                                desc="Turnout & results visible to all"
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

const Layers = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

export default Step3Voting;
