import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    User as UserIcon,
    Mail,
    Shield,
    Calendar,
    Camera,
    Save,
    Loader2,
    CheckCircle2,
    Activity,
    Clock,
    Award
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ChangePasswordModal from '../../voter/components/Modals/ChangePasswordModal';

const InfoCard = ({ icon: Icon, label, value, color = 'indigo' }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminProfile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        photoUrl: user?.photoUrl || ''
    });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                if (res.data.success) {
                    const u = res.data.data;
                    setFormData({
                        name: u.name,
                        email: u.email,
                        photoUrl: u.photoUrl || ''
                    });
                }
            } catch (err) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/users/profile', {
                name: formData.name,
                email: formData.email
            });
            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.user };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile updated successfully');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('avatar', file);

        setSaving(true);
        try {
            const res = await api.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.user };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setFormData({ ...formData, photoUrl: res.data.user.photoUrl });
                toast.success('Photo updated');
            }
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <UserIcon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
                        <p className="text-gray-500 mt-1">Manage your personal information and account status.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-blue-600 opacity-10"></div>

                        <div className="relative mt-8">
                            <div className="w-32 h-32 bg-indigo-50 rounded-[48px] overflow-hidden mx-auto border-4 border-white shadow-xl relative group-hover:scale-105 transition-transform duration-500">
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-indigo-600 flex items-center justify-center h-full">
                                        {formData.name?.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-1/2 translate-x-12 p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-2xl shadow-lg border border-gray-100 text-indigo-600 transition-all active:scale-95"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-xl font-black text-gray-900 leading-tight">{formData.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{formData.email}</p>
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                                    {user?.role}
                                </span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100">
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <Shield className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                        <div className="relative z-10">
                            <Award className="w-10 h-10 mb-4 opacity-50" />
                            <h4 className="text-xl font-bold mb-2">System Authority</h4>
                            <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                                You have absolute control over the National Election System. Use your powers with integrity and transparency.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Fields */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            Profile Details
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoCard
                            icon={Calendar}
                            label="Member Since"
                            value={new Date(user?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                        <InfoCard
                            icon={Clock}
                            label="Last Activity"
                            value={new Date().toLocaleTimeString()}
                            color="blue"
                        />
                    </div>

                    <div className="p-8 bg-amber-50 border border-amber-100 rounded-[32px] flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-900">Security Recommendation</h4>
                            <p className="text-xs text-amber-700 mt-1 leading-relaxed font-medium">
                                Regularly update your password and ensure your email is secure. Two-factor authentication is automatically enforced for your protection.
                            </p>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="mt-4 px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>

                    <ChangePasswordModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
