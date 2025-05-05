const mongoose = require('mongoose');

const PricingSettingsSchema = new mongoose.Schema({
  perPagePrice: { type: Number, required: true, default: 0.1 },
  colorPrice: { type: Number, required: true, default: 0.2 },
  bindingPrice: { type: Number, required: true, default: 5.0 },
  // Add any additional pricing fields here
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PricingSettings', PricingSettingsSchema); 