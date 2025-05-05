const PricingSettings = require('../models/PricingSettings');

// Get current pricing settings
exports.getPricingSettings = async (req, res) => {
  try {
    const settings = await PricingSettings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      // If no settings exist, create default settings
      const defaultSettings = await PricingSettings.create({});
      return res.json(defaultSettings);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing settings', error: error.message });
  }
};

// Update pricing settings
exports.updatePricingSettings = async (req, res) => {
  try {
    const { perPagePrice, colorPrice, bindingPrice } = req.body;
    
    // Create new settings document
    const newSettings = await PricingSettings.create({
      perPagePrice,
      colorPrice,
      bindingPrice
    });
    
    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pricing settings', error: error.message });
  }
}; 