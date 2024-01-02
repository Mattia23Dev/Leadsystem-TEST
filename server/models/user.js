const mongoose = require('mongoose');
const { Schema } = mongoose;
const Lead = require('./orientatori');

const userSchema = new Schema({
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
    enum: ["admin", "user"]
  },
  nameECP: {
    type: String,
    trim: true,
    required: true,
  },
  pIva: {
    type: String,
    trim: true,
    required: true,
    minlength: 11,
    maxlength: 11,
  },
  codeSdi: {
    type: String,
    trim: true,
    required: true,
    minlength: 7,
    maxlength: 7,
  },
  isChecked: {
    type: Boolean,
    required: true,
  },
  stripe_customer_id: String,
  subscriptions: [],
  leads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  city: {
    type: String,
  },
  cap: {
    type: String,
  },
  stato: {
    type: String,
  },
  via: {
    type: String,
  },
  emailLegale: {
    type: String,
  },
  legaleResponsabile: {
    type: String,
  },
  passwordResetCode: {
    type: String,
  },
  codeVerifyEmail: {
    type: String,
  },
  monthlyLeadCounter: {
    type: Number,
    default: 0,
  },
  dailyCap: {
    type: Number,
    default: 10,
  },
  dailyLead: {
    type: Number,
    default: 0,
  },
  monthlyLeadFix: {
    type: Number,
    required: true,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  saltaAbbonamento: {
    type: String,
    default: "no",
  },
  emailNotification: {
    type: String,
  },
  notificationsEnabled: { type: Boolean, default: false },
  notificationSubscriptions: [{ 
    type: Object,
    default: null,
  }],
  rating: {type: Number, default: 0},
  note: String,
  tag: {type: String, default: "pegaso"},
});

module.exports = mongoose.model("User", userSchema);
