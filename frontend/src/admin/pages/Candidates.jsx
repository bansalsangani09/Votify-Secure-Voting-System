import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, EyeOff, Loader2, Image as ImageIcon, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AddEditCandidateModal = ({ isOpen, onClose, onSave, candidate, electionId }) => {
    const [formData, setFormData] = useState({
        name: '',
        partyName: '',
        photo: null,
        bio: ''
    });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name || '',
                partyName: candidate.partyName || '',
                photo: candidate.photoUrl || candidate.photo || null,
                bio: candidate.bio || ''
            });
        } else {
            setFormData({ name: '', partyName: '', photo: null, bio: '' });
        }
    }, [candidate, isOpen]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setUploading(true);

        try {
            const res = await api.post('/elections/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setFormData(prev => ({ ...prev, photo: res.data.data }));
                toast.success('Image uploaded');
            }
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (candidate) {
                const res = await api.put(`/elections/${electionId}/candidates/${candidate._id}`, formData);
                if (res.data.success) {
                    onSave();
                    toast.success('Candidate updated');
                    onClose();
                }
            } else {
                const res = await api.post(`/elections/${electionId}/candidates`, formData);
                if (res.data.success) {
                    onSave();
                    toast.success('Candidate added');
                    onClose();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save candidate');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{candidate ? 'Edit Candidate' : 'Add Candidate'}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[28px] bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                    ) : formData.photo || formData.name ? (
                                        <img
                                            src={formData.photo ? (formData.photo.startsWith('http') ? formData.photo : `${formData.photo}`) : `https://api.dicebear.com/7.x/personas/svg?seed=${formData.name || 'default'}`}
                                            className="w-full h-full object-cover"
                                            alt="Candidate"
                                        />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-1.5 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                    placeholder="Enter candidate name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Party / Affiliation</label>
                                <input
                                    required
                                    value={formData.partyName}
                                    onChange={e => setFormData({ ...formData, partyName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                    placeholder="Enter party name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bio / Manifesto</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none h-24"
                                    placeholder="Brief background or goals"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {candidate ? 'Update' : 'Add Candidate'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const Candidates = () => {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);

    const fetchElections = async () => {
        try {
            const res = await api.get('/admin/elections');
            const data = res.data.data || [];
            setElections(data);
            if (data.length > 0 && !selectedElection) {
                setSelectedElection(data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching elections:', error);
            toast.error('Failed to load elections');
        }
    };

    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        try {
            if (selectedElection === 'all') {
                const res = await api.get('/admin/elections');
                const allElections = res.data.data || [];
                const flattenedCandidates = [];

                allElections.forEach(elec => {
                    const elecCandidates = (elec.candidates || []).map(c => ({
                        ...c,
                        electionTitle: elec.title,
                        electionId: elec._id
                    }));
                    flattenedCandidates.push(...elecCandidates);
                });

                setCandidates(flattenedCandidates);
            } else if (selectedElection) {
                const detailsRes = await api.get(`/admin/elections/${selectedElection}`);
                const electionData = detailsRes.data.data;
                const elecCandidates = (electionData.candidates || []).map(c => ({
                    ...c,
                    electionTitle: electionData.title,
                    electionId: electionData._id
                }));
                setCandidates(elecCandidates);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    }, [selectedElection]);

    useEffect(() => {
        fetchElections();
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const handleDelete = async (candidateId) => {
        if (!window.confirm('Are you sure you want to remove this candidate?')) return;
        try {
            const res = await api.delete(`/elections/${selectedElection}/candidates/${candidateId}`);
            if (res.data.success) {
                toast.success('Candidate removed');
                fetchCandidates();
            }
        } catch (err) {
            toast.error('Failed to delete candidate');
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.partyName || 'Independent').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Candidates Management</h2>
                    <p className="text-gray-500 mt-1">Manage election participants and track their performance.</p>
                </div>
                <button
                    onClick={() => { setEditingCandidate(null); setIsModalOpen(true); }}
                    disabled={!selectedElection}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-indigo-200 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Add Candidate
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                )}
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or party..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                value={selectedElection}
                                onChange={(e) => setSelectedElection(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                            >
                                <option value="" disabled>Select Election</option>
                                <option value="all">All Elections</option>
                                {elections.map(e => (
                                    <option key={e._id} value={e._id}>{e.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Party / Bio</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Election Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Live Votes</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredCandidates.length > 0 ? (
                                filteredCandidates.map((candidate) => (
                                    <tr key={candidate._id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 uppercase overflow-hidden">
                                                    {candidate.photo ? (
                                                        <img
                                                            src={candidate.photo.startsWith('http') ? candidate.photo : `${candidate.photo}`}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    ) : candidate.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                </div>
                                                <span className="font-bold text-gray-900">{candidate.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 font-semibold">{candidate.partyName || 'Independent'}</span>
                                                <span className="text-gray-400 text-[10px] line-clamp-1">{candidate.bio}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-gray-800 font-bold text-[11px] text-center">
                                                    {candidate.electionTitle || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <span className="font-black text-indigo-600">{candidate.voteCount?.toLocaleString() || 0}</span>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${Math.min(
                                                                ((candidate.voteCount || 0) / (candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 1)) * 100,
                                                                100
                                                            )}%`
                                                        }}
                                                        className="h-full bg-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                                Qualified
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingCandidate(candidate); setIsModalOpen(true); }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                                    title="Edit Candidate"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(candidate._id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                                                    title="Remove Candidate"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <Filter className="w-6 h-6 text-gray-200" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-400 italic">No candidates found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Total {filteredCandidates.length} Active Participants
                    </p>
                </div>
            </div>

            <AddEditCandidateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchCandidates}
                candidate={editingCandidate}
                electionId={selectedElection}
            />
        </div>
    );
};

export default Candidates;
