const File = require('../models/File');

// @desc    Upload a file
// @route   POST /api/files
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileDoc = await File.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploader: req.user ? req.user._id : undefined
    });

    res.status(201).json({
      success: true,
      data: fileDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
}; 