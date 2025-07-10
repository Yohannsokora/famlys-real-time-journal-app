const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JournalEntry",
        required: true
    },

    content: {
        type: String,
        required: true,
        trim: true
    },

    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",},
        type: {
            type: String
        }
    }],

    Timestamp: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Comment", commentSchema);