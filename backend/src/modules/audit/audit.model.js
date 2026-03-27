import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    actor: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        name: String,
        role: String
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        index: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'WARNING'],
        default: 'SUCCESS',
        index: true
    },
    metadata: {
        ip: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Optimization: Index for common search patterns
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actionType: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
