import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Shield,
    Key,
    Lock,
    Bell,
    Globe,
    AlertTriangle,
    ChevronRight,
    Loader2,
    Save,
    CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';

const SettingsCard = ({ icon: Icon, title, description, children, danger, loading }) => (
    <div className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm ${danger ? 'border-red-50' : ''} relative`}>
        {loading && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-3xl">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        )}
        <div className="flex items-start justify-between mb-8">
            <div className="flex gap-4">
                <div className={`p-3 rounded-2xl ${danger ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${danger ? 'text-red-900' : 'text-gray-900'}`}>{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
            </div>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SettingItem = ({ label, description, type = 'toggle', active, onToggle }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="text-sm font-bold text-gray-800">{label}</p>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        {type === 'toggle' ? (
            <div
                onClick={onToggle}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
            </div>
        ) : (
            <ChevronRight className="w-4 h-4 text-gray-300" />
        )}
    </div>
);

const Settings = () => {
    const [settings, setSettings] = useState({
        publicVisibility: true,
        automatedResultCalculation: false,
        blindVotingMode: true,
        twoFactorAuthentication: true,
        sessionTimeout: 30,
        suspiciousActivityAlerts: true,
        voterRegistrationUpdates: false,
        systemHealthSummaries: true,
        dailyAuditReports: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                if (response.data) {
                    setSettings(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings', settings);
            setLastSaved(new Date().toLocaleTimeString());
            setTimeout(() => setLastSaved(null), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handlePauseElection = async () => {
        const newState = !settings.maintenanceMode;
        if (window.confirm(`Are you sure you want to ${newState ? 'PAUSE' : 'RESUME'} all election activities? This will affect the entire system.`)) {
            setSaving(true);
            try {
                await api.post('/admin/settings', { ...settings, maintenanceMode: newState });
                setSettings(prev => ({ ...prev, maintenanceMode: newState }));
                setLastSaved(new Date().toLocaleTimeString());
                setTimeout(() => setLastSaved(null), 3000);
            } catch (error) {
                console.error('Error pausing election:', error);
                alert('Failed to update system state');
            } finally {
                setSaving(false);
            }
        }
    };

    const handleTransferOwnership = async () => {
        const email = window.prompt("Enter the email address of the new administrator. WARNING: You will lose administrative access.");
        if (!email) return;

        if (window.confirm(`TRANSFER OWNERSHIP to ${email}? This action is IRREVERSIBLE.`)) {
            setSaving(true);
            try {
                const res = await api.post('/admin/transfer-ownership', { email });
                alert(res.data.message);
                window.location.reload(); // Force logout/re-fetch
            } catch (error) {
                alert(error.response?.data?.message || 'Transfer failed');
            } finally {
                setSaving(false);
            }
        }
    };


    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <SettingsIcon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                        <p className="text-gray-500 mt-1">Configure global election parameters and administrative security.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {lastSaved && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved {lastSaved}
                        </div>
                    )}
                    <button
                        onClick={saveSettings}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <SettingsCard
                        icon={Globe}
                        title="Election Control"
                        description="Manage visibility and automated behaviors of the current cycle."
                        loading={loading}
                    >
                        <SettingItem
                            label="Public Visibility"
                            description="Allow voters to see this election in their dashboard."
                            active={settings.publicVisibility}
                            onToggle={() => handleToggle('publicVisibility')}
                        />
                        <SettingItem
                            label="Automated Result Calculation"
                            description="Publish results as soon as the voting window closes."
                            active={settings.automatedResultCalculation}
                            onToggle={() => handleToggle('automatedResultCalculation')}
                        />
                        <SettingItem
                            label="Blind Voting Mode"
                            description="Hide live results from voters until election ends."
                            active={settings.blindVotingMode}
                            onToggle={() => handleToggle('blindVotingMode')}
                        />
                    </SettingsCard>

                    <SettingsCard
                        icon={Shield}
                        title="Security & Access"
                        description="Protect administrative controls and set authentication policies."
                        loading={loading}
                    >
                        <SettingItem
                            label="Admin Two-Factor Authentication (2FA)"
                            description="Enable email verification for admin logins. (Voters and Owners always require verification)."
                            active={settings.twoFactorAuthentication}
                            onToggle={() => handleToggle('twoFactorAuthentication')}
                        />
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Session Timeout</p>
                                <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity (minutes).</p>
                            </div>
                            <input
                                type="number"
                                className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                            />
                        </div>
                    </SettingsCard>
                </div>

                <div className="space-y-8">
                    <SettingsCard
                        icon={Bell}
                        title="Notifications"
                        description="Manage alerts for system events and suspicious activities."
                        loading={loading}
                    >
                        <SettingItem
                            label="Suspicious Activity Alerts"
                            active={settings.suspiciousActivityAlerts}
                            onToggle={() => handleToggle('suspiciousActivityAlerts')}
                        />
                        <SettingItem
                            label="Voter Registration Updates"
                            active={settings.voterRegistrationUpdates}
                            onToggle={() => handleToggle('voterRegistrationUpdates')}
                        />
                        <SettingItem
                            label="System Health Summaries"
                            active={settings.systemHealthSummaries}
                            onToggle={() => handleToggle('systemHealthSummaries')}
                        />
                        <SettingItem
                            label="Daily Audit Reports"
                            active={settings.dailyAuditReports}
                            onToggle={() => handleToggle('dailyAuditReports')}
                        />
                    </SettingsCard>

                    <SettingsCard
                        icon={AlertTriangle}
                        title="Danger Zone"
                        description="Irreversible actions that affect the entire system existence."
                        danger
                        loading={loading}
                    >
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                            <div className="flex gap-3">
                                <Lock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 leading-relaxed font-medium">
                                    Performing these actions will result in data loss or permanent chain modifications. Use with extreme caution.
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={handlePauseElection}
                            className={`flex items-center justify-between py-2 cursor-pointer group hover:opacity-80 transition-opacity`}
                        >
                            <div>
                                <p className="text-sm font-bold text-gray-800">Pause Election</p>
                                <p className="text-xs text-gray-500 mt-1">Temporarily stop all voting activities.</p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${settings.maintenanceMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                {settings.maintenanceMode ? 'Paused' : 'Active'}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleTransferOwnership}
                                className="w-full py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                Transfer Ownership
                            </button>
                        </div>
                    </SettingsCard>
                </div>
            </div>
        </div>
    );
};

export default Settings;
