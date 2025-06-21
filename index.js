// Import Packages
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const familyRoutes = require("./routes/family.routes");

// Loads .env file to access secrets
dotenv.config();

// app(express API), server wraps it with http server so socket.io can work
// io (real time socket)
const app = express();
const server = http.createServer(app);
const io = new Server(
    server,
    {
        cors:{origin: "*"}
    }
);

// Attach Socket.IO instance to Express app for controller access
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/family", familyRoutes);

// Test route
app.get("/",(req, res) => {res.send("Famlys App is running");})


// Connect to MongoDB
mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=> console.log("MongoDB connected!"))
    .catch(err => console.error("MongoDB error:", err));

// Socket.IO connection
io.on(
    "connection",
    (socket) => {

        console.log("User connected:", socket.id);

        socket.on(
            "disconnect",
            () => console.log("User disconnected:", socket.id)         
        );
    }
);


// Start the server
const PORT = process.env.PORT || 5001;

server.listen(
    PORT,
    () => {console.log(`Server listening on http://localhost:${PORT}`);
});