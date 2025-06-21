const Family = require('../models/Family');
const User = require('../models/User');
const {nanoid} = require('nanoid');

// Create a family group

exports.createFamily = async(req, res) => {
    try{

        // get family name
        const {name} = req.body;
        // unique 8-char inc=vite code
        const inviteCode = nanoid(8);

        const family = await Family.create(
            {   
                name,
                inviteCode,
                members: [req.user.id]
            }
        );

        await User.findByIdAndUpdate(req.user.id, {familyId: family._id});
        res.status(201).json({message: "Family Created!", family});

        // Notify other users (if listening)
        const io = req.app.get("io");
        io.emit("family:memberJoined", {familyId: family._id, userId: req.user.id});

    }
    catch(error){
        res.status(500).json({message: "Error creating family", error: error.message});
    }
};

// Join a Family Group using invite code

exports.joinFamily = async(req, res) => {

    try{
        const {inviteCode} = req.body;
        const family = await Family.findOne({inviteCode});

        if (!family)
            return res.status(404).json({message: "Family not found!"});

        if (family.members.includes(req.user.id))
            return res.status(400).json({message: "Already a member!"});

        family.members.push(req.user.id);
        await family.save();

        await User.findByIdAndUpdate(req.user.id, {familyId: family._id});

        res.status(200).json({message: "Joined family", family});

        const io = req.app.get("io");
        io.emit('family:memberJoined', { familyId: family._id, userId: req.user.id });
    }
    catch(error){
        res.status(500).json({message: "Error joining family", error: error.message});
    }

};

// Leave a family group

exports.leaveFamily = async(req, res) => {

    try{
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.familyId)
            return res.status(400).json({message: "User not in a family"});

        const family = await Family.findById(user.FamilyId);
        if (!family)
            return res.status(404).json({message: "Family not found"});

        // Remove user from members
        family.members = family.members.filter(member => member.toString() !== userId);
        await family.save();

        // Clear user's familyId
        user.familyId = null;
        await user.save();

        // Delete family if no members left
        if (family.members.length === 0){
            await Family.findByIdAndDelete (family._id);
        }

        res.status(200).json({message: "Left family successfully"});

        // Notify Others
        const io = req.app.get('io');
        io.emit('family:memberLeft', {familyId: family._id, userId });

    }
    catch(error){
        res.status(500).json({message: "Error leaving family", error: error.message});
    }

};