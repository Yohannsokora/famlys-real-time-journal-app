const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // Directory to save uploaded files
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname) // Unique filename
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    }
    
});

module.exports = upload;