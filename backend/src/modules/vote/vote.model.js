import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    voteHash: {
        type: String,
        required: true
    },
    candidateId: {
        type: Number,
        required: false
    },
    selectedCandidateIds: [{
        type: Number
    }],
    rankedCandidateIds: [{
        type: Number
    }],
    txHash: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    blockNumber: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Vote', VoteSchema);
