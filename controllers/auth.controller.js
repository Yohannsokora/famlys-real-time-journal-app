// Import User model, bcrypt and jsonwebtoken
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get data from registration for and save the JSON in req.body

// POST / register
exports.registerUser = async(req, res) => {
    const{username, email, password} = req.body;

    try{

        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({message: "Email already in use!"});

        // hash password before saving it.
        const passwordHash = await bcrypt.hash(password, 11);
        // Create new user in Mongodb with the hash password
        const user = await User.create({ username, email, passwordHash});

        res.status(201).json({ message: "User registered!", userId: user._id});
    }
    
    catch (err){
        res.status(500).json({message: "Registration Failed! Please try again!", error: err.message})
    };
};

// POST /login
exports.loginUser = async(req, res) => {
    const{email, password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user)
            return res.status(400).json({message: "Invalid credentials"});

        const ismatch = await bcrypt.compare(password, user.passwordHash);
        if(!ismatch)
            return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1d",});
        res.status(200).json({token, user: {id: user._id, username: user.username}});
    }

    catch(err){
        res.status(500).json({message: "Login Failed", error: err.message});
    };
};