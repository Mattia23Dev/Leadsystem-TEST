const mongoose = require('mongoose');

const lastLeadUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const LastLeadUser = mongoose.model('LastLeadUser', lastLeadUserSchema);

module.exports = LastLeadUser;