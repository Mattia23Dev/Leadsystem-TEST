const mongoose = require('mongoose');

const TokenIndexSchema = new mongoose.Schema({
  index: {
    type: Number,
    default: 0,
  },
});

const TokenIndex = mongoose.model('TokenIndex', TokenIndexSchema);

module.exports = TokenIndex;