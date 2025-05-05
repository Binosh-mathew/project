const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

exports.uploadFile = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const newFile = await File.create({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `/uploads/${file.filename}`,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: newFile
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id });
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files'
    });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file'
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '..', file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from database
    await File.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
};

exports.getStorageInfo = async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const totalSpace = 1000 * 1024 * 1024 * 1024; // 1TB in bytes
    let usedSpace = 0;

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        const stats = fs.statSync(path.join(uploadDir, file));
        usedSpace += stats.size;
      }
    }

    const freeSpace = totalSpace - usedSpace;
    const usagePercentage = (usedSpace / totalSpace) * 100;

    res.json({
      success: true,
      data: {
        totalSpace: totalSpace / (1024 * 1024 * 1024), // Convert to GB
        usedSpace: usedSpace / (1024 * 1024 * 1024), // Convert to GB
        freeSpace: freeSpace / (1024 * 1024 * 1024), // Convert to GB
        usagePercentage: Math.round(usagePercentage * 10) / 10,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting storage info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting storage info'
    });
  }
}; 