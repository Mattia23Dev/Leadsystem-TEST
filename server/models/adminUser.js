const mongoose = require('mongoose');
const { Schema } = mongoose;

const userAdminSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 64,
  },
  role: {
    type: String,
    enum: ["admin"]
  },
  stripe_customer_id: String,
  paymentSessions: [{
    idAdminSession: String,
    sessionUrl: String,
    halfPrice: Number,
    idUserSession: String,
  }]
});

module.exports = mongoose.model("AdminUser", userAdminSchema);