import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    partyName: { type: String, required: false },
    bio: String,
    photoUrl: String,
    position: String,
    email: String,
    voteCount: { type: Number, default: 0 }
});

const ElectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    position: String,
    category: { type: String, default: 'Organization' },

    type: { type: String, enum: ['public', 'private'], default: 'private' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: String,
    endTime: String,
    resultTime: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'active', 'paused', 'closed'], default: 'draft' },
    votingType: { type: String, default: 'Single Choice' },
    maxVotes: { type: Number, default: 1 },
    anonymous: { type: Boolean, default: true },
    autoActivate: { type: Boolean, default: true },
    autoClose: { type: Boolean, default: true },
    allowRevote: { type: Boolean, default: false },
    liveResultsEnabled: { type: Boolean, default: false },
    publicResultsVisible: { type: Boolean, default: false },

    candidates: [CandidateSchema],
    joinCode: { type: String, required: true, unique: true },
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isHidden: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now }
    }],
    admins: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'co-owner'], default: 'owner' },
        isHidden: { type: Boolean, default: false }
    }],
    blockchainId: String,
    contractAddress: String,
    blockchainIntegrated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Election', ElectionSchema);
