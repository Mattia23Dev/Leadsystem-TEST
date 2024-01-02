const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadPaymentWaiting = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      numLeads: {
        type: Number,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      userSessionId: {
        type: String, 
        required: true,
      },
  });
  
const LeadPaymentWaiting = mongoose.model('LeadPaymentWaiting', leadPaymentWaiting);

module.exports = LeadPaymentWaiting ;