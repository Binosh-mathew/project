const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update store's total orders and monthly revenue when order is created
OrderSchema.post('save', async function() {
  try {
    const Store = mongoose.model('Store');
    const store = await Store.findById(this.storeId);
    
    if (store) {
      store.totalOrders += 1;
      store.monthlyRevenue += this.totalAmount;
      await store.save();
    }
  } catch (error) {
    console.error('Error updating store statistics:', error);
  }
});

module.exports = mongoose.model('Order', OrderSchema); 