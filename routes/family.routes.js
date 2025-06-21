const express = require('express');
const router = express.Router();

const {createFamily, joinFamily, leaveFamily} = require('../controllers/family.controller');

const verifyToken = require('../middleware/authMiddleware');

// Create a new family
router.post('/create', verifyToken, createFamily);

// Join existing family by invite code
router.post('/join', verifyToken, joinFamily);

// Leave the current family
router.post('/leave', verifyToken, leaveFamily);

module.exports = router;