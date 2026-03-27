import mongoose from 'mongoose';


// Settings Schema
const SettingsSchema = new mongoose.Schema({
    systemName: { type: String, default: 'Votify' },
    maintenanceMode: { type: Boolean, default: false },
    allowPublicRegistration: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
    maxConcurrentElections: { type: Number, default: 10 },
    twoFactorAuthentication: { type: Boolean, default: true },
    publicVisibility: { type: Boolean, default: true },
    automatedResultCalculation: { type: Boolean, default: false },
    blindVotingMode: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 30 },
    suspiciousActivityAlerts: { type: Boolean, default: true },
    voterRegistrationUpdates: { type: Boolean, default: false },
    systemHealthSummaries: { type: Boolean, default: true },
    dailyAuditReports: { type: Boolean, default: true }
}, { timestamps: true });

export const Settings = mongoose.model('Settings', SettingsSchema);

export default { Settings };
