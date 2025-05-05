const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { authenticate } = require('../middleware/auth');

// File upload
router.post('/', authenticate, storageController.uploadFile);

// Get all files
router.get('/', authenticate, storageController.getFiles);

// Get file by ID
router.get('/:id', authenticate, storageController.getFileById);

// Delete file
router.delete('/:id', authenticate, storageController.deleteFile);

// Get storage info
router.get('/info', authenticate, storageController.getStorageInfo);

module.exports = router; 