import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'ELECTION_STARTED',
            'ELECTION_PAUSED',
            'ELECTION_RESUMED',
            'ELECTION_ENDED',
            'VOTE_SUCCESS',
            'VOTE_CAST',
            'ELECTION_JOINED',
            'ADMIN_ADDED'
        ],
        required: true
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
