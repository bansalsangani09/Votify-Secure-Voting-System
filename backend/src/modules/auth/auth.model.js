import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String }, // Not required for Google-only login
    googleId: { type: String, unique: true, sparse: true },
    authProviders: [{ type: String, enum: ['local', 'google'], default: ['local'] }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
    ownerStatus: { type: String, enum: ['new', 'verified', 'restricted', 'suspended'], default: 'new' },
    successfulElections: { type: Number, default: 0 },
    photoUrl: { type: String },
    lastLogin: { type: Date },
    lastActive: { type: Date },
    isSuspicious: { type: Boolean, default: false },
    statusChangedAt: { type: Date, default: Date.now },
    suspendedAt: { type: Date },
    inactiveAt: { type: Date },
    suspendedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],
    publicProfile: { type: Boolean, default: false },
    settings: {
        notifyNewElections: { type: Boolean, default: true },
        notifyResultsReady: { type: Boolean, default: true },
        notifyVoteConfirmations: { type: Boolean, default: true },
        electionNotifications: [{
            electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
            enabled: { type: Boolean, default: true }
        }]
    },
    joinedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],
    votedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],
    statusHistory: [{
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        previousStatus: String
    }]
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
