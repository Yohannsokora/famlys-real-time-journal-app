const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const verifyToken = require("../middleware/auth.middleware");

// Create comment or reply to a comment
router.post("/entry/:_id/comment", verifyToken, commentController.createComment);

// Get root comments for a journal entry
router.get("/entry/:_id/comments", verifyToken, commentController.getEntryComments);

// Get replies to a comment
router.get("/comment/:id/replies", verifyToken, commentController.getReplies);

// Delete a comment
router.delete("/comment/:id", verifyToken, commentController.deleteComment);

module.exports = router;
