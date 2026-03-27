import { Users, Plus, Upload, MoreVertical, Trash2, Edit2, BarChart3, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import CandidateEditModal from '../modals/CandidateEditModal';
import api from '../../../../../utils/api';

const OwnerCandidates = ({ data, onUpdateElection }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const candidates = data?.candidates?.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map((c, idx) => ({
        ...c,
        id: c._id || idx,
        votes: c.voteCount || 0,
        status: data?.status === 'closed' ? 'Closed' : 'Active',
        photo: (c.photoUrl ? (c.photoUrl.startsWith('http') ? c.photoUrl : `${c.photoUrl}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${c.name}`)

    })) || [];

    const handleDelete = async (candidateId) => {
        if (!window.confirm('Are you sure you want to remove this candidate?')) return;

        try {
            const res = await api.delete(`/elections/${data._id}/candidates/${candidateId}`);
            if (res.data.success) {
                alert('Candidate removed successfully');
                onUpdateElection(res.data.data);
            }
        } catch (err) {
            console.error('Delete candidate error:', err);
            alert(err.response?.data?.message || 'Failed to remove candidate');
        }
    };

    const handleEdit = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCandidate(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAdd}
                        disabled={data?.status !== 'scheduled' && data?.status !== 'draft'}
                        title={(data?.status !== 'scheduled' && data?.status !== 'draft') ? 'Cannot add candidates once election has started or closed' : 'Add Candidate'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${(data?.status === 'scheduled' || data?.status === 'draft')
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        Add Candidate
                    </button>
                </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {candidates.map((candidate) => (
                    <div
                        key={candidate.id}
                        className="group relative rounded-[32px] p-8 border border-gray-100 bg-white hover:border-indigo-200 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 shadow-sm"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 left-6">
                            <span className={`
                                px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                                ${candidate.status === 'Active' ? 'bg-green-50/50 text-green-600 border border-green-100' : 'bg-red-50/50 text-red-600 border border-red-100'}
                            `}>
                                {candidate.status}
                            </span>
                        </div>

                        {/* Votes Badge */}
                        <div className="absolute top-6 right-6">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                <BarChart3 className="w-3 h-3" />
                                {candidate.votes} Votes
                            </div>
                        </div>

                        {/* Candidate Image */}
                        <div className="relative mx-auto w-32 h-32 mt-4">
                            <div className="absolute inset-0 bg-indigo-100 rounded-[32px] blur-2xl opacity-40 group-hover:opacity-70 transition-all"></div>
                            <img
                                src={candidate.photo}
                                alt={candidate.name}
                                className="relative w-full h-full rounded-[32px] object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Candidate Info */}
                        <div className="mt-8 text-center space-y-3">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                {candidate.name}
                            </h3>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Users className="w-3 h-3" />
                                {candidate.partyName || 'Independent'}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed px-4 font-medium">
                                {candidate.bio || "Official candidate for this election."}
                            </p>
                        </div>

                        {/* Actions Overlay */}
                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={() => (data?.status === 'scheduled' || data?.status === 'draft') && handleEdit(candidate)}
                                disabled={data?.status !== 'scheduled' && data?.status !== 'draft'}
                                title={data?.status !== 'scheduled' && data?.status !== 'draft' ? 'Cannot edit candidates once election has started or closed' : 'Edit Candidate'}
                                className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${(data?.status === 'scheduled' || data?.status === 'draft')
                                    ? 'bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border-transparent hover:border-indigo-100'
                                    : 'bg-gray-50/50 text-gray-300 border-transparent cursor-not-allowed'
                                    }`}
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => (data?.status === 'scheduled' || data?.status === 'draft') && data.candidates.length > 2 && handleDelete(candidate._id)}
                                disabled={data?.status !== 'scheduled' && data?.status !== 'draft' || data.candidates.length <= 2}
                                title={data?.status !== 'scheduled' && data?.status !== 'draft' ? 'Cannot remove candidates once election has started or closed' : data.candidates.length <= 2 ? 'An election must have at least 2 candidates' : 'Remove Candidate'}
                                className={`p-3 rounded-2xl transition-all border flex-1 flex items-center justify-center gap-2 ${(data?.status === 'scheduled' || data?.status === 'draft') && data.candidates.length > 2
                                    ? 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 border-transparent hover:border-red-100'
                                    : 'bg-gray-50/50 text-gray-300 border-transparent cursor-not-allowed'
                                    }`}
                            >
                                <Trash2 className="w-4 h-4" />
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {candidates.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                            <Users className="w-10 h-10 text-gray-200" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900">No Candidates Found</p>
                            <p className="text-sm text-gray-500 font-medium">Try adjusting your search or add a new candidate.</p>
                        </div>
                    </div>
                )}
            </div>

            <CandidateEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                electionId={data._id}
                candidate={selectedCandidate}
                onUpdate={onUpdateElection}
            />
        </div>
    );
};

export default OwnerCandidates;
