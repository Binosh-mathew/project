const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadFile } = require('../controllers/file.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/files
router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router; 