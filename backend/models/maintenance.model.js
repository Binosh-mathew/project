const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  isMaintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema); 