const User = require("../models/User");

module.exports = (io) => {
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // User joins with userId
        socket.on("join", async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user || !user.familyId)
                return socket.disconnect(true);
            
            // Join the user to a room based on familyId
            socket.join(user.familyId.toString());
            onlineUsers.set(socket.id, { userId, familyId: user.familyId.toString() });

            // Notify family members that the user has joined
            socket.to(user.familyId.toString()).emit("user-online", { userId, familyId: user.familyId.toString() });
            console.log(`User ${userId} joined family ${user.familyId}`);

        } catch (error) {
            console.error("Error joining user:", error);
            socket.emit("joined", { success: false, message: "Failed to join" });
        }
    });

        // Chat message event
        socket.on("chat-message", ({ senderId, recipientId, message}) => {
            const userData = onlineUsers.get(socket.id);
            if (!userData || !message?.trim())
                return socket.emit("chat-message-error", { message: "Invalid user or message" });
            io.to(userData.familyId).emit("chat-message", {
                senderId,
                recipientId,
                message,
                timestamp: new Date().toISOString()
            });
        });

        // Typing indicator event
        socket.on("typing", (data) => {
            const userData = onlineUsers.get(socket.id);
            if (!userData)
                return socket.emit("typing-error", { message: "User not found" });
            socket.to(userData.familyId).emit("typing", data);
        });

        // User disconnects
        socket.on("disconnect", () => {
            const userData = onlineUsers.get(socket.id);
            if (userData) {
                socket.to(userData.familyId).emit("user-offline", userData.userId);
                onlineUsers.delete(socket.id);
                console.log("User disconnected:", userData.userId);
            }
            else {
                console.log("User disconnected:", socket.id);
            }   
        });

    });
};