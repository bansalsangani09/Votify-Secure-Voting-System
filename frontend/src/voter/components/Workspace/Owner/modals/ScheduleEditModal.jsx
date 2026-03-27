import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, X, Loader2, Save, Info } from 'lucide-react';
import api from '../../../../../utils/api';

const ScheduleEditModal = ({ isOpen, onClose, electionData, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        autoActivate: true,
        autoClose: true,
        resultTime: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (electionData) {
            const start = new Date(electionData.startDate);
            const end = new Date(electionData.endDate);

            setFormData({
                startDate: start.toISOString().split('T')[0],
                startTime: start.toTimeString().slice(0, 5),
                endDate: end.toISOString().split('T')[0],
                endTime: end.toTimeString().slice(0, 5),
                autoActivate: electionData.autoActivate ?? true,
                autoClose: electionData.autoClose ?? true,
                resultTime: electionData.resultTime ? new Date(electionData.resultTime).toISOString().slice(0, 16) : ''
            });
        }
    }, [electionData, isOpen]);

    if (!isOpen) return null;

    const isPaused = electionData?.status === 'paused';
    const isDraft = electionData?.status === 'draft';
    const isScheduled = electionData?.status === 'scheduled';
    const canEdit = isPaused || isDraft || isScheduled;

    const handleUpdate = async () => {
        if (!canEdit) return;

        // Time Validation
        if (!formData.startDate || !formData.startTime) {
            setError('Start date and time are required');
            return;
        }
        if (!formData.endDate || !formData.endTime) {
            setError('End date and time are required');
            return;
        }

        const now = new Date();
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const end = new Date(`${formData.endDate}T${formData.endTime}`);

        if (start < now) {
            setError('Start time cannot be in the past');
            return;
        }
        if (end <= start) {
            setError('End time must be after start time');
            return;
        }

        if (formData.resultTime) {
            const result = new Date(formData.resultTime);
            if (result <= end) {
                setError('Result declaration time must be after end time');
                return;
            }
        }

        setError(''); // Clear errors

        try {
            setLoading(true);
            const res = await api.patch(`/elections/${electionData._id}`, formData);
            if (res.data.success) {
                alert('Schedule updated successfully');
                onUpdate(res.data.data);
                onClose();
            }
        } catch (err) {
            console.error('Update schedule error:', err);
            setError(err.response?.data?.message || 'Failed to update schedule');
        } finally {
            setLoading(false);
        }
    };

    const Toggle = ({ label, value, onChange, desc, disabled }) => (
        <div
            className={`flex items-center justify-between p-4 rounded-2xl transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
            onClick={() => !disabled && onChange(!value)}
        >
            <div className="flex-1">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <div className={`
                w-12 h-6 rounded-full relative transition-all
                ${value ? 'bg-indigo-600' : 'bg-gray-200'}
            `}>
                <div className={`
                    absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all
                    ${value ? 'translate-x-6' : ''}
                `}></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Manage Schedule</h2>
                        <p className="text-sm text-gray-500 font-medium">Update election timeline and settings</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {!canEdit && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-amber-800">
                                Schedule can only be edited when the election is **PAUSED**, **SCHEDULED**, or in **DRAFT** status.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {/* Start Date & Time */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Start Date & Time</label>
                            <div className="flex gap-3">
                                <div className="w-60 relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        disabled={!canEdit}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all disabled:opacity-50"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1 relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="time"
                                        disabled={!canEdit}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all disabled:opacity-50"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* End Date & Time */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">End Date & Time</label>
                            <div className="flex gap-3">
                                <div className="w-60 relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        disabled={!canEdit}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all disabled:opacity-50"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1 relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="time"
                                        disabled={!canEdit}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all disabled:opacity-50"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2">
                        <Toggle
                            label="Auto Activate"
                            value={formData.autoActivate}
                            disabled={!canEdit}
                            onChange={(val) => setFormData({ ...formData, autoActivate: val })}
                            desc="Election will start automatically at the set time"
                        />
                        <Toggle
                            label="Auto Close"
                            value={formData.autoClose}
                            disabled={!canEdit}
                            onChange={(val) => setFormData({ ...formData, autoClose: val })}
                            desc="Election will stop accepting votes at the set time"
                        />
                    </div>

                    {/* Result Time */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Result Declaration Time</label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="datetime-local"
                                disabled={!canEdit}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all disabled:opacity-50"
                                value={formData.resultTime}
                                onChange={(e) => setFormData({ ...formData, resultTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 flex justify-end gap-3 mt-auto">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading || !canEdit}
                        className={`
                            px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95
                            ${!canEdit ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}
                        `}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEditModal;
