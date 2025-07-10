const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journal.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/', authMiddleware, journalController.createJournalEntry);
router.get('/', authMiddleware, journalController.getAllEntries);
router.get('/:id', authMiddleware, journalController.getEntryById);
router.put('/:id', authMiddleware, journalController.updateEntry);
router.delete('/:id', authMiddleware, journalController.deleteEntry);

router.post(
    '/upload',
    authMiddleware,
    upload.array('images', 5), // Allow up to 5 images
    journalController.uploadJournalImages
);

module.exports = router;