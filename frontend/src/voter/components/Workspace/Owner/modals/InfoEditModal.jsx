import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Type, AlignLeft, Tag, Briefcase } from 'lucide-react';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';

const InfoEditModal = ({ isOpen, onClose, electionData, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        position: '',
        category: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (electionData && isOpen) {
            setFormData({
                title: electionData.title || '',
                description: electionData.description || '',
                position: electionData.position || '',
                category: electionData.category || ''
            });
        }
    }, [electionData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        try {
            setLoading(true);
            const res = await api.patch(`/elections/${electionData._id || electionData.id}`, formData);
            if (res.data.success) {
                toast.success('Election info updated');
                onUpdate(res.data.data);
                onClose();
            }
        } catch (err) {
            console.error('Update info error:', err);
            toast.error(err.response?.data?.message || 'Failed to update election info');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-indigo-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Type className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Edit Election Info</h2>
                            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mt-0.5">Basic Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Election Title</label>
                        <div className="relative group">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                placeholder="Enter election title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Position / Office</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                placeholder="e.g. CEO, Secretary, President"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                placeholder="e.g. Corporate, Academic, Social"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                        <div className="relative group">
                            <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <textarea
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all min-h-[120px] resize-none"
                                placeholder="Describe the purpose of this election..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoEditModal;
