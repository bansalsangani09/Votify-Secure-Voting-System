import React from 'react';
import { Shield, Clock, Users, Calendar, CheckCircle2, AlertCircle, FileText, Globe } from 'lucide-react';

const Step7Review = ({ data }) => {
    const SummaryItem = ({ icon: Icon, label, value, color = 'indigo' }) => (
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-50 bg-white">
            <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Overview Card */}
            <div className="relative p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] text-white shadow-xl shadow-indigo-200 overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            {data.category}
                        </span>
                        {data.position && (
                            <span className="px-3 py-1 bg-indigo-400/30 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/20">
                                {data.position}
                            </span>
                        )}
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight">{data.title || 'Untitled Election'}</h2>
                    <p className="text-indigo-100 text-sm max-w-2xl line-clamp-2">
                        {data.description || 'No description provided.'}
                    </p>
                </div>
                <FileText className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Settings Summary */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        Schedule Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <SummaryItem label="Start Date" value={`${data.startDate} | ${data.startTime}`} icon={Clock} />
                        <SummaryItem label="End Date" value={`${data.endDate} | ${data.endTime}`} icon={Clock} color="blue" />
                        <SummaryItem label="Result Time" value={data.resultTime || 'Immediate'} icon={CheckCircle2} color="green" />
                    </div>
                </div>

                {/* Voting Rules */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Security & Rules
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <SummaryItem label="Voting Type" value={data.votingType} icon={Users} color="purple" />

                        <SummaryItem label="Privacy" value={data.anonymous ? 'Full Anonymity' : 'Public Record'} icon={Globe} color="cyan" />
                    </div>
                </div>
            </div>

            {/* Candidates Summary */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-3">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Candidates ({data.candidates.length})
                </h3>
                <div className="flex flex-wrap gap-4">
                    {data.candidates.length > 0 ? (
                        data.candidates.map(candidate => (
                            <div key={candidate.id} className="flex items-center gap-3 bg-white p-3 pr-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                    {candidate.photo || candidate.name ? (
                                        <img src={candidate.photo ? (candidate.photo.startsWith('http') ? candidate.photo : `${candidate.photo}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${candidate.name || 'default'}`} alt="" className="w-full h-full object-cover" />
                                    ) : candidate.name.charAt(0) || '?'}
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-none">{candidate.name || 'Anonymous'}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Candidate</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 font-bold italic">
                            No candidates added. Are you sure you want to proceed?
                        </div>
                    )}
                </div>
            </div>

            {/* Final Warning */}
            <div className="p-6 bg-amber-50 rounded-[32px] border-2 border-amber-100 flex items-center gap-6">
                <div className="bg-white p-4 rounded-3xl shadow-sm text-amber-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-amber-900 text-lg leading-tight">Final Check</h4>
                    <p className="text-amber-700/70 text-sm mt-1">Once published, some settings like voting type and visibility cannot be changed. Please review all details carefully.</p>
                </div>
            </div>

        </div>
    );
};

export default Step7Review;
