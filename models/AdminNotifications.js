import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({
    type: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    postOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    }
});

const AdminNotifications = mongoose.model('AdminNotifications', adminNotificationSchema); 

export default AdminNotifications; 
