const mongoose = require("mongoose");

const familySchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        inviteCode: {type: String, required: true, unique: true},
        // Array of user references
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}]
    }
);

module.exports = mongoose.model("Family", familySchema);