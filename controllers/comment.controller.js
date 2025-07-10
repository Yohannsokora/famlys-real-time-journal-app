const Comment = require("../models/Comment");
const { create } = require("../models/User");


// Create a new comment for a journal entry
exports.createComment = async (req, res) => {
    const{ content, parentCommentId } = req.body;
    const entryId = req.params._id;
    const userId = req.user._id;

    if (!content || !entryId) {
        return res.status(400).json({ message: "Content and entry ID are required" });
    }
    try {
        const comment = await Comment.create({
            userId,
            entryId,
            content,
            parentCommentId: parentCommentId || null,
        });

        // Real-time update: Notify the user about the new comment
        const io = req.app.get("io");
        if(!req.user.familyId) {
            return res.status(400).json({ message: "User does not belong to a family" });
        }
        io.to(req.user.familyId.toString()).emit("comment-added", comment);
        
        res.status(201).json({ message: "Comment created successfully", comment });
    } catch(error) {
        res.status(500).json({ message: "Error creating comment", error: error.message });
    }
    };

// GET all comments for a journal entry
exports.getEntryComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            entryId: req.params._id,
            parentCommentId: null // Only fetch top-level comments

    })
        .populate("userId", "username")
        .sort({createdAt: -1});

    res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};

// GET all replies for a specific comment
exports.getReplies = async (req, res) => {
    try{
        const replies = await Comment.find({
            parentCommentId: req.params.commentId
        })
        .populate("userId", "username")
        .sort({createdAt: -1});

        res.json(replies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching replies", error: error.message });
    }
};

// DELETE a comment
exports.deleteComment = async (req, res) => {
    const userId = req.user._id;
    const commentId = req.params.id;

    try{

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (!comment.userId.equals(userId)) {
            return res.status(403).json({ message: "You do not have permission to delete this comment" });
        }

        //Delete nested replies too
        await Comment.deleteMany({
            $or: [
                { _id: commentId },
                { parentCommentId: commentId }
            ]
        });

        // Emit a real-time event to notify users about the deletion
        const io = req.app.get("io");
        io.to(req.user.familyId.toString()).emit("comment-deleted", {
            deletedId: commentId,
        });

        res.json({ message: "Comment and any replies deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed deleting comment", error: error.message });
    }
};