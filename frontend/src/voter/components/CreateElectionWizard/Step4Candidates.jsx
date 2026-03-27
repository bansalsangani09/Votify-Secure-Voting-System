import React from 'react';
import { Plus, Trash2, User, Image as ImageIcon, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../utils/api';

const Step4Candidates = ({ data, setData }) => {
    const addCandidate = () => {
        const newCandidate = {
            id: Date.now(),
            name: '',
            partyName: '',
            description: '',
            photo: null
        };
        setData({ ...data, candidates: [...data.candidates, newCandidate] });
    };

    const removeCandidate = (id) => {
        if (data.candidates.length <= 2) {
            toast.error('An election must have at least 2 candidates');
            return;
        }
        setData({ ...data, candidates: data.candidates.filter(c => c.id !== id) });
    };

    const updateCandidate = (id, field, value) => {
        // Create a new array with the intended update applied
        const updatedCandidates = data.candidates.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        );

        // Check for duplicates - only care about name, partyName, and description similarities
        // if user filled them out (ignore if they are mostly empty defaults)
        const currentCandidate = updatedCandidates.find(c => c.id === id);

        if (currentCandidate && currentCandidate.name.trim() !== '') {
            const isDuplicate = updatedCandidates.some(c =>
                c.id !== id &&
                c.name.toLowerCase().trim() === currentCandidate.name.toLowerCase().trim() &&
                c.partyName?.toLowerCase().trim() === currentCandidate.partyName?.toLowerCase().trim() &&
                c.description?.toLowerCase().trim() === currentCandidate.description?.toLowerCase().trim()
            );

            if (isDuplicate) {
                toast.error('A candidate with these exact details already exists!', { id: 'dup-candidate' });
                // Do not apply the update if it creates a perfect duplicate
                return;
            }
        }

        setData({
            ...data,
            candidates: updatedCandidates
        });
    };

    const handleImageChange = async (candidateId, e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                // Update candidate state to show loading if needed
                updateCandidate(candidateId, 'uploading', true);

                const res = await api.post('/elections/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    updateCandidate(candidateId, 'photo', res.data.data);
                }
            } catch (err) {
                console.error('Upload error:', err);
                alert('Failed to upload image. Please try again.');
            } finally {
                updateCandidate(candidateId, 'uploading', false);
            }
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-800">Candidates List</h3>
                    <p className="text-sm text-gray-400">Total {data.candidates.length} candidates added</p>
                </div>
                <button
                    onClick={addCandidate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <PlusCircle className="w-5 h-5" />
                    Add Candidate
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.candidates.map((candidate, idx) => (
                    <div
                        key={candidate.id}
                        className="bg-white border-2 border-gray-50 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all relative group animate-in zoom-in-95 duration-300"
                    >
                        <button
                            onClick={() => removeCandidate(candidate.id)}
                            disabled={data.candidates.length <= 2}
                            title={data.candidates.length <= 2 ? 'At least 2 candidates required' : 'Remove Candidate'}
                            className={`absolute top-4 right-4 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${data.candidates.length <= 2 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Photo Upload Placeholder */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-[28px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group/photo shrink-0 overflow-hidden relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleImageChange(candidate.id, e)}
                                />
                                {candidate.uploading ? (
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                ) : candidate.photo || candidate.name ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={candidate.photo ? (candidate.photo.startsWith('http') ? candidate.photo : `${candidate.photo}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${candidate.name || 'default'}`}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover/photo:text-indigo-600 transition-colors" />
                                        <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest group-hover/photo:text-indigo-400">Upload</span>
                                    </>
                                )}
                            </div>


                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Candidate Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                        value={candidate.name}
                                        onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Party / Affiliation</label>
                                    <input
                                        type="text"
                                        placeholder="Enter party name"
                                        className="w-full px-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                        value={candidate.partyName}
                                        onChange={(e) => updateCandidate(candidate.id, 'partyName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        placeholder="Short bio or manifesto..."
                                        rows="2"
                                        className="w-full px-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none"
                                        value={candidate.description}
                                        onChange={(e) => updateCandidate(candidate.id, 'description', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {data.candidates.length === 0 && (
                    <div className="col-span-1 md:col-span-2 p-12 text-center bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                            <User className="w-10 h-10 text-gray-200" />
                        </div>
                        <h4 className="font-bold text-gray-400">No candidates added yet</h4>
                        <p className="text-sm text-gray-300 mt-1 max-w-xs">Add candidates to their respective slots by clicking the button above.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Step4Candidates;
