const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  session: {
    type: Object,
    required: true,
  },
})
const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;