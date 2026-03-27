import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Image as ImageIcon, Info } from 'lucide-react';
import api from '../../../../../utils/api';

const CandidateEditModal = ({ isOpen, onClose, electionId, candidate, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        partyName: '',
        bio: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');


    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name || '',
                partyName: candidate.partyName || '',
                bio: candidate.bio || ''
            });
        } else {
            setFormData({
                name: '',
                partyName: '',
                bio: ''
            });
        }
        setImageFile(null);
        setPreviewUrl('');
        setError('');
    }, [candidate, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };


    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name) {
            setError('Candidate name is required');
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('partyName', formData.partyName || 'Independent');
            data.append('bio', formData.bio);
            if (imageFile) {
                data.append('image', imageFile);
            }

            let res;
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (candidate?._id) {
                // Update
                res = await api.put(`/elections/${electionId}/candidates/${candidate._id}`, data, config);
            } else {
                // Add
                res = await api.post(`/elections/${electionId}/candidates`, data, config);
            }

            if (res.data.success) {
                alert(candidate?._id ? 'Candidate updated successfully' : 'Candidate added successfully');
                onUpdate(res.data.data);
                onClose();
            }
        } catch (err) {
            console.error('Candidate action error:', err);
            setError(err.response?.data?.message || 'Failed to process candidate action');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">{candidate ? 'Edit Candidate' : 'Add Candidate'}</h2>
                        <p className="text-sm text-gray-500 font-medium">Enter candidate details below</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
                                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium leading-tight">{error}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Photo Preview */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-[28px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                                <img
                                    src={previewUrl || (candidate?.photoUrl ? (candidate.photoUrl.startsWith('http') ? candidate.photoUrl : `${candidate.photoUrl}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${formData.name || 'default'}`)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>


                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter candidate name"
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Party / Affiliation</label>
                                    <input
                                        type="text"
                                        placeholder="Enter party name"
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                        value={formData.partyName}
                                        onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Upload Photo</label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold hover:bg-gray-100 transition-all border-dashed border-gray-200">
                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {imageFile ? imageFile.name : 'Choose image...'}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                {imageFile && (
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setPreviewUrl(''); }}
                                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bio / Description</label>
                            <textarea
                                placeholder="Short bio or manifesto..."
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            ></textarea>
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
                            {candidate ? 'Save Changes' : 'Add Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CandidateEditModal;
