import React, { useState } from 'react';
import { X, Loader2, Lock as LockIcon, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../../utils/api';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            if (!executeRecaptcha) {
                setError('ReCAPTCHA not initialized');
                setLoading(false);
                return;
            }

            const captchaToken = await executeRecaptcha('reset_password');

            const res = await api.put('/users/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                captchaToken
            });

            if (res.data.success) {
                setSuccess('Password updated successfully!');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(onClose, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Change Password</h2>
                        <p className="text-sm text-gray-500 font-medium">Secure your account with a new password</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-sm"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-sm"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-sm"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-bold">{success}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 -mx-8 px-8 mt-4 bg-gray-50/50 -mb-8 py-6">
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
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LockIcon className="w-4 h-4" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
