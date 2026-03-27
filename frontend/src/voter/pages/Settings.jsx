import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    Settings as SettingsIcon,
    Shield,
    Bell,
    User as UserIcon,
    Mail,
    Lock,
    Eye,
    Globe,
    Save,
    CheckCircle2,
    Loader2,
    ChevronDown,
    ChevronUp,
    Camera,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';

const SettingsCard = ({ icon: Icon, title, description, children, danger, loading }) => (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm ${danger ? 'border-red-50 dark:border-red-900/20' : ''} relative transition-colors`}>
        {loading && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-3xl">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        )}
        <div className="flex items-start justify-between mb-8">
            <div className="flex gap-4">
                <div className={`p-3 rounded-2xl ${danger ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${danger ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                </div>
            </div>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SettingItem = ({ label, description, type = 'toggle', active, onToggle, inputType, value, onChange, placeholder }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex-1 pr-6">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</p>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
        {type === 'toggle' ? (
            <div
                onClick={onToggle}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-gray-100 rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
            </div>
        ) : type === 'input' ? (
            <input
                type={inputType || 'text'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-48 sm:w-64 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-gray-200 dark:placeholder-gray-500 transition-all flex-shrink-0"
            />
        ) : null}
    </div>
);

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [settings, setSettings] = useState({
        displayName: user?.name || '',
        email: user?.email || '',
        photoUrl: user?.photoUrl || '',
        notifyNewElections: true,
        notifyResultsReady: true,
        notifyVoteConfirmations: true,
        publicProfile: false,
        electionNotifications: []
    });

    const [myElections, setMyElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isElectionNotifsOpen, setIsElectionNotifsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [electionsRes, profileRes] = await Promise.all([
                    api.get('/elections/my'),
                    api.get('/users/me')
                ]);

                if (electionsRes.data.success) {
                    const { joined, created } = electionsRes.data.data;
                    // Merge and remove duplicates if any
                    const combined = [...created];
                    const createdIds = new Set(created.map(e => e._id));
                    joined.forEach(e => {
                        if (!createdIds.has(e._id)) {
                            combined.push(e);
                        }
                    });
                    setMyElections(combined);
                }

                if (profileRes.data.success) {
                    const u = profileRes.data.data;
                    setSettings(prev => ({
                        ...prev,
                        displayName: u.name,
                        email: u.email,
                        photoUrl: u.photoUrl || '',
                        notifyNewElections: u.settings?.notifyNewElections ?? true,
                        notifyResultsReady: u.settings?.notifyResultsReady ?? true,
                        notifyVoteConfirmations: u.settings?.notifyVoteConfirmations ?? true,
                        publicProfile: u.publicProfile ?? false,
                        electionNotifications: u.settings?.electionNotifications || []
                    }));
                }
            } catch (err) {
                console.error('Fetch settings error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggle = async (key, isElection = false, electionId = null) => {
        try {
            if (isElection) {
                const currentVal = settings.electionNotifications.find(n => n.electionId === electionId)?.enabled ?? true;
                const newVal = !currentVal;

                await api.put(`/users/notifications/election/${electionId}`, { enabled: newVal });

                setSettings(prev => ({
                    ...prev,
                    electionNotifications: prev.electionNotifications.some(n => n.electionId === electionId)
                        ? prev.electionNotifications.map(n => n.electionId === electionId ? { ...n, enabled: newVal } : n)
                        : [...prev.electionNotifications, { electionId, enabled: newVal }]
                }));
            } else {
                const newVal = !settings[key];
                setSettings(prev => ({ ...prev, [key]: newVal }));

                if (key === 'publicProfile') {
                    await api.put('/users/profile', { publicProfile: newVal });
                } else {
                    await api.put('/users/notifications', { [key]: newVal });
                }
            }
            setLastSaved(new Date().toLocaleTimeString());
            setTimeout(() => setLastSaved(null), 3000);
        } catch (err) {
            console.error('Toggle error:', err);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setSaving(true);
        try {
            const res = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.user };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setSettings(prev => ({ ...prev, photoUrl: res.data.user.photoUrl }));
                setLastSaved(new Date().toLocaleTimeString());
                setTimeout(() => setLastSaved(null), 3000);
            }
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert('Failed to upload avatar');
        } finally {
            setSaving(false);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await api.put('/users/profile', {
                name: settings.displayName,
                email: settings.email
            });

            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.user };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setLastSaved(new Date().toLocaleTimeString());
                setTimeout(() => setLastSaved(null), 3000);
            }
        } catch (err) {
            console.error('Save profile error:', err);
            alert(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
                        <SettingsIcon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile, preferences, and notifications.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {lastSaved && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-right-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved {lastSaved}
                        </div>
                    )}
                    <button
                        onClick={saveProfile}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Profile Section */}
                    <SettingsCard
                        icon={UserIcon}
                        title="Personal Information"
                        description="Update your basic profile information."
                        loading={loading}
                    >
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-indigo-50 rounded-[32px] overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                                    {settings.photoUrl ? (
                                        <img src={settings.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-indigo-600">{settings.displayName?.charAt(0)}</span>
                                    )}
                                </div>
                                <button
                                    onClick={handleAvatarClick}
                                    className="absolute -bottom-2 -right-2 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-lg border border-gray-100 text-indigo-600 transition-all hover:scale-110 active:scale-95"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900">{settings.displayName}</h4>
                                <p className="text-sm text-gray-500">{settings.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <SettingItem
                                label="Display Name"
                                description="How your name appears to others in elections."
                                type="input"
                                value={settings.displayName}
                                onChange={(e) => handleChange('displayName', e.target.value)}
                            />
                            <SettingItem
                                label="Email Address"
                                description="Primary email for notifications and recovery."
                                type="input"
                                inputType="email"
                                value={settings.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                    </SettingsCard>

                    {/* Privacy & Security Section */}
                    <SettingsCard
                        icon={Shield}
                        title="Privacy & Security"
                        description="Manage your account security and visibility."
                        loading={loading}
                    >
                        <SettingItem
                            label="Public Profile"
                            description="Allow other users in the system to find your profile."
                            active={settings.publicProfile}
                            onToggle={() => handleToggle('publicProfile')}
                        />
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                            >
                                <span className="text-sm font-bold text-gray-700">Change Password</span>
                                <Lock className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </button>
                        </div>
                    </SettingsCard>

                    {/* Danger Zone */}
                    <SettingsCard
                        icon={Globe}
                        title="Data & Account"
                        description="Manage your data or permanently delete your account."
                        danger
                        loading={loading}
                    >
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-6">
                            <p className="text-xs text-red-700 leading-relaxed font-medium">
                                Actioning these items may result in permanent loss of your data or voting history.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-red-200">
                                Delete Account
                            </button>
                        </div>
                    </SettingsCard>
                </div>

                <div className="space-y-8">
                    {/* Notifications Section */}
                    <SettingsCard
                        icon={Bell}
                        title="Notifications"
                        description="Control when and how you receive alerts."
                        loading={loading}
                    >
                        <SettingItem
                            label="New Elections"
                            description="Get notified when you are invited to a new election."
                            active={settings.notifyNewElections}
                            onToggle={() => handleToggle('notifyNewElections')}
                        />
                        <SettingItem
                            label="Vote Confirmations"
                            description="Receive an email receipt when your vote is cast."
                            active={settings.notifyVoteConfirmations}
                            onToggle={() => handleToggle('notifyVoteConfirmations')}
                        />
                        <SettingItem
                            label="Results Available"
                            description="Get alerted when an election you participated in concludes."
                            active={settings.notifyResultsReady}
                            onToggle={() => handleToggle('notifyResultsReady')}
                        />

                        {/* Election Notifications Accordion */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    console.log('Toggling Election Notifications. Current:', isElectionNotifsOpen);
                                    setIsElectionNotifsOpen(!isElectionNotifsOpen);
                                }}
                                className="w-full flex items-center justify-between group py-2"
                            >
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Election notifications</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">These settings apply to your email notifications for each election</p>
                                </div>
                                <div className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                    {isElectionNotifsOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isElectionNotifsOpen && (
                                    <motion.div
                                        key="election-notifs-content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden mt-6 space-y-4"
                                    >
                                        {(myElections || []).length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">No elections found in your workspace.</p>
                                        ) : (
                                            (myElections || []).map(election => {
                                                const isEnabled = (settings.electionNotifications || []).find(n => n.electionId === election._id)?.enabled ?? true;
                                                return (
                                                    <div key={election._id} className="flex items-center justify-between group px-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-100 bg-indigo-600`}>
                                                                {election.title?.charAt(0)}
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-700">{election.title}</p>
                                                        </div>
                                                        <div
                                                            onClick={() => handleToggle(null, true, election._id)}
                                                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                        >
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </SettingsCard>
                </div>
            </div>
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default Settings;
