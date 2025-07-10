const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    imageUrls: [{
        type: String,
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'}],

    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('JournalEntry', journalEntrySchema);