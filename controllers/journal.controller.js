const JournalEntry = require('../models/JournalEntry.js');
const fs = require('fs');
const path = require('path');

// CREATE
const createJournalEntry = async (req, res) => {
  try {
    const { title, content, isPrivate, imageUrls } = req.body;
    const userId = req.user._id;

    const newEntry = new JournalEntry({
      userId,
      title,
      content,
      isPrivate,
      imageUrls: imageUrls || [],
    });

    await newEntry.save();
    res.status(201).json({ message: 'Journal entry created successfully', entry: newEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error creating journal entry', error: error.message });
  }
};

// READ ALL
const getAllEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
  }
};

// READ ONE
const getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journal entry', error: error.message });
  }
};

// UPDATE
const updateEntry = async (req, res) => {
  try {
    const { title, content, isPrivate, imageUrls } = req.body;
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, content, isPrivate, imageUrls },
      { new: true }
    );
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found or you do not have permission to update it' });
    }
    res.json({ message: 'Journal entry updated successfully', entry });
  } catch (error) {
    res.status(500).json({ message: 'Error updating journal entry', error: error.message });
  }
};

// DELETE
const deleteEntry = async (req, res) => {
  try {
    const deleted = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Journal entry not found or you do not have permission to delete it' });
    }
    // delete associated images if any entry is deleted
    if (deleted.imageUrls && deleted.imageUrls.length > 0){
        deleted.imageUrls.forEach((imgPath) => {
            const fullPath = path.join(__dirname, '../', imgPath);
            fs.unlink(fullPath, (error) => {
                if (error) {
                    console.error(`Error deleting image: ${imgPath}`, error.message);
                }
            });
        });
    }
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) { 
    res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
  }
};

// UPLOAD IMAGES
const uploadJournalImages = async (req, res) => {
  try {
    const imageUrls = req.files.map(file => `uploads/${file.filename}`);
    res.status(200).json({ message: 'Images uploaded successfully', imageUrls });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

// EXPORT EVERYTHING
module.exports = {
  createJournalEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  uploadJournalImages,
};
